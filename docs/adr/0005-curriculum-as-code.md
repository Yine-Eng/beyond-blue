# 0005. Curriculum as typed, versioned content

- **Status:** Proposed
- **Date:** 2026-10-27
- **Deciders:** Sampson (`Yine-Eng`)

## Context
There are 5 pathways × 5 readiness areas × 6 tasks = 150 tasks. Content must not be hard-coded in components, must be reviewable, and must be reusable for future cohorts.

## Decision
- The source of truth is **typed TypeScript data** in `src/content/curriculum/` (one file per pathway), validated by a Zod schema in a unit test.
- `scripts/seed-curriculum.mts` upserts the content into `pathways`, `readiness_areas` and `tasks`, bumping `content_version` when a task changes. It runs in CI against local Supabase, and against production manually (with approval).
- Task ids are stable (`{pathway}.{area}.{slug}`), so completions survive content edits.
- A staff-facing content editor is a post-MVP stretch goal. Until then, Career Services reviews content changes through PRs (or through a shared doc that gets transcribed into a PR).

## Consequences
- Content changes get code review, history and tests.
- Non-technical staff can't edit content directly in the MVP.

## Alternatives considered
- **Database-only content edited in an admin UI:** better staff autonomy, but needs a CMS-style UI that is out of MVP scope.
- **Headless CMS:** another service and account, with cost risk beyond the free tier.
