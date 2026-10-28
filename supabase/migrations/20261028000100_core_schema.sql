-- Beyond Blue core schema (docs/architecture.md §3 and §7).
-- Every table has Row Level Security. A student can only ever read or write their own rows.

-- ---------------------------------------------------------------------------
-- Private helper schema (not exposed through the Data API)
-- ---------------------------------------------------------------------------
create schema if not exists app;
grant usage on schema app to authenticated, service_role;

create type public.user_role as enum ('student', 'mentor', 'staff', 'admin');
create type public.output_type as enum ('file', 'link', 'form');

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------
create table public.pathways (
  id text primary key,
  name text not null,
  self_description text not null,
  sort_order int not null
);

create table public.readiness_areas (
  id text primary key,
  name text not null,
  milestone_day int not null check (milestone_day between 0 and 100),
  opens_at_day int not null check (opens_at_day between 0 and 100),
  sort_order int not null
);

insert into public.pathways (id, name, self_description, sort_order) values
  ('hired', 'Hired', 'I already have a job.', 1),
  ('job_search', 'Job Search', 'I''m looking for work.', 2),
  ('higher_ed', 'Higher Education', 'I''m continuing my education.', 3),
  ('entrepreneurship', 'Entrepreneurship', 'I''m building my own path.', 4),
  ('still_deciding', 'Still Deciding', 'I''m figuring out what comes next.', 5);

insert into public.readiness_areas (id, name, milestone_day, opens_at_day, sort_order) values
  ('career', 'Career Readiness', 100, 100, 1),
  ('financial', 'Financial Readiness', 75, 75, 2),
  ('relocation', 'Relocation & Life Logistics', 50, 50, 3),
  ('network', 'Network & Mentorship', 25, 25, 4),
  ('wellness', 'Wellness & Detour Planning', 0, 25, 5);

create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  class_year int not null,
  graduation_date date not null,
  time_zone text not null default 'America/New_York',
  is_default boolean not null default false,
  is_demo boolean not null default false,
  -- Demo cohorts belong to one anonymous demo user and are deleted with them.
  owner_id uuid references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create unique index cohorts_one_default on public.cohorts (is_default) where is_default;

-- Spring 2027 commencement placeholder until BSU confirms the date (docs/open-questions.md #8).
insert into public.cohorts (name, class_year, graduation_date, is_default)
values ('Class of 2027 · Spring', 2027, '2027-05-08', true);

create table public.tasks (
  id text primary key, -- `${pathway}.${area}.${slug}`
  pathway_id text not null references public.pathways (id),
  area_id text not null references public.readiness_areas (id),
  slug text not null,
  title text not null,
  why_it_matters text not null,
  due_day_offset int not null check (due_day_offset between 0 and 100),
  output_type public.output_type not null,
  form_id text,
  accept text[],
  equivalence_key text,
  is_key_output boolean not null default false,
  launch_file_section text not null,
  support text[] not null default '{}',
  sort_order int not null,
  content_version int not null default 1,
  updated_at timestamptz not null default now(),
  unique (pathway_id, area_id, slug)
);
create index tasks_pathway on public.tasks (pathway_id, area_id, sort_order);
create index tasks_equivalence on public.tasks (equivalence_key) where equivalence_key is not null;

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'student',
  cohort_id uuid references public.cohorts (id) on delete set null,
  preferred_name text check (char_length(preferred_name) <= 60),
  full_name text check (char_length(full_name) <= 120),
  class_year int check (class_year between 2020 and 2040),
  major text check (char_length(major) <= 120),
  school text not null default 'Bluefield State University',
  destination_role text check (char_length(destination_role) <= 120),
  target_city text check (char_length(target_city) <= 120),
  journey_tags text[] not null default '{}' check (cardinality(journey_tags) <= 12),
  avatar_path text,
  is_demo boolean not null default false,
  onboarded_at timestamptz,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_cohort on public.profiles (cohort_id);

create table public.student_plans (
  student_id uuid primary key references public.profiles (id) on delete cascade,
  pathway_id text not null references public.pathways (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_completions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  task_id text not null references public.tasks (id),
  pathway_id_at_completion text not null references public.pathways (id),
  output_type public.output_type not null,
  output_url text check (output_url is null or output_url ~ '^https://'),
  output_path text,
  output_data jsonb,
  shared_with_mentors boolean not null default false,
  verified_by uuid references public.profiles (id) on delete set null,
  verified_at timestamptz,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, task_id),
  constraint completion_has_output check (
    (output_type = 'link' and output_url is not null)
    or (output_type = 'file' and output_path is not null)
    or (output_type = 'form' and output_data is not null)
  )
);
create index task_completions_student on public.task_completions (student_id);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  diff jsonb,
  at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Role helpers (security definer, so policies don't recurse through profiles RLS)
-- ---------------------------------------------------------------------------
create function app.current_user_role() returns public.user_role
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create function app.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select role in ('staff', 'admin') from public.profiles where id = (select auth.uid())), false)
$$;

