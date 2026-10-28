-- M3: mentors, connections, mentor notes, pathway history and Detour Challenge drafts
-- (docs/architecture.md §3, §4.3, §4.4 and §7).

create type public.connection_status as enum ('pending', 'accepted', 'declined', 'withdrawn');

-- ---------------------------------------------------------------------------
-- Mentors. Real mentors link to a profile (role = 'mentor'); seeded demo alumni are fictional
-- and have no account (user_id is null, is_seeded_fictional = true).
-- ---------------------------------------------------------------------------
create table public.mentor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles (id) on delete cascade,
  display_name text not null check (char_length(display_name) <= 80),
  grad_year int check (grad_year between 1950 and 2040),
  role_title text not null check (char_length(role_title) <= 120),
  employer text check (char_length(employer) <= 120),
  industry text check (char_length(industry) <= 60),
  city text check (char_length(city) <= 120),
  grad_school text check (char_length(grad_school) <= 120),
  pathways text[] not null default '{}',
  journey_tags text[] not null default '{}' check (cardinality(journey_tags) <= 12),
  bio text check (char_length(bio) <= 600),
  capacity int not null default 3 check (capacity between 0 and 20),
  is_available boolean not null default true,
  is_seeded_fictional boolean not null default false,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  mentor_id uuid not null references public.mentor_profiles (id) on delete cascade,
  status public.connection_status not null default 'pending',
  match_reason text check (char_length(match_reason) <= 300),
  match_score int,
  note text check (char_length(note) <= 300),
  requested_at timestamptz not null default now(),
  responded_at timestamptz
);
create index connections_student on public.connections (student_id);
create index connections_mentor on public.connections (mentor_id, status);
-- One open (pending or accepted) connection per student and mentor
create unique index connections_one_open on public.connections (student_id, mentor_id)
  where status in ('pending', 'accepted');

create table public.mentor_notes (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections (id) on delete cascade,
  met_on date not null,
  topic text not null check (char_length(topic) <= 120),
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now()
);
create index mentor_notes_connection on public.mentor_notes (connection_id);

create table public.pathway_changes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  from_pathway_id text not null references public.pathways (id),
  to_pathway_id text not null references public.pathways (id),
  reason text check (char_length(reason) <= 300),
  completed_kept int not null,
  credited_in_new int not null,
  changed_at timestamptz not null default now()
);
create index pathway_changes_student on public.pathway_changes (student_id, changed_at desc);

-- Detour Challenge progress, saved after each step. Finishing it completes the Detour task.
create table public.detour_plans (
  student_id uuid primary key references public.profiles (id) on delete cascade,
  answers jsonb not null default '{}',
  current_step int not null default 1 check (current_step between 1 and 5),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create trigger mentor_profiles_touch before update on public.mentor_profiles
  for each row execute function app.touch_updated_at();
create trigger detour_plans_touch before update on public.detour_plans
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create function app.my_mentor_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.mentor_profiles where user_id = (select auth.uid())
$$;

-- True when the student has an open (pending or accepted) connection with the current mentor.
create function app.is_my_mentee(student uuid, accepted_only boolean default false) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.connections c
    where c.student_id = student
      and c.mentor_id = (select app.my_mentor_id())
      and (c.status = 'accepted' or (not accepted_only and c.status = 'pending'))
  )
$$;

create function app.owns_connection(connection uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.connections c
    where c.id = connection
      and (c.student_id = (select auth.uid()) or c.mentor_id = (select app.my_mentor_id()))
  )
$$;

grant execute on function app.my_mentor_id(), app.is_my_mentee(uuid, boolean), app.owns_connection(uuid)
  to authenticated;

-- At most 3 pending requests per student (PRD US-NET-3 AC3).
create function app.limit_pending_connections() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.connections where student_id = new.student_id and status = 'pending') >= 3 then
    raise exception 'You can have at most 3 pending requests.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger connections_pending_limit before insert on public.connections
  for each row execute function app.limit_pending_connections();

