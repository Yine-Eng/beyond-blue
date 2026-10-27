# Beyond Blue: Product Requirements Document

> **From Countdown to Launchpad.** A university-wide 100-day transition experience for every graduating senior at Bluefield State University.
>
> Team Northbound · Disney on the Yard Innovation Challenge 2026 · Status: **Draft for review** · Owner: Sampson (`Yine-Eng`)

---

## 1. Problem

*"What happens after graduation?"*

Seniors follow a clear path for four years and then, in the last semester, the path ends. They face decisions they have never made before: work or grad school, where to live, what a move costs, how a first paycheck actually works, and what to do if the plan falls apart.

- **68% of fourth-year students say thinking about life after graduation causes them stress** (Inside Higher Ed Student Voice survey, 2024).
- Seniors are in very different places. Some already have offers, some are applying to grad school, some are still searching, some are starting something of their own, and some don't know yet. One-size-fits-all career workshops serve none of them well.
- Existing support (Career Services, alumni, financial aid, counseling) exists but is scattered. Students don't know who to talk to, when, or about what.
- Attendance-based programs don't produce outcomes. A student can attend a budgeting session and still leave without a budget.

## 2. Solution

Beyond Blue gives every graduating senior **one shared core curriculum** delivered over the final **100 days**, adapted through **five personalized pathways**, built on **real-world assignments**, backed by **human mentorship** and **targeted support**. The app is the student's companion for that experience: it maps their 100 days, tracks verified outputs, connects them with alumni, and assembles everything into an exportable **Launch File** at graduation.

### 2.1 Day 0 outcome

Every student leaves with:

| ✅ | Outcome | Where it lives in the app |
|---|---|---|
| ✅ | **A plan:** their next 100 days mapped out | Plan screen → Launch File "Next-step plan" |
| ✅ | **A budget** | Financial Readiness outputs → Launch File "Financial prep" |
| ✅ | **A network** | Network screen connections → Launch File "My network" |
| ✅ | **A backup plan** | Detour Challenge → Launch File "Detour plan" |
| ✅ | **A place to turn:** still connected to Bluefield State | Day +100 check-in, alumni mentor opt-in, resources |

## 3. Goals and non-goals

### 3.1 Goals
1. Every senior can choose a pathway and get a personalized 100-day plan in **under 2 minutes**.
2. Progress measures **tangible outputs** (a budget, an offer review, a housing comparison), not attendance.
3. Changing plans never means starting over (pathway switches keep all completed work).
4. Students are connected to real people (alumni, mentors, staff) with a visible reason for each match.
5. Program staff can see cohort progress and intervene early with students who are falling behind.
6. Judges can experience the full product on their phones in **one tap**, without signing up (demo mode).
7. The program is measurable at **Day 100, graduation (Day 0) and Day +100**.