grant execute on function app.current_user_role(), app.is_staff() to authenticated;

-- ---------------------------------------------------------------------------
-- Profile on sign-up
-- ---------------------------------------------------------------------------
create function app.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, is_demo, cohort_id)
  values (
    new.id,
    coalesce(new.is_anonymous, false),
    (select id from public.cohorts where is_default limit 1)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_user();

-- updated_at bookkeeping
create function app.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function app.touch_updated_at();
create trigger student_plans_touch before update on public.student_plans
  for each row execute function app.touch_updated_at();
create trigger task_completions_touch before update on public.task_completions
  for each row execute function app.touch_updated_at();

-- Audit plan creation and pathway changes
create function app.audit_student_plan() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log (actor_id, action, entity, entity_id, diff)
  values (
    (select auth.uid()),
    case when tg_op = 'INSERT' then 'plan.created' else 'plan.pathway_changed' end,
    'student_plans',
    new.student_id::text,
    jsonb_build_object('from', case when tg_op = 'UPDATE' then old.pathway_id end, 'to', new.pathway_id)
  );
  return new;
end;
$$;

create trigger student_plans_audit after insert or update of pathway_id on public.student_plans
  for each row execute function app.audit_student_plan();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.pathways enable row level security;
alter table public.readiness_areas enable row level security;
alter table public.cohorts enable row level security;
alter table public.tasks enable row level security;
alter table public.profiles enable row level security;
alter table public.student_plans enable row level security;
alter table public.task_completions enable row level security;
alter table public.audit_log enable row level security;

-- Reference data: readable by any signed-in user (anonymous demo users included)
create policy "pathways are readable" on public.pathways for select to authenticated using (true);
create policy "areas are readable" on public.readiness_areas for select to authenticated using (true);
create policy "tasks are readable" on public.tasks for select to authenticated using (true);

-- Cohorts: your own cohort, or all for staff
create policy "read own cohort" on public.cohorts for select to authenticated using (
  id = (select cohort_id from public.profiles where id = (select auth.uid()))
  or (select app.is_staff())
);

-- Profiles
create policy "read own profile" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select app.is_staff()));
create policy "update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Students may only change safe columns; role, cohort and demo flag are server-controlled.
revoke update on public.profiles from authenticated, anon;
grant update (
  preferred_name, full_name, class_year, major, destination_role, target_city,
  journey_tags, avatar_path, onboarded_at, last_active_at
) on public.profiles to authenticated;

-- Plans
create policy "read own plan" on public.student_plans for select to authenticated
  using (student_id = (select auth.uid()) or (select app.is_staff()));
create policy "create own plan" on public.student_plans for insert to authenticated
  with check (student_id = (select auth.uid()));
create policy "change own plan" on public.student_plans for update to authenticated
  using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));

-- Task completions
create policy "read own completions" on public.task_completions for select to authenticated
  using (student_id = (select auth.uid()) or (select app.is_staff()));
create policy "add own completions" on public.task_completions for insert to authenticated
  with check (student_id = (select auth.uid()) and verified_by is null and verified_at is null);
create policy "edit own completions" on public.task_completions for update to authenticated
  using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));
create policy "remove own completions" on public.task_completions for delete to authenticated
  using (student_id = (select auth.uid()));

-- Students can't self-verify: verification columns are excluded from their update grant.
revoke update on public.task_completions from authenticated, anon;
grant update (output_type, output_url, output_path, output_data, shared_with_mentors, pathway_id_at_completion, completed_at)
  on public.task_completions to authenticated;

-- Audit log: admins read; writes only via security definer triggers/functions
create policy "admins read audit log" on public.audit_log for select to authenticated
  using ((select app.current_user_role()) = 'admin');

-- Nothing in public is writable by anonymous (signed-out) visitors.
revoke all on all tables in schema public from anon;
