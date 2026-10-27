# Open Questions

Questions for Sampson before or during M0. Each has a **proposed default** so work isn't blocked; answer "default is fine" or override.

## Timeline and scope

1. **Key dates.** When are the competition submission deadline and judging day? This decides whether M3–M5 are built in full or trimmed so that M6 (demo polish) lands in time.
   *Default:* aim for M2 plus demo mode as the minimum judge-ready build, then M3 → M6 in order.
2. **Demo mode in M2.** OK to pull a baseline "Explore as Veronica" into M2 (and keep the hardening in M6) so every release from v0.3.0 on is demoable?
   *Default:* yes (already reflected in `docs/roadmap.md`).
3. **Real pilot or competition prototype?** Will real BSU students use this in spring 2027, or is it a judged prototype for now? That affects FERPA review, email deliverability work and data retention.
   *Default:* build to pilot-grade security, but launch only demo mode and invited test users until BSU signs off.

## Content

4. **FAQ text.** CLAUDE.md mentions "the 6 Q&As from the deck", but their text isn't in the brief. Can you paste them (or share the deck)?
5. **Deck assets.** Can you share the deck (PDF/PPTX) so the palette can be sampled exactly, and any doodles, textures or logo files the design team made?
6. **Veronica's details.** Major (placeholder: Computer Science), last-name initial for the avatar, and is "Program Manager → Software Engineer" her current offer → long-term goal?
7. **Curriculum review.** Can someone on Team Northbound (or Career Services) review the 150 seed tasks before they merge? Who?
8. **Graduation date.** What's BSU's spring 2027 commencement date (for the real cohort)? The demo cohort always shows 87 days regardless.

## Product rules

9. **Readiness area windows.** The deck pins each area to a milestone (Day 100, 75, 50, 25, 0). Proposal: each milestone is when the area *opens*, and Wellness & Detour (the "Day 0" area) opens at Day 25 alongside Network so the Detour Challenge is finished by graduation. Is that the intended reading?
10. **Verification.** Does progress count a task as soon as the student attaches an output (proposed), with mentor/staff "Verified" as an extra badge? Or must a person verify before it counts? Requiring verification is more rigorous but creates a staff bottleneck.
11. **Last Mile Fund cap.** Per-request cap? *Default:* $250 (the fund total is $2,500, so ~10+ grants). One request per student per semester, or one open at a time (proposed)?
12. **Who reviews the fund?** Which roles make up the "small campus team": staff only, or staff plus Student Success? Is a second approver needed above a threshold?
13. **Mentors.** Are mentors real alumni signing in during the competition, or only seeded fictional profiles for now? *Default:* fictional seeded alumni for the demo, with real mentor sign-up built and ready.
14. **Journey tag list.** Any tags to add or remove (e.g. "Commuter", "Student-Athlete", "Working Full-Time")?
15. **Content editing.** Is PR-based curriculum editing acceptable for the MVP, with a staff content editor as a stretch goal?

## Accounts and services

16. **Node.js version.** This machine has Node 18.20, and current Next.js needs Node ≥ 20.9. OK to install Node 22 LTS (e.g. via `nvm-windows` or `fnm`) before M0?
17. **Package manager.** pnpm (proposed) or npm?
18. **Accounts.** Do you already have Vercel and Supabase accounts linked to `Yine-Eng`? Both are free tier; I'll ask before creating or connecting anything.
19. **Email (SMTP).** Supabase's built-in email is heavily rate-limited. OK to use a free-tier provider such as Resend for magic links (needs a sending domain or their test domain)?
20. **Domain.** Use the free `*.vercel.app` URL, or buy a custom domain (~$12/yr, inside the $250 budget)?
21. **Email domain allowlist.** Restrict real sign-ups to `@bluefieldstate.edu`, or allow any email during the competition?

## Repo

22. **Issue numbering.** The planning PR will be **#1**, so the scaffold issue becomes **#2** and its branch `feature/2-project-scaffold` (not `feature/1-…` as in CLAUDE.md §11). OK?
23. **Projects board.** Creating it needs the `project` token scope (`gh auth refresh -s project`). Want the board created by the bootstrap script?
24. **README typos.** The current README has small typos ("heps", "colege", "InnovationChallenge"). Fix them in the M0 README update?
25. **Team credits.** Names and roles of the other Team Northbound members for the README credits?
