-- M4: Launch File exports and the Last Mile Fund (docs/architecture.md §3, §4.5, §4.6; PRD §6.10–6.11).

create type public.fund_category as enum
  ('certification_fee', 'background_check', 'interview_travel', 'deposit', 'relocation', 'other');
create type public.fund_status as enum ('submitted', 'in_review', 'needs_info', 'approved', 'declined');

-- ---------------------------------------------------------------------------
-- Fund settings: one row, staff-configurable. Defaults match the deck's $2,500 fund and $250 cap.
-- ---------------------------------------------------------------------------
create table public.fund_settings (
  id boolean primary key default true check (id),
  request_cap_cents int not null default 25000 check (request_cap_cents > 0),
  total_budget_cents int not null default 250000 check (total_budget_cents >= 0),
  updated_at timestamptz not null default now()
);
insert into public.fund_settings default values;

create table public.fund_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  category public.fund_category not null,
  amount_cents int not null check (amount_cents > 0 and amount_cents % 100 = 0),
  next_step text not null check (char_length(next_step) between 5 and 200),
  justification text not null check (char_length(justification) between 50 and 1000),
  document_path text check (char_length(document_path) <= 300),
  needed_by date not null,
  status public.fund_status not null default 'submitted',
  rubric jsonb,
  reviewer_id uuid references public.profiles (id),
  reviewer_notes text check (char_length(reviewer_notes) <= 1000),
  submitted_at timestamptz not null default now(),
  decided_at timestamptz,
  updated_at timestamptz not null default now()
);
-- One open request per student (PRD US-FUND-1 AC4).
create unique index fund_requests_one_open on public.fund_requests (student_id)
  where status in ('submitted', 'in_review', 'needs_info');
create index fund_requests_queue on public.fund_requests (status, submitted_at);

create trigger fund_requests_touch before update on public.fund_requests
  for each row execute function app.touch_updated_at();