-- Audit every response (accept, decline, withdraw).
create function app.audit_connection() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    new.responded_at = now();
    insert into public.audit_log (actor_id, action, entity, entity_id, diff)
    values ((select auth.uid()), 'connection.' || new.status::text, 'connections', new.id::text,
      jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return new;
end;
$$;
create trigger connections_audit before update on public.connections
  for each row execute function app.audit_connection();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.mentor_profiles enable row level security;
alter table public.connections enable row level security;
alter table public.mentor_notes enable row level security;
alter table public.pathway_changes enable row level security;
alter table public.detour_plans enable row level security;

-- Mentor profiles: display fields are readable by signed-in users; mentors edit their own.
create policy "mentor profiles are readable" on public.mentor_profiles for select to authenticated
  using (true);
create policy "mentors edit own profile" on public.mentor_profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "staff manage mentor profiles" on public.mentor_profiles for all to authenticated
  using ((select app.is_staff())) with check ((select app.is_staff()));

-- Account links stay private: the public view of a mentor is display fields only.
revoke select, update on public.mentor_profiles from authenticated, anon;
grant select (
  id, display_name, grad_year, role_title, employer, industry, city, grad_school, pathways,
  journey_tags, bio, capacity, is_available, is_seeded_fictional
) on public.mentor_profiles to authenticated;
grant update (
  display_name, role_title, employer, industry, city, grad_school, pathways, journey_tags, bio,
  capacity, is_available, last_active_at
) on public.mentor_profiles to authenticated;

-- Connections
create policy "read own connections" on public.connections for select to authenticated using (
  student_id = (select auth.uid())
  or mentor_id = (select app.my_mentor_id())
  or (select app.is_staff())
);
create policy "request connections" on public.connections for insert to authenticated
  with check (student_id = (select auth.uid()) and status = 'pending' and responded_at is null);
create policy "students withdraw requests" on public.connections for update to authenticated
  using (student_id = (select auth.uid()) and status in ('pending', 'accepted'))
  with check (student_id = (select auth.uid()) and status = 'withdrawn');
create policy "mentors respond to requests" on public.connections for update to authenticated
  using (mentor_id = (select app.my_mentor_id()) and status = 'pending')
  with check (mentor_id = (select app.my_mentor_id()) and status in ('accepted', 'declined'));

revoke update on public.connections from authenticated, anon;
grant update (status) on public.connections to authenticated;

-- Mentor notes: the mentor writes, both sides read
create policy "read notes on own connections" on public.mentor_notes for select to authenticated
  using ((select app.owns_connection(connection_id)) or (select app.is_staff()));
create policy "mentors log conversations" on public.mentor_notes for insert to authenticated
  with check (exists (
    select 1 from public.connections c
    where c.id = connection_id and c.status = 'accepted' and c.mentor_id = (select app.my_mentor_id())
  ));

-- Mentors see the basics of students who asked to connect, and shared outputs of mentees.
create policy "mentors read requesters" on public.profiles for select to authenticated
  using ((select app.is_my_mentee(id)));
create policy "mentors read requester plans" on public.student_plans for select to authenticated
  using ((select app.is_my_mentee(student_id)));
create policy "mentors read shared outputs" on public.task_completions for select to authenticated
  using (shared_with_mentors and (select app.is_my_mentee(student_id, true)));

-- Pathway history: read own; written only by switch_pathway()
create policy "read own pathway history" on public.pathway_changes for select to authenticated
  using (student_id = (select auth.uid()) or (select app.is_staff()));

-- Detour plans
create policy "read own detour plan" on public.detour_plans for select to authenticated
  using (student_id = (select auth.uid()) or (select app.is_staff()));
create policy "start own detour plan" on public.detour_plans for insert to authenticated
  with check (student_id = (select auth.uid()));
create policy "edit own detour plan" on public.detour_plans for update to authenticated
  using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));