### 3.2 Non-goals (MVP)
- Not a job board, application tracker or LMS replacement.
- No real-time chat (stretch goal), no native app store builds (installable PWA instead).
- No collection of sensitive financial or identity data: **no SSNs, bank accounts, card numbers or exact salaries are ever stored.** Budget outputs are student-authored documents or ranged inputs.
- Last Mile Fund **disbursement** happens outside the app (through BSU's existing finance process). The app handles request, documentation and review only.
- No integration with BSU's SIS/SSO in the MVP (magic-link email instead; see open questions).

## 4. Personas

All personas are fictional composites. No real students' names or photos are used.

### 4.1 Veronica: primary persona, demo account (Hired pathway)
- **Senior, Class of 2027**, graduates in 100 days. First-generation college student, financially independent.
- Has an offer as a Program Manager in **Atlanta, GA**, with a long-term goal of moving into Software Engineering ("Program Manager → Software Engineer").
- Torn for months between work and grad school; chose work but wants a backup plan if the start date slips.
- **Needs:** understand her offer and benefits, budget for a move, find housing in a city she has never lived in, meet someone who has done this before.
- **Journey tags:** First-Generation · Relocating · Financially Independent.
- **Quote:** "I've followed the plan for four years. Now there's no plan."

### 4.2 Marcus: Job Search
- Business Administration senior, applying broadly, 3 interviews and no offers yet. Stays near home to support family.
- **Needs:** a sharper resume, interview practice, and a network beyond his professors.
- **Journey tags:** Parent/Caregiver · Transfer.

### 4.3 Aaliyah: Higher Education
- Biology senior, admitted to two MSN/MPH programs, waiting on funding decisions.
- **Needs:** compare programs by real cost, find scholarships and assistantships, plan the summer bridge and a possible move.
- **Journey tags:** First-Generation · Relocating.

### 4.4 Diego: Entrepreneurship
- Engineering Technology senior running a small drone-photography side business that he wants to go full-time with.
- **Needs:** business registration basics, pricing, first customers, and a realistic personal budget while revenue is uneven.
- **Journey tags:** Veteran · Financially Independent.

### 4.5 Jordan: Still Deciding
- Psychology senior with no clear next step, interested in both social work and UX research. Jordan uses they/them pronouns.
- **Needs:** low-stakes ways to test careers, conversations with alumni in different fields, and a 90-day next-step plan that isn't "figure it out later."
- **Journey tags:** International Student.

### 4.6 Supporting personas
- **Dr. Reed: Career Services director (Staff/Admin).** Owns the program. Needs cohort-level visibility, an at-risk list, a fair Last Mile Fund review process, and Day +100 evidence for leadership.
- **Tasha: alumna mentor (Class of 2019, Software Engineer in Atlanta).** Gives one or two hours a month. Needs clear, well-scoped requests and context about the student before she says yes.

## 5. The product model

| Concept | Definition |
|---|---|
| **Cohort** | A graduating class (e.g. Spring 2027) with a graduation date and time zone. Drives the countdown. |
| **Pathway** | One of five: Hired, Job Search, Higher Education, Entrepreneurship, Still Deciding. Students choose one and can switch at any time. |
| **Readiness area** | One of five shared areas, each anchored to a milestone on the countdown: Career Readiness (Day 100), Financial Readiness (Day 75), Relocation & Life Logistics (Day 50), Network & Mentorship (Day 25), Wellness & Detour Planning (Day 0). |
| **Task (step)** | A pathway × area assignment with a due day offset and a required **output type** (file, link or structured form). Each pathway has **30 steps** (6 per area). |
| **Output** | The tangible artifact that completes a task. Saved to the student's Launch File. |
| **Launch File** | The assembled, exportable record of every output: next-step plan, financial prep, professional/educational strategy, network, resources, Detour plan. |
| **Detour Challenge** | A guided "what if plan A changes?" builder that produces a backup plan. |
| **Last Mile Fund** | Small, capped, verified micro-grants for barriers tied to a real next step. |
| **Day +100** | A check-in 100 days after graduation. Graduates share what worked, which improves the program and opens the door to mentoring. |
| **Alumni Loop** | Senior → Graduate → Day +100 → Alumni mentor → Next senior starts with more. |

## 6. User stories and acceptance criteria

Format: **As a** role, **I want** capability, **so that** benefit. Acceptance criteria (AC) are written so they can become tests. IDs are referenced from `docs/roadmap.md`.

### 6.1 Demo mode (critical for judging)

**US-DEMO-1.** As a judge, I want to explore the app as Veronica with one tap so that I can evaluate it on my phone without creating an account.
- AC1: The landing page hero and footer show **"Try the demo as Veronica"**. One tap lands on Veronica's Plan screen in **≤ 3 s** on a mid-range phone over 4G.
- AC2: The demo shows realistic seeded data: Hired pathway, **87 days to graduation**, **12 of 30 steps complete**, an active focus task, partial progress in each readiness area, 3+ alumni matches, one pending connection, a partially built Launch File.
- AC3: The countdown always reads 87 days in demo mode regardless of the real date (the demo cohort's graduation date is relative to the session start).
- AC4: Every demo session is isolated. Changes made by one judge never appear for another, and a "Reset demo" action restores the seed.
- AC5: A persistent, dismissible "Demo mode" banner explains that data is sample data and offers "Create your own plan".
- AC6: Demo sessions are purged automatically after 24 hours. Demo users cannot upload files larger than 2 MB and are rate-limited.
- AC7: Staff demo: a "View as program staff" toggle shows the staff dashboard with a seeded cohort.

### 6.2 Authentication and roles

**US-AUTH-1.** As a student, I want to sign in with a magic link sent to my email so that I don't have to manage a password.
- AC1: Entering an email sends a magic link. Clicking it signs the user in and redirects to onboarding (first time) or the Plan screen (returning).
- AC2: Invalid or expired links show a clear error with a "Send a new link" action.
- AC3: Magic-link requests are rate-limited per email and per IP.
- AC4: Optional allowlist of email domains (e.g. `@bluefieldstate.edu`) is configurable by environment variable.

**US-AUTH-2.** As the program owner, I want role-based access so that each user only sees what they should.
- AC1: Roles are `student`, `mentor`, `staff`, `admin`. New sign-ups default to `student`. Only `admin` can change roles.
- AC2: A student can only ever read or write their own data. This is enforced by Postgres Row Level Security and verified by automated policy tests.
- AC3: Staff routes return 404 (not 403) to non-staff users so they aren't discoverable.

### 6.3 Personalize (onboarding)

**US-ONB-1.** As a new student, I want to pick where I'm headed so that my plan fits my situation.
- AC1: Screen title "Build Your Beyond Blue" and prompt **"Where are you headed?"** show five pathway options with their self-description ("I already have a job.", etc.) and accent color.
- AC2: Exactly one pathway must be selected to continue. The choice is keyboard- and screen-reader-operable (radio group semantics).

**US-ONB-2.** As a new student, I want to describe my journey so that resources and mentor matches reflect my circumstances.
- AC1: Prompt **"What describes your journey?"** offers multi-select tags: First-Generation, International Student, Relocating, Transfer, Parent/Caregiver, Financially Independent, Veteran, plus "Prefer not to say".
- AC2: Tags are optional. Selecting "Prefer not to say" clears the others.
- AC3: A short note explains how tags are used (matching and resources only, never shared with mentors without consent).

**US-ONB-3.** As a new student, I want my plan created instantly so that I can start right away.
- AC1: Collects the minimum profile fields: preferred name, major, target city (optional), destination role (optional).
- AC2: **"Create My 100-Day Plan →"** generates the plan (30 steps for the chosen pathway) and shows a short celebratory transition to the Plan screen.
- AC3: Generation is idempotent. Double-submitting never creates duplicate plans.
- AC4: Progress through onboarding survives a page refresh.

### 6.4 Prepare (Plan screen)

**US-PLAN-1.** As a student, I want to see how many days I have left and how far along I am so that I know where I stand.
- AC1: Greeting adapts to local time of day ("Good morning, Veronica").
- AC2: Large countdown **"N Days to Graduation"** computed from the cohort graduation date in the cohort's time zone. It is correct across DST changes and for users in other time zones (unit-tested).
- AC3: Progress bar **"X of 30 steps complete"** with an accessible text equivalent.
- AC4: After graduation the countdown switches to the Day 0 "Launchpad" moment, then to "Day +N".

**US-PLAN-2.** As a student, I want to see my current focus so that I know what to do next.
- AC1: A **"Your 100-Day Curriculum"** focus card shows the single most relevant incomplete task: the earliest-due incomplete task in the currently active area, or the most overdue task if any.
- AC2: The card shows area, due day, output type and a "Start" action.

**US-PLAN-3.** As a student, I want to see my five readiness areas so that I can work across my whole transition.
- AC1: Five colored cards (Career pink, Financial gold, Relocation blue, Network green, Wellness purple), each with milestone day, progress ("3 of 6") and status (upcoming / active / complete / behind).
- AC2: Tapping a card opens its task list with each task's title, why it matters, due day, output type and status.
- AC3: All tasks are visible from day one (students can work ahead). Tasks in the active window are highlighted; tasks past their due day are marked "Behind" without blocking completion.

### 6.5 Task completion with verified outputs

**US-TASK-1.** As a student, I want to complete a task by attaching what I made so that my progress reflects real work.
- AC1: Each task defines an output type: **file** (PDF, PNG, JPG, WEBP, DOCX, ≤ 10 MB), **link** (https URL), or **form** (structured fields defined in the curriculum, e.g. a 90-day budget table, a housing comparison).
- AC2: A task can't be marked complete without a valid output. Validation errors are shown inline.
- AC3: On completion a check-burst animation plays (static check if reduced motion is on), progress updates immediately, and the output appears in the Launch File.
- AC4: Students can edit or replace an output. Previous versions are not kept in the MVP.
- AC5: Uploads go to private storage scoped to the student. Only the student, their accepted mentors (if shared) and staff can view them.
- AC6: Staff or an accepted mentor can mark an output **Verified**, which shows a verified badge. Progress counts completed outputs; verification is an additional signal (see open questions).

### 6.6 Profile

**US-PROF-1.** As a student, I want a profile that shows who I am and where I'm going.
- AC1: Shows avatar (initials by default, optional uploaded photo), name, "Senior · Class of 2027", major, school.
- AC2: Status card: "You did it! Now prepare for a strong start." (copy adapts to countdown stage).
- AC3: Destination role ("Program Manager → Software Engineer"), target city ("Atlanta, GA") and "My Journey" tags.
- AC4: **"View My Beyond Blue →"** opens the Launch File.
- AC5: Students can edit their profile fields and journey tags. "Switch pathway" is reachable from here.

### 6.7 Connect (Network)

**US-NET-1.** As a student, I want to see my network at a glance.
- AC1: Title "Your Beyond Blue Network" with stats: **Mentors** (accepted connections), **Alumni** (available alumni mentors), **Students on your path** (count of students in my cohort on my pathway; counts only, no identities).

**US-NET-2.** As a student, I want alumni suggestions with a clear reason so that reaching out feels purposeful.
- AC1: "Alumni You May Want to Meet" shows cards with initials avatar, name, role, company, and a **"why matched"** line generated from the scoring function (e.g. "Also moved to Atlanta · Works in software · First-gen grad").
- AC2: Ranking uses the transparent scoring function in `docs/architecture.md` §5. Ties are broken by mentor availability.
- AC3: Mentors at capacity are hidden from suggestions.

**US-NET-3.** As a student, I want to send a connection request and see its status.
- AC1: "Connect" opens a short request form (pre-filled reason and an optional note of up to 300 characters).
- AC2: States: **Connect → Pending → Connected** or **Declined** (shown to the student as "Not available right now") and **Withdrawn**.
- AC3: Students can have at most 3 pending requests at once.

**US-MENT-1.** As a mentor, I want to review requests and support mentees.
- AC1: Mentors see incoming requests with the student's first name, pathway, target city, shared goals and the match reason, then accept or decline.
- AC2: For accepted mentees, mentors see the goals and outputs the student chose to share, can log a conversation (date, topic, notes) and can verify shared outputs.
- AC3: Mentors set a capacity (max active mentees) and can pause availability.

### 6.8 Switch pathway (built to adapt)

**US-SWITCH-1.** As a student whose plans changed, I want to switch pathways without losing my work.
- AC1: "Switch pathway" shows the five pathways, a preview of what changes ("You'll keep 12 completed steps. 4 of them count toward your new plan. 26 steps remain.") and a confirm step.
- AC2: **All completed outputs are kept** and stay in the Launch File, labelled with the pathway they were completed under.
- AC3: Tasks shared across pathways (same equivalence key, e.g. "Build a 90-day budget") are credited automatically in the new plan.
- AC4: The change is recorded in pathway history with an optional reason (offer fell through, grad plans changed, etc.).
- AC5: Mentor connections persist. New suggestions reflect the new pathway.

### 6.9 Detour Challenge

**US-DETOUR-1.** As a student, I want a guided way to plan for "what if plan A changes?" so that a setback doesn't become a crisis.
- AC1: A 5-step guided builder: (1) name plan A, (2) pick the most likely detour (offer rescinded, start date delayed, funding denied, didn't get in, relocation falls through, other), (3) early warning signs, (4) plan B actions with a first step and a person to call, (5) a minimum monthly budget to stay afloat.
- AC2: Progress saves after each step. The finished plan completes the Detour task and appears in the Launch File as the "Detour plan".
- AC3: Prompts adapt to the pathway (e.g. Higher Ed: "If funding doesn't come through…").
- AC4: The final step links to support: Career Services, Counseling, Last Mile Fund.

### 6.10 Launch File

**US-LF-1.** As a student, I want one place that assembles everything I've built.
- AC1: Sections: Next-step plan, Financial prep, Professional/Educational strategy, My network, Resources, Detour plan. Each lists its outputs with completion date, verified badge and pathway label.
- AC2: Empty sections show an encouraging empty state that links to the relevant task.

**US-LF-2.** As a student, I want to export my Launch File as a PDF.
- AC1: "Download PDF" produces a branded, accessible (tagged text, real fonts) PDF with all sections. Files are listed as links, form outputs are rendered as tables.
- AC2: Export works on iOS Safari and Android Chrome, and finishes in ≤ 5 s for a complete file.
- AC3: Each export is recorded (timestamp, version) for staff metrics.

### 6.11 Last Mile Fund

**US-FUND-1.** As a student facing a cost barrier tied to a real next step, I want to request a micro-grant.
- AC1: Form fields: category (certification fee, background check, interview travel, deposit, relocation, other), amount (whole dollars, ≤ the configured cap, default **$250**), the next step it unlocks, justification (50–1000 chars), supporting document (optional, ≤ 10 MB) and needed-by date.
- AC2: No bank or card details are collected. A note explains that disbursement happens through the university.
- AC3: Students see request status: Submitted → In review → Approved / Declined / Needs info, with reviewer notes.
- AC4: One open request per student at a time.

**US-FUND-2.** As a staff reviewer, I want a fair review queue so that every request is judged by the same criteria.
- AC1: Queue lists requests oldest-first with filters by status and category, plus the remaining fund balance.
- AC2: The review view shows a fixed rubric checklist (tied to a real next step, documented, within cap, no other source available) that must be completed before a decision.
- AC3: Decisions require a note. Every action is written to the audit log.
- AC4: Approvals can't exceed the remaining fund balance.

### 6.12 Staff dashboard

**US-STAFF-1.** As program staff, I want to see cohort progress so that I can manage the program.
- AC1: Cohort selector. KPIs: students enrolled, % onboarded, average steps complete, % with a Detour plan, % with a mentor connection.
- AC2: Progress heat map by pathway × readiness area.
- AC3: Pathway distribution and pathway switches over time.

**US-STAFF-2.** As program staff, I want to see who is falling behind so that I can reach out early.
- AC1: **At-risk list:** students whose completed steps trail the expected pace for the current day by ≥ 5 steps, or who haven't been active in 14 days, or who have an overdue Detour task within 10 days of graduation.
- AC2: Each row shows the reason, pathway, last active date and a contact action (mailto). Students' outputs are only visible to staff in the context of their role.

### 6.13 Day +100 check-in

**US-D100-1.** As a graduate, I want a short check-in at Day +100 so that I can share what worked and stay connected.
- AC1: Available from Day +90 to +130. Takes ≤ 3 minutes: current status (employed / enrolled / self-employed / searching / other), plan usefulness (1–5), stress compared with graduation (1–5), most useful part, what to improve, and opt-ins (mentor future seniors, lead a session, give to the Last Mile Fund).
- AC2: Opting in to mentor creates a mentor profile draft for the graduate to complete.

**US-D100-2.** As program staff, I want aggregated Day +100 insights.
- AC1: Aggregates by pathway: outcome distribution, average usefulness, stress delta, top themes (free text listed, not auto-summarized in the MVP), mentor opt-in rate.
- AC2: Groups with fewer than 5 responses are suppressed to protect anonymity.

### 6.14 Public story site

**US-SITE-1.** As a judge or visitor, I want a one-page story that mirrors the pitch deck.
- AC1: Sections in order: Hero → Meet Veronica → "You're not alone" (68% with source) → 5 Pathways (interactive) → How it works (6 principles) → In Your Pocket → Alumni Loop (animated) → Built to Last → Budget table ($10,000) → From Countdown to Launchpad → FAQ → CTA.
- AC2: Lighthouse mobile ≥ 90 on all four categories. Animations respect reduced motion.
- AC3: Team Northbound credits and the "Built by Bluefield" note are visible.

## 7. Success metrics

Measured at the three program checkpoints, matching the deck.

| Checkpoint | Metric | Pilot target |
|---|---|---|
| **Day 100** (start) | % of graduating seniors onboarded with a pathway | ≥ 60% |
| | Median time from first visit to plan created | ≤ 2 min |
| | Baseline stress self-report (1–5) | captured for ≥ 80% of onboarded |
| **Day 0** (graduation) | % with all 5 Day 0 outcomes (plan, budget, network, backup plan, place to turn) | ≥ 50% |
| | Average steps complete (of 30) | ≥ 20 |
| | % with a completed Detour plan | ≥ 70% |
| | % with ≥ 1 accepted mentor/alumni connection | ≥ 50% |
| | % who exported a Launch File | ≥ 60% |
| | Last Mile Fund: median days from request to decision | ≤ 5 |
| **Day +100** | Day +100 response rate | ≥ 40% |
| | % employed, enrolled or self-employed (vs. institutional baseline) | ≥ baseline + 10 pts |
| | Plan usefulness (avg, 1–5) | ≥ 4.0 |
| | % reporting lower stress than at graduation | ≥ 60% |
| | % opting in to mentor future seniors | ≥ 20% |
| **Product health** | Lighthouse mobile (all categories) | ≥ 90 |
| | Demo sessions started / completed ≥ 3 screens (competition) | tracked, privacy-friendly |

Targets are proposals for the pilot and should be confirmed with Career Services.

## 8. Constraints
- **Budget:** app infrastructure and publishing must stay within **$250** (deck budget line). Free tiers of Vercel and Supabase cover the pilot.
- **Built by Bluefield:** the app is built as paid applied learning for BSU CS students. The codebase must be readable and well documented for future student maintainers.
- **Privacy:** minimal PII, FERPA-aware handling of student records, no sensitive financial identifiers.
- **Accessibility:** WCAG 2.1 AA.

## 9. Open questions
See `docs/open-questions.md`.
