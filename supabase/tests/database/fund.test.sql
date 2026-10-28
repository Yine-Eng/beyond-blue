-- M4 RLS and RPC tests (pgTAP): Last Mile Fund requests and reviews, Launch File exports.
begin;
create extension if not exists pgtap with schema extensions;
select plan(17);

insert into auth.users (id, email, instance_id, aud, role)
values
  ('a1111111-1111-1111-1111-111111111111', 'student@example.edu', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('b2222222-2222-2222-2222-222222222222', 'other@example.edu', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('e5555555-5555-5555-5555-555555555555', 'staff@example.edu', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated');
update public.profiles set role = 'staff' where id = 'e5555555-5555-5555-5555-555555555555';
update public.fund_settings set total_budget_cents = 30000;

-- Act as the student
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select throws_ok(
  $$ select public.submit_fund_request('deposit', 30000, 'Sign my lease in Atlanta',
       repeat('I need help with the apartment deposit before my start date. ', 2), '2027-05-20') $$,
  'P0001', null, 'requests above the cap are refused');
select throws_ok(
  $$ select public.submit_fund_request('deposit', 20000, 'Sign my lease in Atlanta',
       repeat('I need help with the apartment deposit before my start date. ', 2), '2027-05-20',
       'b2222222-2222-2222-2222-222222222222/lease.pdf') $$,
  '42501', null, 'a document must come from the student''s own folder');
select lives_ok(
  $$ select public.submit_fund_request('deposit', 20000, 'Sign my lease in Atlanta',
       repeat('I need help with the apartment deposit before my start date. ', 2), '2027-05-20',
       'a1111111-1111-1111-1111-111111111111/lease.pdf') $$,
  'a student can submit a request');
select throws_ok(
  $$ select public.submit_fund_request('interview_travel', 5000, 'Fly to my final interview',
       repeat('My final interview is in person and I cannot cover the flight myself. ', 2), '2027-04-01') $$,
  'P0001', 'You already have an open request.', 'only one open request at a time');
select throws_ok(
  $$ insert into public.fund_requests (student_id, category, amount_cents, next_step, justification, needed_by)
     values ('a1111111-1111-1111-1111-111111111111', 'deposit', 100, 'Direct insert',
       repeat('x', 60), '2027-05-01') $$,
  '42501', null, 'requests are written only through the RPC');
select throws_ok(
  $$ select public.decide_fund_request(id, 'approved',
       '{"next_step":true,"documented":true,"within_cap":true,"no_other_source":true}', 'ok')
     from public.fund_requests $$,
  '42501', null, 'a student cannot decide their own request');
select throws_ok(
  $$ select public.resubmit_fund_request(id, 'deposit', 15000, 'Sign my lease in Atlanta',
       repeat('I need help with the apartment deposit before my start date. ', 2), '2027-05-20')
     from public.fund_requests $$,
  'P0001', null, 'a request can only be edited after staff ask for more information');
reset role;

-- Another student sees nothing
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b2222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select is((select count(*)::int from public.fund_requests), 0, 'students cannot see others'' requests');
reset role;

-- Act as staff
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"e5555555-5555-5555-5555-555555555555","role":"authenticated"}', true);
select is((select count(*)::int from public.fund_requests), 1, 'staff see the queue');
select throws_ok(
  $$ select public.decide_fund_request(id, 'approved', '{"next_step":true}', 'Looks good')
     from public.fund_requests $$,
  'P0001', 'Complete the rubric before deciding.', 'the rubric must be completed first');
select throws_ok(
  $$ select public.decide_fund_request(id, 'approved',
       '{"next_step":true,"documented":true,"within_cap":true,"no_other_source":true}', ' ')
     from public.fund_requests $$,
  'P0001', 'Add a note explaining the decision.', 'a decision needs a note');
select lives_ok(
  $$ select public.decide_fund_request(id, 'needs_info',
       '{"next_step":true,"documented":false,"within_cap":true,"no_other_source":true}',
       'Please upload the lease page that shows the deposit.')
     from public.fund_requests $$,
  'staff can ask for more information');
reset role;

-- The student edits and resubmits
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select lives_ok(
  $$ select public.resubmit_fund_request(id, 'deposit', 20000, 'Sign my lease in Atlanta',
       repeat('I need help with the apartment deposit before my start date. ', 2), '2027-05-20',
       'a1111111-1111-1111-1111-111111111111/lease-page.pdf')
     from public.fund_requests $$,
  'a student can resubmit after a needs-info request');
select lives_ok(
  $$ insert into public.launch_files (student_id, snapshot)
     values ('a1111111-1111-1111-1111-111111111111', '{"sections":[]}') $$,
  'a student can record a Launch File export');
reset role;

-- Staff approve; a second approval would overspend the $300 fund
insert into public.fund_requests (student_id, category, amount_cents, next_step, justification, needed_by)
values ('b2222222-2222-2222-2222-222222222222', 'interview_travel', 15000, 'Fly to my final interview',
  repeat('My final interview is in person and I cannot cover the flight myself. ', 2), '2027-04-01');
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"e5555555-5555-5555-5555-555555555555","role":"authenticated"}', true);
select lives_ok(
  $$ select public.decide_fund_request(id, 'approved',
       '{"next_step":true,"documented":true,"within_cap":true,"no_other_source":true}', 'Lease verified.')
     from public.fund_requests where student_id = 'a1111111-1111-1111-1111-111111111111' $$,
  'staff can approve a request that meets the rubric');
select throws_ok(
  $$ select public.decide_fund_request(id, 'approved',
       '{"next_step":true,"documented":true,"within_cap":true,"no_other_source":true}', 'Flight booked.')
     from public.fund_requests where student_id = 'b2222222-2222-2222-2222-222222222222' $$,
  'P0001', 'Approving this would exceed the remaining fund balance.', 'approvals cannot exceed the balance');
reset role;

select is(
  (select count(*)::int from public.audit_log where entity = 'fund_requests'),
  4, 'submit, needs-info, resubmit and approval are audited');

select * from finish();
rollback;
