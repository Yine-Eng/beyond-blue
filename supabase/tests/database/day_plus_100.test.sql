-- M5 RLS and RPC tests (pgTAP): Day +100 check-in and staff insights.
begin;
create extension if not exists pgtap with schema extensions;
select plan(13);

insert into auth.users (id, email, instance_id, aud, role)
select ('a0000000-0000-0000-0000-00000000000' || i)::uuid, 'grad' || i || '@example.edu',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'
from generate_series(1, 6) i;
insert into auth.users (id, email, instance_id, aud, role) values
  ('b2222222-2222-2222-2222-222222222222', 'senior@example.edu', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('e5555555-5555-5555-5555-555555555555', 'staff@example.edu', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated');

insert into public.cohorts (id, name, class_year, graduation_date, time_zone) values
  ('c0000000-0000-0000-0000-000000000001', 'Graduated', 2026, (now() at time zone 'America/New_York')::date - 100, 'America/New_York'),
  ('c0000000-0000-0000-0000-000000000002', 'Seniors', 2027, (now() at time zone 'America/New_York')::date + 80, 'America/New_York');
update public.profiles set cohort_id = 'c0000000-0000-0000-0000-000000000001', preferred_name = 'Grad'
where id::text like 'a0000000%';
update public.profiles set cohort_id = 'c0000000-0000-0000-0000-000000000002' where id = 'b2222222-2222-2222-2222-222222222222';
update public.profiles set role = 'staff' where id = 'e5555555-5555-5555-5555-555555555555';
insert into public.student_plans (student_id, pathway_id)
select id, 'hired' from public.profiles where id::text like 'a0000000%' or id = 'b2222222-2222-2222-2222-222222222222';

-- Graduate 1 checks in
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select lives_ok(
  $$ select public.submit_day_plus_100('employed', 5, 2, 'The budget', 'More alumni', true, false, true) $$,
  'a graduate can check in between Day +90 and +130');
select throws_ok(
  $$ select public.submit_day_plus_100('employed', 4, 3, null, null, false, false, false) $$,
  'P0001', 'You''ve already completed your Day +100 check-in. Thank you!', 'one check-in per graduate');
select is((select count(*)::int from public.day_plus_100_surveys), 1, 'a graduate reads their own check-in');
select throws_ok($$ insert into public.day_plus_100_surveys (student_id, pathway_id, outcome, usefulness, stress)
  values ('a0000000-0000-0000-0000-000000000001', 'hired', 'other', 1, 1) $$,
  '42501', null, 'check-ins are written only through the RPC');
select throws_ok($$ select * from public.day_plus_100_insights() $$, '42501', null,
  'graduates cannot see insights');
reset role;

select is(
  (select is_available from public.mentor_profiles where user_id = 'a0000000-0000-0000-0000-000000000001'),
  false, 'opting in to mentor creates an unpublished mentor profile draft');

-- A senior before graduation can't check in yet
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b2222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select throws_ok(
  $$ select public.submit_day_plus_100('searching', 3, 3, null, null, false, false, false) $$,
  'P0001', 'The Day +100 check-in is open from Day +90 to Day +130.', 'the check-in opens at Day +90');
select is((select count(*)::int from public.day_plus_100_surveys), 0, 'students cannot read others'' check-ins');
reset role;

-- Staff: one response is suppressed
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"e5555555-5555-5555-5555-555555555555","role":"authenticated"}', true);
select is((select count(*)::int from public.day_plus_100_surveys), 0, 'staff never read individual check-ins');
select results_eq(
  $$ select responses, suppressed, employed from public.day_plus_100_insights() where pathway_id is null $$,
  $$ values (1, true, null::int) $$, 'groups under 5 responses are suppressed');
reset role;

-- Five more graduates check in
do $$
declare i int;
begin
  for i in 2..6 loop
    perform set_config('request.jwt.claims',
      format('{"sub":"a0000000-0000-0000-0000-00000000000%s","role":"authenticated"}', i), true);
    perform public.submit_day_plus_100(case when i <= 3 then 'employed' else 'searching' end,
      4, case when i <= 4 then 1 else 5 end, null, null, false, i = 2, false);
  end loop;
end $$;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"e5555555-5555-5555-5555-555555555555","role":"authenticated"}', true);
select results_eq(
  $$ select responses, suppressed, employed, searching, less_stressed_pct, more_stressed_pct, mentor_pct
     from public.day_plus_100_insights() where pathway_id is null $$,
  $$ values (6, false, 3, 3, 67, 33, 17) $$, 'overall aggregates are counts and percentages');
select results_eq(
  $$ select avg_usefulness from public.day_plus_100_insights() where pathway_id = 'hired' $$,
  $$ values (4.2::numeric) $$, 'average usefulness by pathway');
reset role;

select is((select count(*)::int from public.audit_log where action = 'day_plus_100.submitted'), 6,
  'every check-in is audited');

select * from finish();
rollback;
