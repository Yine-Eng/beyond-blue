# 0006. No Docker images or containers for the app

- **Status:** Accepted
- **Date:** 2026-10-28
- **Deciders:** Sampson (`Yine-Eng`)

## Context
We evaluated containerizing Beyond Blue (a Dockerfile for the Next.js app, docker-compose for local development) for reproducible builds and hosting portability.

The production stack is **Vercel** (builds and runs Next.js from the repo) plus **managed Supabase** (Postgres, Auth, Storage). Neither takes a container from us. Reproducibility is already handled without one:

- Node is pinned with `.nvmrc` (24) and `"engines": { "node": ">=22" }`.
- Dependencies are locked with `package-lock.json` and installed with `npm ci`.
- CI builds from a clean checkout on every PR (lint, typecheck, unit, build, e2e), and Vercel builds every PR as a preview.

The one place Docker already appears is indirect. CI's `db` job runs `supabase start` on the GitHub runner, where the Supabase CLI starts its own containers for the pgTAP database tests. We don't write or maintain those images.

## Decision
We don't add a Dockerfile, docker-compose file or container registry to this repo, and we don't run the app in containers anywhere.

## Consequences
- There's nothing extra to build, scan, patch or pay for, and deploys stay "push to main".
- Developers need Node 24 and npm locally. That's documented in the README, and `.nvmrc` works with nvm/fnm.
- Full sign-in e2e tests (a real magic-link email) aren't possible today. E2E signs test accounts in with a password instead, and covers only the callback's error and redirect paths (see `e2e/`).

## Revisit if
1. **We run e2e against local Supabase** (`supabase start`, with Mailpit catching emails) to test the full magic-link sign-in. That means Docker on developer machines and in the e2e job, and the CI move to a separate Supabase project should be considered at the same time.
2. **The university needs to self-host** (on-prem or its own cloud account) instead of Vercel + managed Supabase. A container image is then the most portable artifact.
3. **We add services that aren't Next.js** (a worker, queue consumer or scheduled job beyond Vercel Cron) that Vercel can't host.

## Alternatives considered
- **Dockerfile + docker-compose for local dev:** reproducible, but it duplicates what `.nvmrc`, the lockfile and CI already guarantee, and it adds a second way to run the app that would drift.
- **Container hosting (Fly.io, Cloud Run, a university VM):** more operational work and cost risk, against the deck's $250 infrastructure budget, with no feature we need.
