# 0003. Data access: Server Components, Server Actions and RLS

- **Status:** Proposed
- **Date:** 2026-10-27
- **Deciders:** Sampson (`Yine-Eng`)

## Context
The brief asks for one consistent pattern: TanStack Query or Server Actions.

## Decision
- **Reads:** React Server Components query Supabase with the user's session, so RLS applies.
- **Writes:** **Server Actions** only, one module per feature in `src/lib/actions/`. Every action parses input with a shared Zod schema, gets the user from the session, checks role and ownership, calls Supabase, revalidates the affected paths or tags, and returns a typed `ActionResult<T>` (`{ ok: true, data } | { ok: false, error, fieldErrors? }`).
- Multi-step writes that must be atomic (switch pathway, fund decision) are Postgres functions called via `rpc`.
- Optimistic UI uses React's `useOptimistic`. No TanStack Query.
- Pure business logic (countdown, matching, progress, remap) lives in `src/lib/domain/` with no I/O.

## Consequences
- Less client JavaScript and no client cache to keep in sync.
- RLS is the safety net even if an action has a bug.
- Live updates (e.g. a mentor accepting while the student is watching) need a refresh, or Supabase Realtime later. Acceptable for the MVP.

## Alternatives considered
- **TanStack Query + route handlers:** great for highly interactive client state, but adds a client cache layer and an API surface we don't need.
- **Direct client-side Supabase calls:** safe with RLS, but scatters validation and makes server-side role checks and auditing harder.
