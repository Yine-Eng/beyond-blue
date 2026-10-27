# 0001. Tech stack and hosting

- **Status:** Proposed
- **Date:** 2026-10-27
- **Deciders:** Sampson (`Yine-Eng`)

## Context
Beyond Blue must be mobile-first, installable, accessible, fast on low-end phones, demo-ready for judges, cheap to host (≤ $250 total for infrastructure and publishing), and maintainable by future BSU CS students.

## Decision
- **Next.js (App Router), latest stable at scaffold time, exact version pinned**, with **TypeScript strict** (`noUncheckedIndexedAccess` on).
- **Tailwind CSS v4** with design tokens as CSS variables, **shadcn/ui** (Radix) for accessible primitives, **Framer Motion** (via `LazyMotion`), **lucide-react** icons.
- **Supabase** for Postgres, Auth, Storage and RLS. **Supabase CLI** for local development, migrations and generated types.
- **Zod** + **React Hook Form** for forms and validation.
- **Vitest + React Testing Library** (unit), **Playwright** (e2e, mobile + desktop viewports), **pgTAP** (RLS policy tests).
- **ESLint, Prettier, Husky, lint-staged, commitlint**.
- **PWA:** `app/manifest.ts` plus a service worker for the offline shell (Serwist if it works with the bundler in the pinned Next.js version, otherwise a small hand-written service worker).
- **Hosting:** Vercel Hobby (production from `main`, preview per PR) and Supabase Free.
- **Runtime:** Node.js 22 LTS, pinned via `.nvmrc` and `engines`. Current Next.js releases need Node ≥ 20.9. The dev machine has Node 18.20 and needs an upgrade before scaffolding.
- **Package manager:** pnpm (fast, strict dependency resolution, good CI caching).

## Consequences
- One language end to end, typed from the database (generated types) to the UI.
- Free tiers cover the pilot. The first paid step is Supabase Pro ($25/mo), and only if needed.
- Vercel Hobby is licensed for non-commercial use, which fits a university pilot and competition. If BSU adopts the app institutionally, Vercel Pro or BSU-hosted infrastructure should be revisited.
- Supabase Free pauses inactive projects after 7 days, so a scheduled keep-alive ping is needed around judging.

## Alternatives considered
- **Firebase:** weaker relational modelling and no SQL row-level policies for the reporting the staff dashboard needs.
- **Remix / SvelteKit:** viable, but the brief specifies Next.js and the shadcn/ui ecosystem is strongest on React.
- **Native apps (React Native / Expo):** app-store costs and review delays, and judges would need to install something. A PWA is a one-tap demo.
- **npm instead of pnpm:** also fine. pnpm was chosen for speed and is easy to swap.