revoke all on public.mentor_profiles, public.connections, public.mentor_notes,
  public.pathway_changes, public.detour_plans from anon;

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- Mentors who can take a new mentee (available and under capacity), with their load.
create function public.available_mentors()
returns table (
  id uuid, display_name text, grad_year int, role_title text, employer text, industry text,
  city text, grad_school text, pathways text[], journey_tags text[], bio text,
  active_mentees int, last_active_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select m.id, m.display_name, m.grad_year, m.role_title, m.employer, m.industry, m.city,
    m.grad_school, m.pathways, m.journey_tags, m.bio, coalesce(a.n, 0)::int, m.last_active_at
  from public.mentor_profiles m
  left join (
    select mentor_id, count(*) as n from public.connections where status = 'accepted' group by mentor_id
  ) a on a.mentor_id = m.id
  where m.is_available and coalesce(a.n, 0) < m.capacity and (select auth.uid()) is not null
$$;

-- Network stats as counts only (no identities). Demo cohorts are private to one user, so demo
-- sessions report an illustrative pilot cohort size instead of zero.
create function public.network_stats()
returns table (mentors int, alumni int, students_on_path int)
language sql stable security definer set search_path = '' as $$
  with me as (
    select p.id, p.cohort_id, p.is_demo, sp.pathway_id
    from public.profiles p left join public.student_plans sp on sp.student_id = p.id
    where p.id = (select auth.uid())
  )
  select
    (select count(*)::int from public.connections c, me where c.student_id = me.id and c.status = 'accepted'),
    (select count(*)::int from public.mentor_profiles where is_available),
    (select case when me.is_demo then 48 else (
      select count(*)::int from public.student_plans sp
      join public.profiles p on p.id = sp.student_id
      where sp.pathway_id = me.pathway_id and p.cohort_id = me.cohort_id and p.id <> me.id
    ) end from me)
$$;

-- Switch pathway (principle 5): keeps every completion, credits shared tasks, records history.
create function public.switch_pathway(p_to text, p_reason text default null)
returns public.pathway_changes
language plpgsql security definer set search_path = '' as $$
declare
  v_student uuid := (select auth.uid());
  v_from text;
  v_kept int;
  v_credited int;
  v_change public.pathway_changes;
begin
  select pathway_id into v_from from public.student_plans where student_id = v_student for update;
  if v_from is null then
    raise exception 'No plan to switch.' using errcode = 'P0002';
  end if;
  if v_from = p_to then
    raise exception 'You are already on that pathway.' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.pathways where id = p_to) then
    raise exception 'Unknown pathway.' using errcode = 'P0001';
  end if;

  select count(*) into v_kept from public.task_completions where student_id = v_student;
  select count(*) into v_credited
  from public.tasks t
  where t.pathway_id = p_to and exists (
    select 1 from public.task_completions tc join public.tasks done on done.id = tc.task_id
    where tc.student_id = v_student
      and (done.id = t.id or (t.equivalence_key is not null and done.equivalence_key = t.equivalence_key))
  );

  update public.student_plans set pathway_id = p_to where student_id = v_student;
  insert into public.pathway_changes (student_id, from_pathway_id, to_pathway_id, reason, completed_kept, credited_in_new)
  values (v_student, v_from, p_to, nullif(trim(p_reason), ''), v_kept, v_credited)
  returning * into v_change;
  return v_change;
end;
$$;