-- Every Launch File PDF export, with a snapshot of what it contained.
create table public.launch_files (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  snapshot jsonb not null,
  exported_at timestamptz not null default now()
);
create index launch_files_student on public.launch_files (student_id, exported_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security. Fund requests are written only through the RPCs below.
-- ---------------------------------------------------------------------------
alter table public.fund_settings enable row level security;
alter table public.fund_requests enable row level security;
alter table public.launch_files enable row level security;

create policy "fund settings are readable" on public.fund_settings for select to authenticated using (true);
create policy "read own fund requests" on public.fund_requests for select to authenticated
  using (student_id = (select auth.uid()) or (select app.is_staff()));
create policy "read own launch files" on public.launch_files for select to authenticated
  using (student_id = (select auth.uid()) or (select app.is_staff()));
create policy "record own launch file export" on public.launch_files for insert to authenticated
  with check (student_id = (select auth.uid()));

revoke all on public.fund_settings, public.fund_requests, public.launch_files from anon;

-- Supporting documents: private; students upload into their own folder, staff can read.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('fund-docs', 'fund-docs', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "read own fund docs" on storage.objects for select to authenticated using (
  bucket_id = 'fund-docs'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app.is_staff()))
);
create policy "upload own fund docs" on storage.objects for insert to authenticated with check (
  bucket_id = 'fund-docs' and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------
create function app.check_fund_request(p_amount_cents int, p_document_path text) returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if p_amount_cents > (select request_cap_cents from public.fund_settings) then
    raise exception 'That''s more than the per-request cap.' using errcode = 'P0001';
  end if;
  if p_document_path is not null
     and split_part(p_document_path, '/', 1) <> (select auth.uid())::text then
    raise exception 'That document doesn''t belong to you.' using errcode = '42501';
  end if;
end;
$$;

-- A student submits a request. Students only, one open at a time.
create function public.submit_fund_request(
  p_category public.fund_category, p_amount_cents int, p_next_step text, p_justification text,
  p_needed_by date, p_document_path text default null
) returns public.fund_requests
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.fund_requests;
begin
  if (select app.current_user_role()) <> 'student' then
    raise exception 'Only students can request funds.' using errcode = '42501';
  end if;
  perform app.check_fund_request(p_amount_cents, p_document_path);
  insert into public.fund_requests
    (student_id, category, amount_cents, next_step, justification, needed_by, document_path)
  values ((select auth.uid()), p_category, p_amount_cents, trim(p_next_step), trim(p_justification),
    p_needed_by, p_document_path)
  returning * into v_row;
  insert into public.audit_log (actor_id, action, entity, entity_id, diff)
  values ((select auth.uid()), 'fund.submitted', 'fund_requests', v_row.id::text,
    jsonb_build_object('amount_cents', p_amount_cents, 'category', p_category));
  return v_row;
exception when unique_violation then
  raise exception 'You already have an open request.' using errcode = 'P0001';
end;
$$;

-- A student answers "needs info": edits the request and sends it back for review.
create function public.resubmit_fund_request(
  p_id uuid, p_category public.fund_category, p_amount_cents int, p_next_step text,
  p_justification text, p_needed_by date, p_document_path text default null
) returns public.fund_requests
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.fund_requests;
begin
  perform app.check_fund_request(p_amount_cents, p_document_path);
  update public.fund_requests
  set category = p_category, amount_cents = p_amount_cents, next_step = trim(p_next_step),
    justification = trim(p_justification), needed_by = p_needed_by,
    document_path = coalesce(p_document_path, document_path), status = 'submitted'
  where id = p_id and student_id = (select auth.uid()) and status = 'needs_info'
  returning * into v_row;
  if v_row.id is null then
    raise exception 'This request can only be edited when staff ask for more information.'
      using errcode = 'P0001';
  end if;
  insert into public.audit_log (actor_id, action, entity, entity_id, diff)
  values ((select auth.uid()), 'fund.resubmitted', 'fund_requests', p_id::text,
    jsonb_build_object('amount_cents', p_amount_cents));
  return v_row;
end;
$$;

-- Approved spending so far, for the remaining balance.
create function public.fund_balance()
returns table (total_cents int, approved_cents int, remaining_cents int, request_cap_cents int)
language sql stable security definer set search_path = '' as $$
  select s.total_budget_cents,
    coalesce(sum(r.amount_cents), 0)::int,
    (s.total_budget_cents - coalesce(sum(r.amount_cents), 0))::int,
    s.request_cap_cents
  from public.fund_settings s
  left join public.fund_requests r on r.status = 'approved'
  group by s.total_budget_cents, s.request_cap_cents
$$;

-- Staff decide. The same four-item rubric for everyone must be answered first, a note is
-- required, approvals can't exceed the remaining balance, and every decision is audited.
create function public.decide_fund_request(
  p_id uuid, p_status public.fund_status, p_rubric jsonb, p_note text
) returns public.fund_requests
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.fund_requests;
  v_from public.fund_status;
  v_items text[] := array['next_step', 'documented', 'within_cap', 'no_other_source'];
  v_item text;
begin
  if not (select app.is_staff()) then
    raise exception 'Only staff can review fund requests.' using errcode = '42501';
  end if;
  if p_status not in ('in_review', 'needs_info', 'approved', 'declined') then
    raise exception 'Unknown decision.' using errcode = 'P0001';
  end if;
  if nullif(trim(p_note), '') is null then
    raise exception 'Add a note explaining the decision.' using errcode = 'P0001';
  end if;
  foreach v_item in array v_items loop
    if jsonb_typeof(p_rubric -> v_item) is distinct from 'boolean' then
      raise exception 'Complete the rubric before deciding.' using errcode = 'P0001';
    end if;
    if p_status = 'approved' and not (p_rubric ->> v_item)::boolean then
      raise exception 'Every rubric item must be met to approve.' using errcode = 'P0001';
    end if;
  end loop;

  select * into v_row from public.fund_requests where id = p_id for update;
  if v_row.id is null then
    raise exception 'Request not found.' using errcode = 'P0002';
  end if;
  v_from := v_row.status;
  if v_from in ('approved', 'declined') then
    raise exception 'This request has already been decided.' using errcode = 'P0001';
  end if;
  -- Serialize approvals so two reviewers can't overspend the fund together.
  if p_status = 'approved' then
    perform 1 from public.fund_settings for update;
    if v_row.amount_cents > (select remaining_cents from public.fund_balance()) then
      raise exception 'Approving this would exceed the remaining fund balance.' using errcode = 'P0001';
    end if;
  end if;

  update public.fund_requests
  set status = p_status, rubric = p_rubric, reviewer_id = (select auth.uid()),
    reviewer_notes = trim(p_note),
    decided_at = case when p_status in ('approved', 'declined') then now() end
  where id = p_id
  returning * into v_row;
  insert into public.audit_log (actor_id, action, entity, entity_id, diff)
  values ((select auth.uid()), 'fund.' || p_status::text, 'fund_requests', p_id::text,
    jsonb_build_object('from', v_from, 'rubric', p_rubric, 'amount_cents', v_row.amount_cents));
  return v_row;
end;
$$;

revoke execute on function app.check_fund_request(int, text) from public, anon;
revoke execute on function
  public.submit_fund_request(public.fund_category, int, text, text, date, text),
  public.resubmit_fund_request(uuid, public.fund_category, int, text, text, date, text),
  public.fund_balance(),
  public.decide_fund_request(uuid, public.fund_status, jsonb, text)
from public, anon;
grant execute on function
  public.submit_fund_request(public.fund_category, int, text, text, date, text),
  public.resubmit_fund_request(uuid, public.fund_category, int, text, text, date, text),
  public.fund_balance(),
  public.decide_fund_request(uuid, public.fund_status, jsonb, text)
to authenticated;
