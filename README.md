# Beyond Blue

**From Countdown to Launchpad.** Beyond Blue is a 100-day transition experience that helps every graduating senior prepare for life after college: one shared core curriculum, five personalized pathways, real-world assignments, human mentorship and targeted support.

**Live:** https://beyond-blue-vert.vercel.app

Team Northbound · Disney on the Yard Innovation Challenge 2026 · Bluefield State University

---

## Why

*"What happens after graduation?"* **68% of fourth-year students say thinking about life after graduation causes them stress** (Inside Higher Ed Student Voice, 2024). Beyond Blue turns the last 100 days into a plan. Each senior leaves with ✅ a plan, ✅ a budget, ✅ a network, ✅ a backup plan, and ✅ a place to turn.

## What's in the app

| Pathways | Readiness areas (100-day timeline) |
|---|---|
| Hired · Job Search · Higher Education · Entrepreneurship · Still Deciding | Career (Day 100) · Financial (Day 75) · Relocation & Life Logistics (Day 50) · Network & Mentorship (Day 25) · Wellness & Detour Planning (Day 0) |

Core screens: **Profile · Personalize · Prepare (Plan) · Connect (Network)**, plus the Launch File, Detour Challenge, Last Mile Fund, staff dashboard and Day +100 check-in. Judges can **explore the app as Veronica** in one tap, with no sign-up.

Status and plan: [`docs/roadmap.md`](docs/roadmap.md) · [Project board](https://github.com/users/Yine-Eng/projects/3)

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (Radix) · Supabase (Postgres, Auth, Storage, RLS) · Vitest + Testing Library · Playwright + axe · Vercel. Total infrastructure fits the deck's **$250** budget line on free tiers.

## Run it locally

Requires **Node 24** (`.nvmrc`; ≥ 22 works) and npm.

```bash
git clone https://github.com/Yine-Eng/beyond-blue.git
cd beyond-blue && git switch develop
npm install
cp .env.example .env.local   # fill in Supabase values; never commit this file
npm run dev                  # http://localhost:3000
```

| Command | |
|---|---|
| `npm run lint` · `npm run typecheck` | Quality gates |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Playwright at 375 / 768 / 1280 px with axe |
| `npm run build` | Production build |

The UI kit lives at [`/dev/ui`](http://localhost:3000/dev/ui) in development.

## Docs

- [Product requirements](docs/PRD.md)
- [Architecture](docs/architecture.md) and [decision records](docs/adr/)
- [Design system](docs/design-system.md)
- [Roadmap](docs/roadmap.md)
- [Git and team workflow](docs/git-workflow.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

## Built by Bluefield

The app is built as paid applied learning for Bluefield State Computer Science students.

- **Software engineering:** Sampson ([@Yine-Eng](https://github.com/Yine-Eng))
- **Research, pitch and design:** Team Northbound

## License

[MIT](LICENSE)
