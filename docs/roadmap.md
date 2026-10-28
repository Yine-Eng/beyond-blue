# Beyond Blue: Roadmap

> Status: **Approved** (PR #1). `scripts/github-bootstrap.sh` created the labels, milestones and issues (#2–#55) and the "Beyond Blue Roadmap" Projects board from this file. Edit issues here first, then on GitHub.

## Delivery schedule (planned backwards from judging)

**Submission: Thu 29 Oct 2026 · Judging: Fri 30 Oct 2026.** The size estimates below are normal-team estimates; the schedule compresses them, so the cut order is fixed in advance.

| When | Milestone | Must-have for that slot |
|---|---|---|
| Tue 27 Oct (evening) | **M0** → `v0.1.0` | Scaffold, tooling, CI, tokens + fonts, scrapbook kit, app shell |
| Wed 28 Oct (morning) | **M1** → `v0.2.0` | Full story site with the deck FAQ, demo CTA |
| Wed 28 Oct (afternoon–night) | **M2** → `v0.3.0` | Supabase schema + RLS, curriculum seed, onboarding, Plan, task outputs, Profile, **Explore as Veronica** |
| Thu 29 Oct (morning) | **M3 + M4** → `v0.4.0`, `v0.5.0` | Network + matching, switch pathway, Detour, Launch File + PDF, fund request + review |
| Thu 29 Oct (midday) | **M6** → `v1.0.0` | PWA, a11y + Lighthouse pass, e2e smoke, README + QR, submit |
| Only if time remains | **M5** | Staff dashboard, Day +100 |

**Cut order if time runs short:** (1) stretch goals, (2) M5 (staff dashboard, Day +100), (3) M6 nice-to-haves (persona switcher, Lighthouse CI automation), keeping a manual Lighthouse run. Demo mode is never cut.

## How to read this

- **Milestones** match CLAUDE.md §10. Each ends with a tagged release and a working demo.
- **Estimates** (`size:*` labels): **XS** ≤ 1 h · **S** ≤ 3 h · **M** ≤ 1 day · **L** ≤ 2 days · **XL** > 2 days (split before starting).
- **Priority:** **p0** must ship for the milestone · **p1** should ship · **p2** nice to have.
- **Issue numbers:** GitHub numbers issues and PRs from one shared counter. The planning PR took **#1**, so issues run **#2–#55** in the order below (scaffold = #2, branch `feature/2-project-scaffold`).
- **Approved change to §10:** a **baseline "Explore as Veronica"** is pulled into M2 so every milestone from M2 onwards is demoable by judges on a phone. M6 keeps the hardening work (cleanup job, staff demo, polish).

## Labels

| Group | Labels |
|---|---|
| Type | `type:feature`, `type:bug`, `type:chore`, `type:docs`, `type:test`, `type:design`, `type:security` |
| Area | `area:infra`, `area:design-system`, `area:landing`, `area:auth`, `area:onboarding`, `area:plan`, `area:tasks`, `area:profile`, `area:network`, `area:pathways`, `area:detour`, `area:launch-file`, `area:fund`, `area:staff`, `area:day-plus-100`, `area:demo`, `area:pwa`, `area:a11y`, `area:data` |
| Priority | `priority:p0`, `priority:p1`, `priority:p2` |
| Size | `size:XS`, `size:S`, `size:M`, `size:L`, `size:XL` |

## Summary

| Milestone | Release | Issues | Est. days | Demo at the end |
|---|---|---|---|---|
| M0 · Foundation | v0.1.0 | 11 | ~6 | App shell + UI kit on a live Vercel URL |
| M1 · Story site | v0.2.0 | 7 | ~5 | Full landing page on phones |
| M2 · Core student app | v0.3.0 | 13 | ~12 | Sign up, onboard, plan, complete tasks, profile, Explore as Veronica |
| M3 · Network and adaptivity | v0.4.0 | 6 | ~7 | Alumni matches, connections, switch pathway, Detour Challenge |
| M4 · Launch File and Fund | v0.5.0 | 4 | ~5 | Launch File PDF, fund request + review |
| M5 · Staff and Day +100 | v0.6.0 | 5 | ~5 | Staff dashboard, at-risk list, Day +100 survey + insights |
| M6 · Polish and demo | v1.0.0 | 8 | ~7 | Installable PWA, Lighthouse ≥ 90, e2e, README with QR |

<!-- issues:start -->

## M0 · Foundation (v0.1.0)
> Repo scaffold, tooling, CI, design tokens, fonts, layout shell, UI kit page, docs.

#### Project scaffold: Next.js, TypeScript strict, Tailwind, npm
<!-- labels: type:chore, area:infra, priority:p0, size:M -->
**Description.** Create the Next.js App Router app with TypeScript strict mode, Tailwind CSS v4, ESLint and Prettier, using npm and Node 24 LTS.

**Acceptance criteria**
- [ ] Next.js (latest stable, exact version pinned) with the `src/` layout from `docs/architecture.md` §2.3
- [ ] `tsconfig` strict with `noUncheckedIndexedAccess`; path alias `@/*`
- [ ] `.nvmrc` (24) and `"engines": { "node": ">=22" }` in `package.json`
- [ ] ESLint (Next + `jsx-a11y` + `@typescript-eslint` strict) and Prettier (with Tailwind plugin) configured
- [ ] Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`
- [ ] `.env.example` committed; `.env.local` git-ignored
- [ ] `npm run lint && npm run typecheck && npm run build` pass

**Estimate:** M

#### Git hooks and commit conventions: Husky, lint-staged, commitlint
<!-- labels: type:chore, area:infra, priority:p0, size:S -->
**Description.** Enforce Conventional Commits and formatting locally.

**Acceptance criteria**
- [ ] Husky `pre-commit` runs lint-staged (ESLint fix + Prettier on staged files)
- [ ] Husky `commit-msg` runs commitlint with `@commitlint/config-conventional` and the allowed scopes documented in `docs/git-workflow.md`
- [ ] A bad message (`update stuff`) is rejected; a good one (`feat(plan): add area cards`) passes

**Estimate:** S

#### Test harness: Vitest, React Testing Library, Playwright
<!-- labels: type:test, area:infra, priority:p0, size:M -->
**Description.** Set up unit and e2e testing with mobile and desktop projects.

**Acceptance criteria**
- [ ] Vitest + RTL + jsdom with a sample component test; coverage via v8
- [ ] Playwright projects: `mobile` (iPhone 13/375 px), `tablet` (768 px), `desktop` (1280 px)
- [ ] `@axe-core/playwright` helper and one smoke test (home page renders, no a11y violations)
- [ ] Scripts: `test`, `test:watch`, `test:e2e`

**Estimate:** M

#### CI workflow on GitHub Actions
<!-- labels: type:chore, area:infra, priority:p0, size:M -->
**Description.** Run quality gates on every PR into `develop` and `main`.

**Acceptance criteria**
- [ ] Workflow `CI` with job `quality`: install (npm cache) → lint → format:check → typecheck → unit tests → build
- [ ] Job `e2e`: Playwright smoke on chromium (mobile + desktop projects), uploads the report as an artifact on failure
- [ ] Workflow `PR title` validates Conventional Commit PR titles (squash merges use the title)
- [ ] Concurrency cancels superseded runs
- [ ] Check names reported back so they can be added to the ruleset as required status checks

**Estimate:** M

#### Vercel project, preview deployments and environments
<!-- labels: type:chore, area:infra, priority:p0, size:S -->
**Description.** Connect the repo to Vercel (Hobby) with production from `main` and previews for every PR.

**Acceptance criteria**
- [ ] Production branch `main`; preview deploys for PR branches with the link posted on the PR
- [ ] Env vars documented in `.env.example` and set per environment in Vercel (no secrets in the repo)
- [ ] Security headers configured (CSP, Referrer-Policy, X-Content-Type-Options, Permissions-Policy)
- [ ] Live URL recorded in the README

**Estimate:** S

#### Design tokens and fonts
<!-- labels: type:design, area:design-system, priority:p0, size:M -->
**Description.** Implement the palette, text-safe companions, semantic tokens, type scale and fonts from `docs/design-system.md`.

**Acceptance criteria**
- [ ] CSS variables in `globals.css`, exposed to Tailwind via `@theme`
- [ ] Permanent Marker, Bebas Neue, Playfair Display and Inter via `next/font` with fallbacks
- [ ] Fluid type scale utilities (`display-*`, `heading-*`, `body*`, `caption`)
- [ ] Focus-ring utility (gold 3 px, navy offset)
- [ ] A unit test asserts every documented text/background pair meets its contrast requirement

**Estimate:** M

#### shadcn/ui setup and themed primitives
<!-- labels: type:design, area:design-system, priority:p0, size:M -->
**Description.** Install shadcn/ui and theme the primitives listed in design-system §7.1.

**Acceptance criteria**
- [ ] `components.json` configured; primitives generated into `src/components/ui`
- [ ] Button variants: primary (navy), accent (orange with navy text), ghost, link
- [ ] Form primitives wired to React Hook Form + Zod with accessible error messages
- [ ] All primitives keyboard-accessible with visible focus

**Estimate:** M

#### Scrapbook component kit
<!-- labels: type:design, area:design-system, priority:p0, size:L -->
**Description.** Build the decorative scrapbook components that make the app feel like the deck.

**Acceptance criteria**
- [ ] `PaperCard` (clean, torn, spiral, pinned), `Tape`, `MarkerHeading`, `Doodle` (arrow, star, circle, underline, squiggle), `Sticker`, `NotebookLines`, `BurstBackground`
- [ ] Decorations are `aria-hidden`; components render correctly with reduced motion
- [ ] SVG-only (no raster textures over 10 KB)

**Estimate:** L

#### App layout shell: bottom nav and desktop sidebar
<!-- labels: type:feature, area:design-system, priority:p0, size:M -->
**Description.** The authenticated app shell with Home · Plan · Network · Profile navigation.

**Acceptance criteria**
- [ ] Bottom nav below 1024 px (safe-area insets, 44 px targets, active state); sidebar at 1024 px and up
- [ ] `aria-current` on the active item; skip-to-content link
- [ ] Placeholder pages for the four tabs with loading and error boundaries
- [ ] Verified at 375, 768 and 1280 px

**Estimate:** M

#### UI kit page
<!-- labels: type:docs, area:design-system, priority:p1, size:S -->
**Description.** A `/dev/ui` page showing every token, type style and component state (a lightweight Storybook replacement).

**Acceptance criteria**
- [ ] Sections: colors (with contrast ratios), typography, buttons, forms, cards, scrapbook kit, motion samples
- [ ] Not linked from production navigation and marked `noindex`; disabled in production unless `NEXT_PUBLIC_ENABLE_UI_KIT=true`

**Estimate:** S

#### Repo community files and release tooling
<!-- labels: type:docs, area:infra, priority:p0, size:M -->
**Description.** Make the repo run like a real team's and prepare the first release.

**Acceptance criteria**
- [ ] `.github/` issue templates (feature, bug), PR template, `CODEOWNERS`
- [ ] `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`
- [ ] `git-cliff` config (`cliff.toml`) generating `CHANGELOG.md` from Conventional Commits
- [ ] README updated: what it is, stack, local setup, scripts, Team Northbound credits
- [ ] Release `v0.1.0` cut following `docs/git-workflow.md` §7

**Estimate:** M

## M1 · Story site (v0.2.0)
> The public landing page from CLAUDE.md §8, fully responsive and animated.

#### Landing: hero and Meet Veronica
<!-- labels: type:feature, area:landing, priority:p0, size:M -->
**Description.** The first two sections of the story site.

**Acceptance criteria**
- [ ] Hero: "Beyond Blue" marker title, "What happens after graduation?", CTAs "Try the demo as Veronica" and "Get started"
- [ ] Meet Veronica: illustrated/initials portrait with pinned notes (100 days left, work or grad school, moving, what if plans change)
- [ ] Copy lives in `src/content/copy`, not in components
- [ ] LCP element is text, not an image

**Estimate:** M

#### Landing: "You're not alone" and interactive pathways
<!-- labels: type:feature, area:landing, priority:p0, size:M -->
**Description.** The 68% stat and the five pathways explorer.

**Acceptance criteria**
- [ ] 68% sticker with full source citation (Inside Higher Ed Student Voice, 2024)
- [ ] Pathway explorer uses accessible tabs (arrow keys), shows self-description, focus areas and accent per pathway
- [ ] Data comes from the same pathway definitions the app uses

**Estimate:** M

#### Landing: How it works and In Your Pocket
<!-- labels: type:feature, area:landing, priority:p0, size:M -->
**Description.** The six principles and the app preview.

**Acceptance criteria**
- [ ] "How Beyond Blue Works" with six principle cards
- [ ] In Your Pocket: four phone frames (Profile, Personalize, Prepare, Connect), placeholder art now, real screenshots after M2
- [ ] Cards drop in on scroll; static with reduced motion

**Estimate:** M

#### Landing: Alumni Loop and Built to Last
<!-- labels: type:feature, area:landing, priority:p0, size:M -->
**Description.** The animated sustainability cycle and the scalability story.

**Acceptance criteria**
- [ ] SVG cycle Senior → Graduate → Day +100 → Alumni → Next Senior, auto-advancing highlight with a pause control
- [ ] Reduced motion shows an ordered list
- [ ] Built to Last: reusable curriculum, new cohorts, growing alumni network

**Estimate:** M

#### Landing: budget table and Countdown to Launchpad
<!-- labels: type:feature, area:landing, priority:p0, size:S -->
**Description.** The $10,000 budget and the Day 100 → Day 0 timeline.

**Acceptance criteria**
- [ ] Semantic table with all eight lines and the $10,000 total (amounts from `src/content/copy/budget.ts`, a unit test checks they sum to 10,000)
- [ ] "Built by Bluefield" note on the app line
- [ ] Timeline with the five readiness milestones and the five Day 0 outcomes

**Estimate:** S

#### Landing: FAQ, CTA, footer and credits
<!-- labels: type:feature, area:landing, priority:p0, size:S -->
**Description.** Close the story with answers and a clear next step.

**Acceptance criteria**
- [ ] FAQ accordion with the six Q&As from the deck
- [ ] Final CTA block, footer with Team Northbound credits, competition line and GitHub link
- [ ] Sticky "Try the demo" pill on mobile after the hero scrolls away

**Estimate:** S

#### Landing: SEO, social card and Lighthouse pass
<!-- labels: type:chore, area:landing, priority:p1, size:S -->
**Description.** Make the story site share well and score well.

**Acceptance criteria**
- [ ] Metadata, Open Graph image (generated with `next/og`), `robots`, `sitemap`
- [ ] Lighthouse mobile ≥ 90 on all four categories for `/`, with the report attached to the release PR
- [ ] Release `v0.2.0`

**Estimate:** S

## M2 · Core student app (v0.3.0)
> Auth, onboarding, plan generation from curriculum seed, Plan screen, task completion with outputs, Profile, baseline demo mode.

#### Supabase project, local dev and migrations workflow
<!-- labels: type:chore, area:data, priority:p0, size:M -->
**Description.** Set up Supabase (free tier) with the CLI for local development, migrations and generated types.

**Acceptance criteria**
- [ ] `supabase/` folder with config, `migrations/` and `seed.sql`
- [ ] Server and browser clients in `src/lib/supabase` using `@supabase/ssr`; service-role client guarded with `server-only`
- [ ] `npm run db:types` generates `database.types.ts`
- [ ] CI starts local Supabase for integration and RLS tests
- [ ] Keep-alive scheduled job documented to prevent free-tier pausing

**Estimate:** M

#### Core schema and RLS policies
<!-- labels: type:feature, area:data, priority:p0, size:L -->
**Description.** Migrations for `profiles`, `cohorts`, `pathways`, `readiness_areas`, `tasks`, `student_plans`, `task_completions`, `audit_log`, plus role helpers and RLS.

**Acceptance criteria**
- [ ] Tables, enums, constraints and indexes per `docs/architecture.md` §3
- [ ] RLS enabled on every table; policies per the §7.3 matrix
- [ ] Column-level grants prevent students changing `role`, `cohort_id`, `is_demo`
- [ ] pgTAP tests: student A can't read or write student B's rows; a student can't escalate their role
- [ ] Profile row auto-created on sign-up via trigger

**Estimate:** L

#### Curriculum seed: 5 pathways × 5 areas × 6 tasks
<!-- labels: type:feature, area:data, priority:p0, size:L -->
**Description.** Write realistic tasks for every pathway and readiness area as typed data, plus the seed script.

**Acceptance criteria**
- [ ] `src/content/curriculum/` with types, one file per pathway, 150 tasks total
- [ ] Every task has why-it-matters copy, a due day inside its area window, an output type and a Launch File section
- [ ] Shared equivalence keys (e.g. `budget-90`, `detour-plan`, `mentor-conversation`) present in every pathway
- [ ] Zod validation test enforces the shape and counts
- [ ] `scripts/seed-curriculum.ts` upserts idempotently and bumps `content_version` on change
- [ ] Content reviewed by the team (and ideally Career Services) before merge

**Estimate:** L

#### Auth: magic link sign-in, session and route guards
<!-- labels: type:feature, area:auth, priority:p0, size:M -->
**Description.** Email magic-link auth with role-aware route protection.

**Acceptance criteria**
- [ ] Sign-in page, `/auth/callback` route, sign-out
- [ ] Middleware refreshes the session and protects `(app)`, `(mentor)` and `(staff)` groups; staff routes 404 for non-staff
- [ ] Expired/invalid link error state with "Send a new link"
- [ ] Optional email-domain allowlist via env var
- [ ] Custom SMTP documented (free-tier provider)

**Estimate:** M

#### Countdown and progress domain logic
<!-- labels: type:feature, area:plan, priority:p0, size:S -->
**Description.** Pure, time-zone-safe countdown, task status and progress functions.

**Acceptance criteria**
- [ ] `daysToGraduation(graduationDate, timeZone, now)` using calendar-day difference in the cohort zone
- [ ] Task status (`upcoming | active | behind | complete`), area progress, overall progress, expected pace
- [ ] Unit tests cover DST transitions, users in other time zones, Day 0 and post-graduation

**Estimate:** S

#### Personalize onboarding flow
<!-- labels: type:feature, area:onboarding, priority:p0, size:L -->
**Description.** "Build Your Beyond Blue": pathway → journey tags → basics → Create My 100-Day Plan.

**Acceptance criteria**
- [ ] Three steps per PRD US-ONB-1..3, radio-group and checkbox semantics
- [ ] Draft survives refresh; back navigation works
- [ ] `createPlan` Server Action is idempotent and writes the audit log
- [ ] Celebration transition to `/plan` (reduced-motion safe)
- [ ] Verified at 375, 768 and 1280 px

**Estimate:** L

#### Plan screen: greeting, countdown, progress and focus card
<!-- labels: type:feature, area:plan, priority:p0, size:M -->
**Description.** The top of the Prepare screen.

**Acceptance criteria**
- [ ] Time-of-day greeting with preferred name
- [ ] Countdown hero with tick animation; Day 0 and Day +N states
- [ ] "X of 30 steps complete" bar with text equivalent
- [ ] Focus card selects the earliest-due incomplete task in the active area, or the most overdue task
- [ ] Loading skeleton and empty/error states

**Estimate:** M

#### Readiness area cards and task lists
<!-- labels: type:feature, area:plan, priority:p0, size:M -->
**Description.** Five colored area cards with drill-in task lists.

**Acceptance criteria**
- [ ] Cards show milestone day, progress, status chip; colors per design system
- [ ] `/plan/[area]` lists six tasks with status, due day and output type
- [ ] Behind tasks are flagged but never locked

**Estimate:** M

#### Task completion with file, link and form outputs
<!-- labels: type:feature, area:tasks, priority:p0, size:L -->
**Description.** Complete tasks by attaching a tangible output that flows into the Launch File.

**Acceptance criteria**
- [ ] Task sheet with why-it-matters, support partner and output picker
- [ ] File: signed upload to private `task-outputs/{uid}/…`, MIME allowlist, 10 MB cap (2 MB demo), storage policies
- [ ] Link: https only. Form: renders the curriculum `formId` (budget table, housing comparison, offer review, …) with Zod validation
- [ ] Completion burst, optimistic progress update, replace/edit output
- [ ] Rate limit on upload URL creation
- [ ] Each area marks one key output (`is_key_output` in the curriculum) that a mentor or staff member can badge "Verified". The badge is optional and never blocks progress
- [ ] Unit tests for output validation; e2e for completing one task of each type

**Estimate:** L

#### Profile screen and editing
<!-- labels: type:feature, area:profile, priority:p0, size:M -->
**Description.** Recreate the slide 7 Profile screen.

**Acceptance criteria**
- [ ] Avatar (initials default, optional upload to `avatars/`), name, "Senior · Class of YYYY", major, school
- [ ] Status card copy by countdown stage; destination role; target city; journey tags
- [ ] "View My Beyond Blue →" links to the Launch File (placeholder until M4)
- [ ] Edit profile form with validation

**Estimate:** M

#### Rate limiting and validation baseline
<!-- labels: type:security, area:auth, priority:p0, size:S -->
**Description.** Shared protections used by every Server Action.

**Acceptance criteria**
- [ ] Postgres fixed-window limiter `app.rate_limit(key, max, window_seconds)` with tests
- [ ] `ActionResult<T>` helper and a `withAction` wrapper (validate → auth → rate limit → run)
- [ ] Structured logging without PII

**Estimate:** S

#### Demo mode baseline: Explore as Veronica
<!-- labels: type:feature, area:demo, priority:p0, size:L -->
**Description.** One-tap demo with an isolated, seeded Veronica session (proposed to move here from M6 so every later milestone is judge-demoable).

**Acceptance criteria**
- [ ] "Try the demo as Veronica" signs in anonymously (rate-limited per IP) and seeds Veronica's data server-side
- [ ] Lands on Plan showing 87 days, 12 of 30 steps, an active focus task, partial area progress
- [ ] Demo banner with "Reset demo" and "Create your own plan"
- [ ] Sessions are isolated; e2e test proves two sessions don't share data

**Estimate:** L

#### M2 release: e2e journey and v0.3.0
<!-- labels: type:test, area:plan, priority:p1, size:S -->
**Description.** Lock in the core journey before building on it.

**Acceptance criteria**
- [ ] Playwright: sign-up (magic link via local Inbucket/Mailpit) → onboarding → complete a task → profile, on mobile and desktop
- [ ] Real app screenshots replace placeholders in the story site's In Your Pocket section
- [ ] Release `v0.3.0`

**Estimate:** S

## M3 · Network and adaptivity (v0.4.0)
> Mentor profiles, matching and connections, pathway switching with history, Detour Challenge.

#### Mentor profiles, mentor role and fictional alumni seed
<!-- labels: type:feature, area:network, priority:p0, size:M -->
**Description.** Schema and seed for mentors.

**Acceptance criteria**
- [ ] `mentor_profiles`, `connections`, `mentor_notes` migrations with RLS and pgTAP tests
- [ ] Public mentor view exposes only display fields
- [ ] 30+ fictional alumni seeded across cities, employers, industries, grad schools and pathways (flagged `is_seeded_fictional`)
- [ ] Mentor profile edit page (capacity, availability, displayed tags)

**Estimate:** M

#### Matching scoring function with match reasons
<!-- labels: type:feature, area:network, priority:p0, size:S -->
**Description.** The transparent scoring function from `docs/architecture.md` §5.

**Acceptance criteria**
- [ ] Pure `scoreMentor(student, mentor)` returning `{score, reasons[]}`; weights in one constant
- [ ] Unit tests for every rule, the minimum score, tag cap, tie-breaks and capacity filtering
- [ ] Reason copy matches the UI spec

**Estimate:** S

#### Network screen: stats and alumni suggestions
<!-- labels: type:feature, area:network, priority:p0, size:M -->
**Description.** Recreate the slide 7 Connect screen.

**Acceptance criteria**
- [ ] Stats: Mentors, Alumni, Students on your path (count-only security-definer function)
- [ ] "Alumni You May Want to Meet" cards with match reason and Connect button
- [ ] Empty, loading and error states

**Estimate:** M

#### Connection requests and mentor inbox
<!-- labels: type:feature, area:network, priority:p0, size:L -->
**Description.** Request, accept, decline and withdraw connections; mentors log conversations and verify shared outputs.

**Acceptance criteria**
- [ ] Request form with pre-filled reason and optional note (≤ 300 chars); max 3 pending
- [ ] States Connect → Pending → Connected / Not available right now / Withdrawn
- [ ] Mentor area: incoming requests, accepted mentees with shared goals and outputs, conversation log, verify output
- [ ] Audit log on accept/decline/verify

**Estimate:** L

#### Switch pathway with history and remap
<!-- labels: type:feature, area:pathways, priority:p0, size:M -->
**Description.** Change pathway at any time without losing work (principle 5).

**Acceptance criteria**
- [ ] Preview shows kept, credited and remaining counts from the pure `remap()` function
- [ ] `switch_pathway` RPC updates the plan and writes `pathway_changes` and the audit log in one transaction
- [ ] Completed outputs stay in the Launch File with their original pathway label
- [ ] Unit tests for remap; e2e for a Hired → Higher Education switch

**Estimate:** M

#### Detour Challenge builder
<!-- labels: type:feature, area:detour, priority:p0, size:L -->
**Description.** Guided "what if plan A changes?" backup-plan builder.

**Acceptance criteria**
- [ ] Five steps per PRD US-DETOUR-1, saved after each step, pathway-specific prompts
- [ ] Completing it completes the Detour task and feeds the Launch File
- [ ] Links to Career Services, Counseling and the Last Mile Fund
- [ ] Release `v0.4.0`

**Estimate:** L

## M4 · Launch File and Fund (v0.5.0)
> Launch File page and PDF export, Last Mile Fund request and admin review.

#### Launch File page
<!-- labels: type:feature, area:launch-file, priority:p0, size:M -->
**Description.** Assemble every completed output into the six Launch File sections.

**Acceptance criteria**
- [ ] Sections: Next-step plan, Financial prep, Professional/Educational strategy, My network, Resources, Detour plan
- [ ] Each output shows completion date, verified badge and pathway label; signed URLs for files
- [ ] Encouraging empty states that link to the relevant task

**Estimate:** M

#### Launch File PDF export
<!-- labels: type:feature, area:launch-file, priority:p0, size:L -->
**Description.** Branded PDF export generated client-side.

**Acceptance criteria**
- [ ] Lazy-loaded `@react-pdf/renderer` with brand fonts; forms render as tables, files as links
- [ ] Works on iOS Safari and Android Chrome (share sheet when available), ≤ 5 s for a full file
- [ ] Export recorded in `launch_files` with a snapshot

**Estimate:** L

#### Last Mile Fund request form and status
<!-- labels: type:feature, area:fund, priority:p0, size:M -->
**Description.** Students request capped micro-grants tied to a real next step.

**Acceptance criteria**
- [ ] `fund_requests` migration, RLS and tests; one open request per student
- [ ] Form per PRD US-FUND-1 with amount cap from config (default $250) and optional document upload to `fund-docs/`
- [ ] Status timeline with reviewer notes; edit allowed only while `needs_info`
- [ ] No bank or card fields anywhere

**Estimate:** M

#### Fund review queue for staff
<!-- labels: type:feature, area:fund, priority:p0, size:M -->
**Description.** A fair, auditable review workflow.

**Acceptance criteria**
- [ ] Queue oldest-first with status/category filters and remaining fund balance
- [ ] Rubric checklist required before a decision; decision note required
- [ ] `decide_fund_request` RPC enforces the remaining balance and writes the audit log
- [ ] Release `v0.5.0`

**Estimate:** M

## M5 · Staff and Day +100 (v0.6.0)
> Staff dashboard, at-risk students, Day +100 survey and insights.

#### Staff dashboard: cohort KPIs and pathway × area heat map
<!-- labels: type:feature, area:staff, priority:p0, size:L -->
**Description.** Program-level visibility for Career Services and Student Success.

**Acceptance criteria**
- [ ] Cohort selector and KPIs per PRD US-STAFF-1
- [ ] Accessible heat map (with table fallback) of progress by pathway × area
- [ ] Pathway distribution and switches over time
- [ ] Aggregations via SQL views/functions restricted to staff

**Estimate:** L

#### At-risk students list
<!-- labels: type:feature, area:staff, priority:p0, size:M -->
**Description.** Identify students falling behind the countdown.

**Acceptance criteria**
- [ ] Rules per PRD US-STAFF-2 (pace gap ≥ 5, inactive 14 days, Detour overdue near graduation), implemented in tested domain logic
- [ ] Table with reason, pathway, last active and contact action; sortable and filterable

**Estimate:** M

#### Cohort management
<!-- labels: type:feature, area:staff, priority:p1, size:S -->
**Description.** Staff create cohorts and set graduation dates.

**Acceptance criteria**
- [ ] Create/edit cohort (name, class year, graduation date, time zone)
- [ ] Assign students to a cohort (by class year on sign-up, editable by staff)
- [ ] Admin-only role management page using the audited RPC

**Estimate:** S

#### Day +100 check-in survey
<!-- labels: type:feature, area:day-plus-100, priority:p0, size:M -->
**Description.** A short check-in for graduates at Day +100.

**Acceptance criteria**
- [ ] Available Day +90 to +130; fields and opt-ins per PRD US-D100-1; ≤ 3 minutes
- [ ] Mentor opt-in creates a mentor profile draft
- [ ] One response per graduate

**Estimate:** M

#### Day +100 insights for staff
<!-- labels: type:feature, area:day-plus-100, priority:p0, size:M -->
**Description.** Aggregated outcomes by pathway.

**Acceptance criteria**
- [ ] Outcome distribution, usefulness, stress delta, opt-in rates by pathway
- [ ] Groups with n < 5 suppressed
- [ ] Free-text answers listed without names
- [ ] Release `v0.6.0`

**Estimate:** M

## M6 · Polish and demo (v1.0.0)
> Demo hardening, PWA install, a11y and Lighthouse pass, e2e tests, seed data for every pathway, README with screenshots and QR code.

#### Demo mode hardening and staff demo
<!-- labels: type:feature, area:demo, priority:p0, size:M -->
**Description.** Make demo mode robust for judging day.

**Acceptance criteria**
- [ ] `pg_cron` purges demo users and their storage objects after 24 h
- [ ] Seeded demo cohort (~60 fictional students) powering a read-only "View as program staff" dashboard
- [ ] Demo loads in ≤ 3 s on a mid-range phone over 4G
- [ ] Demo covers every MVP feature (Launch File, Detour, fund request, network)

**Estimate:** M

#### PWA: manifest, icons, offline shell and install prompt
<!-- labels: type:feature, area:pwa, priority:p0, size:M -->
**Description.** Make the app installable and resilient offline.

**Acceptance criteria**
- [ ] `app/manifest.ts`, maskable icons, theme color, splash
- [ ] Service worker caches the shell and static assets; offline page in the scrapbook style
- [ ] Custom "Add to Home Screen" prompt (Android) and iOS instructions sheet
- [ ] Lighthouse PWA installability checks pass

**Estimate:** M

#### Accessibility audit and fixes
<!-- labels: type:chore, area:a11y, priority:p0, size:M -->
**Description.** WCAG 2.1 AA pass across the app.

**Acceptance criteria**
- [ ] axe checks on every route in e2e with zero serious/critical violations
- [ ] Manual keyboard-only and VoiceOver/TalkBack pass on the four core screens
- [ ] Reduced-motion verified for every animation
- [ ] Findings and fixes documented in `docs/a11y-report.md`

**Estimate:** M

#### Lighthouse CI and performance pass
<!-- labels: type:chore, area:infra, priority:p0, size:M -->
**Description.** Hold the ≥ 90 mobile budget automatically.

**Acceptance criteria**
- [ ] Lighthouse CI runs against the preview deployment for `/`, `/plan` (demo) and `/network` (demo)
- [ ] Assertions: ≥ 0.9 for all four categories on mobile
- [ ] Bundle analysis; first-load JS ≤ 170 KB gzipped on app routes

**Estimate:** M

#### End-to-end test coverage of critical journeys
<!-- labels: type:test, area:infra, priority:p0, size:M -->
**Description.** Protect the demo and the core flows.

**Acceptance criteria**
- [ ] Journeys: demo entry, onboarding, task completion (3 output types), switch pathway, connection request, Detour, Launch File export, fund request + review, staff dashboard, Day +100
- [ ] Runs on mobile and desktop projects in CI

**Estimate:** M

#### Seed data review for every pathway
<!-- labels: type:docs, area:data, priority:p1, size:S -->
**Description.** Make every pathway feel real in the demo.

**Acceptance criteria**
- [ ] Each pathway has a demo persona (Veronica, Marcus, Aaliyah, Diego, Jordan) selectable from the demo banner
- [ ] Curriculum copy proofread; resources populated for every area

**Estimate:** S

#### Security review
<!-- labels: type:security, area:infra, priority:p0, size:S -->
**Description.** Pre-launch security check.

**Acceptance criteria**
- [ ] RLS matrix re-verified with pgTAP; storage policies tested
- [ ] Dependency audit clean of high/critical issues; secret scanning enabled
- [ ] Headers verified on production; rate limits verified

**Estimate:** S

#### README, screenshots, QR code and v1.0.0
<!-- labels: type:docs, area:infra, priority:p0, size:S -->
**Description.** The front door of the repo for judges.

**Acceptance criteria**
- [ ] README with hero image, screenshots (mobile + desktop), live link, QR code to the live site, architecture summary, team credits
- [ ] `CHANGELOG.md` up to date
- [ ] Release `v1.0.0`

**Estimate:** S

<!-- issues:end -->
