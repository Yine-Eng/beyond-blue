-- M5: Day +100 check-in (PRD US-D100-1/2) and a fix so reviewers can be deleted.

-- A deleted reviewer (e.g. a removed staff account) no longer blocks the delete; the decision,
-- note and audit trail stay.
alter table public.fund_requests
  drop constraint fund_requests_reviewer_id_fkey,
  add constraint fund_requests_reviewer_id_fkey
    foreign key (reviewer_id) references public.profiles (id) on delete set null;

-- ---------------------------------------------------------------------------
-- One check-in per graduate, written only through submit_day_plus_100().
-- Staff never read rows: they get aggregates from day_plus_100_insights().
-- ---------------------------------------------------------------------------
create table public.day_plus_100_surveys (
  student_id uuid primary key references public.profiles (id) on delete cascade,
  pathway_id text not null references public.pathways (id),
  outcome text not null check (outcome in ('employed', 'enrolled', 'self_employed', 'searching', 'other')),
  usefulness smallint not null check (usefulness between 1 and 5),
  -- Stress now compared with graduation: 1 much less … 3 about the same … 5 much more.
  stress smallint not null check (stress between 1 and 5),
  most_useful text check (char_length(most_useful) <= 500),
  improve text check (char_length(improve) <= 500),
  opt_in_mentor boolean not null default false,
  opt_in_session boolean not null default false,
  opt_in_give boolean not null default false,
  submitted_at timestamptz not null default now()
);

alter table public.day_plus_100_surveys enable row level security;
create policy "read own check-in" on public.day_plus_100_surveys for select to authenticated
  using (student_id = (select auth.uid()));
revoke all on public.day_plus_100_surveys from anon;

-- Days since graduation for the signed-in student, in their cohort's time zone (null without one).
create function app.days_since_graduation(p_student uuid) returns int
language sql stable security definer set search_path = '' as $$
  select ((now() at time zone c.time_zone)::date - c.graduation_date)::int
  from public.profiles p join public.cohorts c on c.id = p.cohort_id
  where p.id = p_student
$$;

create function public.submit_day_plus_100(
  p_outcome text, p_usefulness int, p_stress int, p_most_useful text, p_improve text,
  p_opt_in_mentor boolean, p_opt_in_session boolean, p_opt_in_give boolean
) returns public.day_plus_100_surveys
language plpgsql security definer set search_path = '' as $$
declare
  v_student uuid := (select auth.uid());
  v_pathway text;
  v_days int := app.days_since_graduation(v_student);
  v_row public.day_plus_100_surveys;
begin
  select pathway_id into v_pathway from public.student_plans where student_id = v_student;
  if v_pathway is null then
    raise exception 'Only graduates with a Beyond Blue plan can check in.' using errcode = '42501';
  end if;
  if v_days is null or v_days not between 90 and 130 then
    raise exception 'The Day +100 check-in is open from Day +90 to Day +130.' using errcode = 'P0001';
  end if;

  insert into public.day_plus_100_surveys (student_id, pathway_id, outcome, usefulness, stress,
    most_useful, improve, opt_in_mentor, opt_in_session, opt_in_give)
  values (v_student, v_pathway, p_outcome, p_usefulness, p_stress, nullif(trim(p_most_useful), ''),
    nullif(trim(p_improve), ''), p_opt_in_mentor, p_opt_in_session, p_opt_in_give)
  returning * into v_row;

  -- Opting in to mentor starts an unpublished mentor profile the graduate can finish later.
  if p_opt_in_mentor then
    insert into public.mentor_profiles (user_id, display_name, role_title, city, pathways,
      grad_year, is_available)
    select p.id, coalesce(nullif(p.preferred_name, ''), nullif(p.full_name, ''), 'Beyond Blue alum'),
      coalesce(nullif(p.destination_role, ''), 'Bluefield State alum'), p.target_city,
      array[v_pathway], p.class_year, false
    from public.profiles p where p.id = v_student
    on conflict (user_id) do nothing;
  end if;

  insert into public.audit_log (actor_id, action, entity, entity_id, diff)
  values (v_student, 'day_plus_100.submitted', 'day_plus_100_surveys', v_student::text,
    jsonb_build_object('pathway', v_pathway));
  return v_row;
exception when unique_violation then
  raise exception 'You''ve already completed your Day +100 check-in. Thank you!' using errcode = 'P0001';
end;
$$;

-- Aggregates only, by pathway and overall. Any group under 5 responses is suppressed (n only),
-- so no answer can be traced to a person. Free text is never returned. Demo sessions are excluded.
create function public.day_plus_100_insights()
returns table (
  pathway_id text, responses int, suppressed boolean,
  employed int, enrolled int, self_employed int, searching int, other int,
  avg_usefulness numeric, less_stressed_pct int, same_stress_pct int, more_stressed_pct int,
  mentor_pct int, session_pct int, give_pct int
)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
begin
  if not (select app.is_staff()) then
    raise exception 'Only staff can view Day +100 insights.' using errcode = '42501';
  end if;
  return query
  with s as (
    select d.* from public.day_plus_100_surveys d
    join public.profiles p on p.id = d.student_id
    where not p.is_demo
  ),
  groups as (
    select d.pathway_id as g, d.* from s d
    union all
    select null, d.* from s d
  ),
  agg as (
    select g,
      count(*)::int as n,
      count(*) filter (where outcome = 'employed')::int as employed,
      count(*) filter (where outcome = 'enrolled')::int as enrolled,
      count(*) filter (where outcome = 'self_employed')::int as self_employed,
      count(*) filter (where outcome = 'searching')::int as searching,
      count(*) filter (where outcome = 'other')::int as other,
      round(avg(usefulness), 1) as avg_usefulness,
      round(100.0 * count(*) filter (where stress <= 2) / count(*))::int as less_pct,
      round(100.0 * count(*) filter (where stress = 3) / count(*))::int as same_pct,
      round(100.0 * count(*) filter (where stress >= 4) / count(*))::int as more_pct,
      round(100.0 * count(*) filter (where opt_in_mentor) / count(*))::int as mentor_pct,
      round(100.0 * count(*) filter (where opt_in_session) / count(*))::int as session_pct,
      round(100.0 * count(*) filter (where opt_in_give) / count(*))::int as give_pct
    from groups group by g
  )
  select a.g, a.n, a.n < 5,
    case when a.n >= 5 then a.employed end, case when a.n >= 5 then a.enrolled end,
    case when a.n >= 5 then a.self_employed end, case when a.n >= 5 then a.searching end,
    case when a.n >= 5 then a.other end, case when a.n >= 5 then a.avg_usefulness end,
    case when a.n >= 5 then a.less_pct end, case when a.n >= 5 then a.same_pct end,
    case when a.n >= 5 then a.more_pct end, case when a.n >= 5 then a.mentor_pct end,
    case when a.n >= 5 then a.session_pct end, case when a.n >= 5 then a.give_pct end
  from agg a
  order by a.g nulls first;
end;
$$;

revoke execute on function app.days_since_graduation(uuid) from public, anon, authenticated;
revoke execute on function
  public.submit_day_plus_100(text, int, int, text, text, boolean, boolean, boolean),
  public.day_plus_100_insights()
from public, anon;
grant execute on function
  public.submit_day_plus_100(text, int, int, text, text, boolean, boolean, boolean),
  public.day_plus_100_insights()
to authenticated;
