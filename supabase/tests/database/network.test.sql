-- M3 RLS and RPC tests (pgTAP): mentors, connections, pathway switching, detour plans.
begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

insert into auth.users (id, email, instance_id, aud, role)
values
  ('a1111111-1111-1111-1111-111111111111', 'student@example.edu', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('b2222222-2222-2222-2222-222222222222', 'other@example.edu', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('c3333333-3333-3333-3333-333333333333', 'mentor@example.edu', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated');

update public.profiles set role = 'mentor', preferred_name = 'Mia' where id = 'c3333333-3333-3333-3333-333333333333';
insert into public.mentor_profiles (id, user_id, display_name, role_title, city, capacity)
values ('d4444444-4444-4444-4444-444444444444', 'c3333333-3333-3333-3333-333333333333', 'Mia Mentor', 'Engineer', 'Atlanta, GA', 2);

insert into public.tasks (id, pathway_id, area_id, slug, title, why_it_matters, due_day_offset, output_type, launch_file_section, sort_order, equivalence_key)
values
  ('hired.financial.budget-90', 'hired', 'financial', 'budget-90', 'Budget', 'x', 70, 'link', 'financial_prep', 1, 'budget-90'),
  ('hired.career.offer', 'hired', 'career', 'offer', 'Offer', 'x', 90, 'link', 'next_step_plan', 2, null),
  ('higher_ed.financial.budget-90', 'higher_ed', 'financial', 'budget-90', 'Budget', 'x', 70, 'link', 'financial_prep', 1, 'budget-90')
on conflict (id) do nothing;

insert into public.student_plans (student_id, pathway_id) values ('a1111111-1111-1111-1111-111111111111', 'hired');
insert into public.task_completions (student_id, task_id, pathway_id_at_completion, output_type, output_url, shared_with_mentors)
values
  ('a1111111-1111-1111-1111-111111111111', 'hired.financial.budget-90', 'hired', 'link', 'https://example.edu/budget', true),
  ('a1111111-1111-1111-1111-111111111111', 'hired.career.offer', 'hired', 'link', 'https://example.edu/offer', false);

select ok((select count(*) from public.mentor_profiles where is_seeded_fictional) >= 30, '30+ fictional alumni are seeded');

-- Act as the student
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select ok((select count(*) from public.mentor_profiles) >= 31, 'students can read mentor display fields');
select throws_ok($$ select user_id from public.mentor_profiles $$, '42501', null, 'account links on mentor profiles stay private');
select ok(
  not exists (select 1 from public.available_mentors() where display_name = 'Elena Petrova'),
  'mentors at capacity are not offered');
update public.mentor_profiles set capacity = 20 where id = 'd4444444-4444-4444-4444-444444444444';

select lives_ok(
  $$ insert into public.connections (student_id, mentor_id, match_reason, match_score)
     values ('a1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', 'Also lives in Atlanta, GA', 30) $$,
  'a student can request a connection');
select throws_ok(
  $$ insert into public.connections (student_id, mentor_id)
     values ('b2222222-2222-2222-2222-222222222222', 'd4444444-4444-4444-4444-444444444444') $$,
  '42501', null, 'a student cannot request on someone else''s behalf');
select throws_ok(
  $$ update public.connections set status = 'accepted' where student_id = 'a1111111-1111-1111-1111-111111111111' $$,
  '42501', null, 'a student cannot accept their own request');

-- Fill up to the 3-pending limit with fictional alumni, then one more fails.
insert into public.connections (student_id, mentor_id)
select 'a1111111-1111-1111-1111-111111111111', id from public.mentor_profiles
where is_seeded_fictional order by display_name limit 2;
select throws_ok(
  $$ insert into public.connections (student_id, mentor_id)
     select 'a1111111-1111-1111-1111-111111111111', id from public.mentor_profiles
     where is_seeded_fictional order by display_name desc limit 1 $$,
  'P0001', null, 'at most 3 pending requests');
select lives_ok(
  $$ update public.connections set status = 'withdrawn'
     where student_id = 'a1111111-1111-1111-1111-111111111111' and mentor_id <> 'd4444444-4444-4444-4444-444444444444' $$,
  'a student can withdraw a request');

select throws_ok($$ select public.verify_output(id) from public.task_completions limit 1 $$,
  '42501', null, 'a student cannot verify their own output');
select throws_ok(
  $$ insert into public.pathway_changes (student_id, from_pathway_id, to_pathway_id, completed_kept, credited_in_new)
     values ('a1111111-1111-1111-1111-111111111111', 'hired', 'job_search', 0, 0) $$,
  '42501', null, 'pathway history is written only by switch_pathway');

select lives_ok(
  $$ insert into public.detour_plans (student_id, answers) values ('a1111111-1111-1111-1111-111111111111', '{"planA":"Start at Halcyra"}') $$,
  'a student can save their detour plan');
reset role;

select is((select capacity from public.mentor_profiles where id = 'd4444444-4444-4444-4444-444444444444'), 2,
  'students cannot edit mentor profiles');

-- Act as the mentor
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"c3333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select is((select count(*)::int from public.profiles where id = 'a1111111-1111-1111-1111-111111111111'), 1,
  'a mentor sees the basics of students who asked to connect');
select is((select count(*)::int from public.task_completions), 0, 'a mentor sees no outputs before accepting');
select lives_ok(
  $$ update public.connections set status = 'accepted' where mentor_id = 'd4444444-4444-4444-4444-444444444444' $$,
  'a mentor can accept a request');
select is((select count(*)::int from public.task_completions), 1, 'a mentor sees only outputs shared with mentors');
select lives_ok($$ select public.verify_output(id) from public.task_completions $$, 'a mentor can verify a shared output');
reset role;

-- Back to the student: switch pathway
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select results_eq(
  $$ select completed_kept, credited_in_new from public.switch_pathway('higher_ed', 'Got into grad school') $$,
  $$ values (2, 1) $$,
  'switching keeps every completion and credits shared tasks');
reset role;

select is(
  (select count(*)::int from public.audit_log where action in ('connection.accepted', 'output.verified', 'plan.pathway_changed')),
  3, 'accept, verify and pathway change are audited');

select * from finish();
rollback;