-- Mentors verify shared outputs of accepted mentees; staff can verify any output.
create function public.verify_output(p_completion uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.task_completions;
begin
  select * into v_row from public.task_completions where id = p_completion;
  if v_row.id is null then
    raise exception 'Output not found.' using errcode = 'P0002';
  end if;
  if not ((select app.is_staff())
    or (v_row.shared_with_mentors and (select app.is_my_mentee(v_row.student_id, true)))) then
    raise exception 'Not allowed to verify this output.' using errcode = '42501';
  end if;
  update public.task_completions set verified_by = (select auth.uid()), verified_at = now()
  where id = p_completion;
  insert into public.audit_log (actor_id, action, entity, entity_id)
  values ((select auth.uid()), 'output.verified', 'task_completions', p_completion::text);
end;
$$;

revoke execute on function public.available_mentors(), public.network_stats(),
  public.switch_pathway(text, text), public.verify_output(uuid) from public, anon;
grant execute on function public.available_mentors(), public.network_stats(),
  public.switch_pathway(text, text), public.verify_output(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Fictional alumni for the demo and the pilot (no real people; employers are invented).
-- ---------------------------------------------------------------------------
insert into public.mentor_profiles
  (display_name, grad_year, role_title, employer, industry, city, grad_school, pathways, journey_tags, bio, capacity, is_seeded_fictional)
values
  ('Marcus Bell', 2019, 'Senior Program Manager', 'Peachtree Digital', 'Technology', 'Atlanta, GA', null, '{hired,job_search}', '{First-Generation,Relocating}', 'Moved from Bluefield to Atlanta with two suitcases. Happy to talk first jobs, budgets and finding your people in a new city.', 4, true),
  ('Alicia Moreno', 2021, 'Software Engineer', 'Peachtree Digital', 'Technology', 'Atlanta, GA', null, '{hired,job_search}', '{First-Generation,Financially Independent}', 'Switched from project coordination to engineering in my first two years. Ask me about learning on the job.', 3, true),
  ('Jordan Ellis', 2018, 'Engineering Manager', 'Southline Logistics', 'Technology', 'Atlanta, GA', 'Georgia State University', '{hired,higher_ed}', '{Relocating}', 'Did a part-time master''s while working. Glad to help with negotiating offers and planning a move.', 3, true),
  ('Priya Raman', 2020, 'Data Analyst', 'Bluegrass Health Network', 'Healthcare', 'Atlanta, GA', null, '{job_search,still_deciding}', '{International Student,Relocating}', 'Came to Bluefield as an international student. I can help with job searches, visas questions and building a network from scratch.', 3, true),
  ('Terrence Howard Jr.', 2016, 'Founder', 'Ridgeway Coffee Co.', 'Entrepreneurship', 'Atlanta, GA', null, '{entrepreneurship,still_deciding}', '{First-Generation,Veteran}', 'Army veteran turned small-business owner. Ask me about pricing, first customers and keeping a steady personal budget.', 2, true),
  ('Danielle Price', 2022, 'Associate Product Manager', 'Mountain State Software', 'Technology', 'Charleston, WV', null, '{hired,job_search}', '{First-Generation,Staying Local}', 'Stayed in West Virginia and found a great tech job close to home. Happy to talk local opportunities.', 3, true),
  ('Kevin Osei', 2017, 'Registered Nurse', 'Kanawha Valley Medical Center', 'Healthcare', 'Charleston, WV', 'Marshall University', '{hired,higher_ed}', '{Parent / Caregiver}', 'Working nurse and dad of two. I can help with licensure, first-year nursing jobs and balancing family.', 3, true),
  ('Rachel Kim', 2020, 'Graduate Student, Public Health', null, 'Healthcare', 'Morgantown, WV', 'West Virginia University', '{higher_ed}', '{First-Generation,Financially Independent}', 'Funded my MPH with an assistantship. Ask me about applications, funding and the first semester.', 4, true),
  ('Samuel Greer', 2015, 'Detective', 'Mercer County Sheriff''s Office', 'Public Safety', 'Bluefield, WV', null, '{hired,job_search}', '{Veteran,Staying Local}', 'Criminal justice grad and Marine veteran. Happy to talk public safety careers and background checks.', 3, true),
  ('Monique Carter', 2019, 'High School Teacher', 'Mercer County Schools', 'Education', 'Princeton, WV', 'Concord University', '{hired,higher_ed}', '{First-Generation,Staying Local}', 'Teaching where I grew up. Ask me about certification, first-year classrooms and grad credits.', 3, true),
  ('Luis Fernandez', 2021, 'Civil Engineering Technician', 'Allegheny Engineering Group', 'Engineering', 'Pittsburgh, PA', null, '{hired,job_search}', '{Relocating,Transfer}', 'Transferred to Bluefield State and then moved to Pittsburgh. Happy to talk relocation and engineering roles.', 3, true),
  ('Hannah Brooks', 2018, 'Doctoral Candidate, Chemistry', null, 'Science', 'Blacksburg, VA', 'Virginia Tech', '{higher_ed,still_deciding}', '{First-Generation}', 'From undergrad research to a PhD program. Ask me about research experience and graduate funding.', 3, true),
  ('Andre Williams', 2014, 'Financial Advisor', 'Blue Ridge Financial Partners', 'Business & Finance', 'Roanoke, VA', null, '{hired,entrepreneurship}', '{Financially Independent}', 'Helping grads build their first budgets for ten years. Bring your numbers and your questions.', 4, true),
  ('Grace Okafor', 2020, 'Social Worker', 'Appalachian Family Services', 'Social Services', 'Beckley, WV', 'West Virginia University', '{hired,higher_ed}', '{Parent / Caregiver,Staying Local}', 'MSW grad and mom. I can help with licensure, grad school and finding support close to home.', 3, true),
  ('Tyler Nguyen', 2022, 'Cybersecurity Analyst', 'Shenandoah Systems', 'Technology', 'Richmond, VA', null, '{job_search,hired}', '{Relocating}', 'Landed my first role after 60 applications. Ask me about resumes, certifications and interviews.', 3, true),
  ('Brianna Scott', 2019, 'HR Generalist', 'Summit Health Partners', 'Business & Finance', 'Charlotte, NC', null, '{job_search,hired}', '{First-Generation,Relocating}', 'I review resumes for a living. Happy to do mock interviews and explain benefits packages.', 4, true),
  ('Isaiah Turner', 2017, 'Owner', 'Turner Mobile Detailing', 'Entrepreneurship', 'Bluefield, WV', null, '{entrepreneurship}', '{First-Generation,Staying Local}', 'Started with one bucket and a borrowed van. Ask me about business registration and finding customers.', 2, true),
  ('Olivia Martin', 2021, 'Law Student', null, 'Law', 'Lexington, KY', 'University of Kentucky', '{higher_ed,still_deciding}', '{Transfer,Financially Independent}', 'Took a gap year before law school. Ask me about the LSAT, gap years and paying for school.', 3, true),
  ('Derrick Lewis', 2013, 'Operations Director', 'Riverbend Manufacturing', 'Engineering', 'Charlotte, NC', null, '{hired,still_deciding}', '{Veteran,Relocating}', 'Navy veteran, engineering technology grad. I mentor on first-year leadership and relocation.', 3, true),
  ('Sofia Alvarez', 2023, 'Marketing Coordinator', 'Peachtree Digital', 'Business & Finance', 'Atlanta, GA', null, '{job_search,hired}', '{International Student,Relocating}', 'Recent grad who just made the move to Atlanta. I remember exactly how the first month feels.', 3, true),
  ('Nathan Reed', 2016, 'Physician Assistant', 'Tri-State Medical Group', 'Healthcare', 'Huntington, WV', 'Marshall University', '{higher_ed,hired}', '{First-Generation}', 'PA school after Bluefield State. Ask me about health-professions applications and interviews.', 3, true),
  ('Keisha Johnson', 2018, 'Program Officer', 'Southern Highlands Foundation', 'Social Services', 'Atlanta, GA', 'Georgia State University', '{higher_ed,job_search}', '{First-Generation,Parent / Caregiver}', 'Nonprofit career and a master''s while parenting. Happy to talk grants, nonprofits and balance.', 3, true),
  ('Ethan Walker', 2020, 'Electrical Engineer', 'Volt Grid Solutions', 'Engineering', 'Columbus, OH', 'Ohio State University', '{hired,higher_ed}', '{Relocating}', 'Engineering grad now working on power systems. Ask me about co-ops and moving for work.', 3, true),
  ('Maya Patel', 2022, 'UX Designer', 'Lumen Labs', 'Technology', 'Raleigh, NC', null, '{job_search,still_deciding}', '{First-Generation,Financially Independent}', 'Taught myself design while studying CS. I love helping people who aren''t sure what fits yet.', 3, true),
  ('Christopher Hall', 2012, 'Small Business Advisor', 'Mountain State SBDC', 'Entrepreneurship', 'Charleston, WV', null, '{entrepreneurship}', '{Veteran}', 'I help new founders write business plans and find funding. Bring your idea, however early.', 4, true),
  ('Jasmine Wright', 2021, 'Admissions Counselor', 'Bluefield State University', 'Education', 'Bluefield, WV', null, '{still_deciding,higher_ed}', '{First-Generation,Staying Local}', 'Still on campus and always happy to talk next steps, grad options or just thinking out loud.', 5, true),
  ('Robert Chen', 2015, 'Accountant', 'Ledger & Line CPAs', 'Business & Finance', 'Washington, DC', 'George Mason University', '{hired,higher_ed}', '{International Student}', 'CPA after a master''s in accounting. Ask me about the CPA path and city living costs.', 3, true),
  ('Amara Diallo', 2023, 'Research Assistant', 'Emory Vaccine Center', 'Science', 'Atlanta, GA', 'Emory University', '{higher_ed,still_deciding}', '{International Student,Relocating}', 'Working in a research lab before applying to grad school. Ask me about gap years in research.', 3, true),
  ('Brandon Mitchell', 2019, 'Logistics Coordinator', 'Southline Logistics', 'Business & Finance', 'Atlanta, GA', null, '{job_search,hired}', '{Transfer,Financially Independent}', 'Transfer student who found his footing in supply chain. Happy to talk job searching and first paychecks.', 3, true),
  ('Lauren Adams', 2017, 'Counselor', 'New River Counseling', 'Social Services', 'Roanoke, VA', 'Radford University', '{higher_ed,still_deciding}', '{Parent / Caregiver}', 'Licensed counselor. I can talk grad school, licensure and looking after yourself through big changes.', 2, true),
  ('Victor Santos', 2020, 'Founder', 'Appalachian Craft Goods', 'Entrepreneurship', 'Asheville, NC', null, '{entrepreneurship,still_deciding}', '{Relocating,First-Generation}', 'Sell handmade goods online and at markets. Ask me about side hustles that grow into businesses.', 3, true),
  ('Tasha Green', 2014, 'Nurse Manager', 'Piedmont Care Hospital', 'Healthcare', 'Atlanta, GA', null, '{hired,job_search}', '{First-Generation,Parent / Caregiver}', 'From new-grad nurse to managing a unit. Ask me about the first year and finding a mentor at work.', 3, true),
  ('Owen Parker', 2022, 'Teach for Appalachia Fellow', 'Teach for Appalachia', 'Education', 'Welch, WV', null, '{still_deciding,job_search}', '{Staying Local}', 'Took a two-year teaching fellowship while I figure out my long-term plan. Happy to talk fellowships.', 3, true),
  ('Elena Petrova', 2018, 'Product Designer', 'Mountain State Software', 'Technology', 'Pittsburgh, PA', 'Carnegie Mellon University', '{higher_ed,hired}', '{International Student,Relocating}', 'Did a design master''s and moved twice. Ask me about portfolios, grad school and relocating.', 0, true);
