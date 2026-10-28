# Security Policy

Beyond Blue handles information about real students, so we take security reports seriously.

## Reporting a vulnerability

Please **don't open a public issue**. Report privately through GitHub: **Security → Advisories → [Report a vulnerability](https://github.com/Yine-Eng/beyond-blue/security/advisories/new)**.

Include what you found, how to reproduce it, and the impact you expect. You'll get an acknowledgement within 3 days and a status update within 7 days.

## Scope

- The production site, https://beyond-blue-vert.vercel.app, and Vercel preview deployments
- This repository's code, including Postgres Row Level Security policies and storage rules

Out of scope: denial-of-service testing, social engineering, and third-party services (Vercel, Supabase) themselves.

## How we protect data

- **Minimal PII.** No SSNs, bank or card numbers, government IDs or exact salaries are ever collected.
- **Row Level Security** on every table: a student can only read or write their own data.
- Private storage buckets with short-lived signed URLs, file type and size limits.
- Server-side validation on every write, rate limiting on auth and forms, and a strict set of security headers.
- Secrets live only in environment variables, never in the repository.

## Supported versions

Only the latest release on `main` receives fixes.
