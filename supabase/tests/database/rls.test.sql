-- RLS policy tests (pgTAP). Run with `supabase test db` against a local stack (CI `db` job).
begin;
create extension if not exists pgtap with schema extensions;
select plan(17);

-- Two students and one staff member
insert into auth.users (id, email, instance_id, aud, role)
values
  ('11111111-1111-1111-1111-111111111111', 'a@example.edu', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.edu', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'staff@example.edu', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated');

select is(
  (select count(*)::int from public.profiles where id in (
    '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333')),
  3, 'sign-up trigger creates a profile per user');

update public.profiles set role = 'staff' where id = '33333333-3333-3333-3333-333333333333';

insert into public.tasks (id, pathway_id, area_id, slug, title, why_it_matters, due_day_offset, output_type, launch_file_section, sort_order)
values ('hired.career.test', 'hired', 'career', 'test', 'Test task', 'Testing', 90, 'link', 'next_step_plan', 1);

insert into public.student_plans (student_id, pathway_id) values ('22222222-2222-2222-2222-222222222222', 'hired');
insert into public.task_completions (student_id, task_id, pathway_id_at_completion, output_type, output_url)
values ('22222222-2222-2222-2222-222222222222', 'hired.career.test', 'hired', 'link', 'https://example.edu/b');

-- Act as student A
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select is((select count(*)::int from public.profiles), 1, 'a student sees only their own profile');
select is((select count(*)::int from public.student_plans), 0, 'a student cannot see another student''s plan');
select is((select count(*)::int from public.task_completions), 0, 'a student cannot see another student''s completions');
select is((select count(*)::int from public.tasks), 1, 'tasks are readable');
select is((select count(*)::int from public.cohorts), 1, 'a student sees their own cohort only');

select lives_ok(
  $$ insert into public.student_plans (student_id, pathway_id) values ('11111111-1111-1111-1111-111111111111', 'job_search') $$,
  'a student can create their own plan');
select throws_ok(
  $$ insert into public.student_plans (student_id, pathway_id) values ('22222222-2222-2222-2222-222222222222', 'job_search') $$,
  '42501', null, 'a student cannot create a plan for someone else');

select lives_ok(
  $$ insert into public.task_completions (student_id, task_id, pathway_id_at_completion, output_type, output_url)
     values ('11111111-1111-1111-1111-111111111111', 'hired.career.test', 'job_search', 'link', 'https://example.edu/a') $$,
  'a student can complete their own task');
select throws_ok(
  $$ insert into public.task_completions (student_id, task_id, pathway_id_at_completion, output_type, output_url)
     values ('22222222-2222-2222-2222-222222222222', 'hired.career.test', 'hired', 'link', 'https://example.edu/x')
     on conflict do nothing $$,
  '42501', null, 'a student cannot write completions for someone else');
select throws_ok(
  $$ update public.task_completions set verified_at = now() where student_id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', null, 'a student cannot verify their own output');
select lives_ok(
  $ update public.task_completions set output_url = 'https://example.edu/a2', completed_at = now()
     where student_id = '11111111-1111-1111-1111-111111111111' $,
  'a student can replace their own output');

select throws_ok(
  $$ update public.profiles set role = 'admin' where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', null, 'a student cannot change their role');
select lives_ok(
  $$ update public.profiles set preferred_name = 'Ana' where id = '11111111-1111-1111-1111-111111111111' $$,
  'a student can edit safe profile fields');

update public.profiles set preferred_name = 'Hacked' where id = '22222222-2222-2222-2222-222222222222';
reset role;
select is(
  (select preferred_name from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  null, 'a student cannot edit another student''s profile');

-- Act as staff
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select ok((select count(*)::int from public.profiles) >= 3, 'staff can read all profiles');
reset role;

select is(
  (select count(*)::int from public.audit_log where action = 'plan.created'),
  2, 'plan creation is audited');

select * from finish();
rollback;
