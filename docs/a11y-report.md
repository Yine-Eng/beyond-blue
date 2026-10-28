# Accessibility report

> Target: **WCAG 2.1 AA** (docs/architecture.md §9). Status as of v1.0.0, 29 Oct 2026.

## How it's checked

- **Automated, on every PR.** Playwright runs [axe-core](https://github.com/dequelabs/axe-core) with the WCAG 2.0/2.1 A and AA rule sets. Any **serious or critical** violation fails CI (`e2e/a11y.ts`). The suites run at **375 px, 768 px and 1280 px**.
- **Contrast is a unit test.** `src/lib/design/tokens.test.ts` checks every text/background pair in the palette (docs/design-system.md §2.3), so a token change can't silently drop below AA.
- **Reduced motion** is handled in CSS. A global `prefers-reduced-motion: reduce` rule stops transitions. The scroll-driven "pin-drop" reveals and the task-complete burst only run under `no-preference`, and content is always visible without the animation.

## Routes covered by axe in CI

| Area | Routes |
|---|---|
| Story site | `/` (whole page), `/sign-in`, `/sign-in?error=link`, `/offline` |
| Student app (demo as Veronica) | `/plan`, `/plan/financial`, `/tasks/[id]` (file, link and form outputs), `/network`, `/profile`, `/detour`, `/switch-pathway`, `/launch-file`, `/fund` |
| UI kit | `/dev/ui` (every component and scrapbook element) |

**Not yet covered automatically:** the mentor area (`/mentor`) and the staff area (`/staff/fund`). Both need a real signed-in mentor or staff account, which CI doesn't have. They use the same primitives (shadcn/Radix fields, buttons, radio groups) and the same tokens as the covered screens.

## Fixes made during the build

| Finding | Fix |
|---|---|
| Several brand colours failed 4.5:1 as text (orange on paper, blue-500 on paper, white on orange) | Added darker text tokens (`blue-700`, `gold-800`, `green-700`, `purple-700`, `pink-700`, `teal-700`) and the rule that orange CTAs use ink text |
| Focus was hard to see on the royal-blue backgrounds | Global `:focus-visible` ring: 3 px gold outline with a 2 px navy inner ring, which works on both paper and blue |
| Loading skeletons used `aria-label` on a plain `div` (axe: `aria-prohibited-attr`) | Skeletons are now `role="status"` with `aria-busy`, and they announce loading |
| Axe sometimes ran before Next streamed in `<title>` after client navigation (`document-title`) | The test helper waits for a non-empty title. Every page has a title (`%s · Beyond Blue`) |
| Hidden previous pages kept by Next's activity cache confused label lookups in tests | Tests target visible fields. Each live page still has unique labels |
| The budget table widened the page on phones | It scrolls inside its own container, with a horizontal-overflow test at every viewport |

## Built-in patterns

- A **skip link** on every layout (story site, student app, mentor and staff areas). Landmarks: `header`, `nav` (labelled), `main`, `aside` for the demo banner.
- **Forms:** every input has a visible label, errors are tied to fields (`aria-invalid` plus inline messages), and form-level errors use `role="alert"`. Success messages use `role="status"`.
- **Multi-step flows** (onboarding, Detour Challenge) move focus to the step heading on every step.
- **Touch targets** are at least 44 × 44 px (`min-h-11`) for buttons and links in the app.
- **Status is never shown by colour alone:** chips carry text ("Pending", "Needs info", "Verified"), and progress has a text equivalent ("12 of 30 steps complete").
- **Links that open a new tab** say so to screen readers. Icons are `aria-hidden`, with text labels.
- The **Launch File PDF** is real, tagged text with embedded fonts and document language, title and author set, not an image.

## Still to do before a pilot

- A manual **VoiceOver (iOS Safari)** and **TalkBack (Android Chrome)** pass on the four core screens (Home, Plan, Network, Profile) and the Detour Challenge.
- A full keyboard-only walkthrough of the mentor and staff areas.
- Axe coverage for `/mentor` and `/staff/fund` once CI has seeded mentor and staff test accounts.
