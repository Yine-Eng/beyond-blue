# Contributing to Beyond Blue

Thanks for helping. Beyond Blue is built by Bluefield State students, and this guide is written so the next class of contributors can pick it up quickly.

## Setup

Requirements: **Node 24** (see `.nvmrc`; anything ≥ 22 works) and npm.

```bash
git clone https://github.com/Yine-Eng/beyond-blue.git
cd beyond-blue
git switch develop
npm install            # also installs the git hooks
cp .env.example .env.local   # then fill in values; never commit .env.local
npm run dev            # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint (zero warnings allowed) |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm run format` / `format:check` | Prettier |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright at 375, 768 and 1280 px, with axe accessibility checks |

## Workflow

Full details are in [`docs/git-workflow.md`](docs/git-workflow.md). In short:

1. Pick or open an issue. Branch from `develop`: `feature/<issue#>-<slug>`, `fix/…`, `chore/…` or `docs/…`.
2. Commit with **Conventional Commits** (`feat(plan): add readiness area cards`). Hooks run lint-staged and commitlint.
3. **Stage files explicitly.** Avoid `git add .`.
4. Open a PR into `develop` using the template. Add the matching labels and milestone.
5. CI (`quality`, `e2e`, `conventional-title`) must pass. Write a short self-review, then **squash-merge**.

## Code conventions

- TypeScript strict; no `any` without a justification comment.
- Reads in Server Components, writes in Server Actions, and Zod validation at every boundary (see `docs/adr/0003-data-access-pattern.md`).
- Import `cn` from `@/lib/utils`, never from the `cn` package directly (a lint rule enforces this).
- Colours and type come from the design tokens (`docs/design-system.md`). Contrast pairs are tested, so add new pairs to `requiredContrast` in `src/lib/design/tokens.ts`.
- Every screen needs loading, empty and error states, and must work at 375, 768 and 1280 px.
- Decorative scrapbook elements must be `aria-hidden`. Animations must respect `prefers-reduced-motion`.
- Never commit secrets, the local `deck/` folder or real people's photos.

## Definition of Done

See the PR template checklist. A PR isn't done until it works at all three viewports, passes CI and accessibility checks, and handles its loading, empty and error states.
