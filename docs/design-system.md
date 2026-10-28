# Beyond Blue: Design System

> Status: **Implemented in M0 (#7)**. Palette values were sampled from the exported deck slides (27 Oct 2026). Code source of truth: [`src/lib/design/tokens.ts`](../src/lib/design/tokens.ts), mirrored in [`src/app/globals.css`](../src/app/globals.css). A unit test enforces every contrast pair below and keeps CSS and TS in sync.

## 1. Principles

1. **Scrapbook outside, notebook inside.** Hero sections, headers, empty states and celebrations use the full scrapbook treatment: torn paper on a royal-blue sunburst, tape, spiral edges, doodles. Working screens (Plan, Network, forms) stay clean and calm like the slide 7 mockups, with an off-white canvas, white cards, navy serif titles and soft area tints.
2. **Every decoration is optional.** Tape, doodles and torn edges are `aria-hidden` and never carry meaning. Removing them must not break comprehension.
3. **Marker for feeling, sans for doing.** Script, marker and handwritten faces are for short headlines and labels only. Anything a student has to read or act on uses Inter.
4. **Color means something.** Each pathway and each readiness area owns one accent, used consistently across cards, chips, progress and the Launch File.
5. **Celebrate verified action.** Motion is reserved for real progress: completing a task, finishing an area, reaching Day 0.

## 2. Color

### 2.1 Palette (sampled from the deck)

| Token | Hex | Sampled from | Use |
|---|---|---|---|
| `navy-900` | `#0A2D73` | Slide 7 buttons, progress bar | Headings, primary buttons, progress |
| `navy-950` | `#0B1F4D` | — (brief) | Deepest text, rarely used |
| `navy-800` | `#1F385E` | Torn navy paper behind the logo | Dark paper panels |
| `royal-700` | `#174380` | Slide backgrounds | Background blue |
| `royal-500` | `#2B5494` | Background sunburst rays | Sunburst rays |
| `blue-500` | `#3D85D3` | "ALUMNI LOOP", "LAST" | Accent blue, decorative fills |
| `blue-300` | `#A4CCF8` | "Blue" in the logo | Logo, highlights on navy |
| `blue-200` | `#B8D7EA` | Label tape | Chips, Hired fill |
| `blue-100` | `#D2E3F3` | "Built to Last" cards | Soft blue cards |
| `paper` | `#FCFAF4` | Slide 7 app canvas | App background |
| `cream-50` | `#F3ECE0` | Notebook paper | Paper cards, hero paper |
| `cream-100` | `#F0E9DB` | "Beyond" in the logo | Logo cream |
| `cream-200` | `#E4D4B0` | Kraft paper | Edges, shadows, kraft scraps |
| `gold-400` | `#F7D685` | Day 75 / 25 circles | Highlights, countdown chips, focus ring, Entrepreneurship |
| `gold-500` | `#E5B54F` | Marker underline | Underline strokes, doodles |
| `orange-500` | `#FF6722` | "PERSONALIZE", "CONNECT" | Emphasis headings (large), CTAs, Job Search |
| `green-400` | `#7FCB8A` | — (brief) | Higher Education, success |
| `purple-400` | `#A98BE0` | — (brief) | Still Deciding |
| `pink-300` | `#F8BAC3` | Pink label tape | Labels |
| `ink-900` | `#1A1A1A` | — | Body text |
| `ink-600` | `#4A4F5C` | — | Secondary text |
| `danger` | `#B42318` | — | Errors |

**Area tints** (slide 7 Prepare screen): `area-career` `#EEF5FC` · `area-financial` `#FBF3D8` · `area-relocation` `#E9F6F3` · `area-network` `#F3ECFA` · `area-wellness` `#FAE9F0` · `success-50` `#EAF7EE` (status card).

> The brief proposed a pink Career card. The deck's app mockup uses a blue tint for Career and pink for Wellness, and the app follows the mockup. The timeline slide's coloured label tapes stay as decorative tape on the story site.

### 2.2 Text-safe companions

The bright accents fail AA as small text, so each has a darker companion used **only for text and icons on light surfaces**.

| Token | Hex | On `paper` | Replaces for text |
|---|---|---|---|
| `blue-700` | `#245FA8` | 6.14 | `blue-500` (links) |
| `orange-700` | `#B23F0C` | 5.57 | `orange-500` |
| `green-700` | `#256B34` | 6.23 | `green-400` |
| `purple-700` | `#6B4FB0` | 5.97 | `purple-400` |
| `gold-800` | `#7A5C00` | 5.99 | `gold-400` |
| `pink-700` | `#A3305A` | ≥ 4.5 on `area-wellness` | `pink-300` |
| `teal-700` | `#1F6F5E` | ≥ 4.5 on `area-relocation` | — |

### 2.3 Contrast rules (enforced by `src/lib/design/tokens.test.ts`)

| Foreground on background | Ratio | Result |
|---|---|---|
| `ink-900` on `paper` | 16.67 | ✅ AA |
| `navy-900` on `paper` | 12.30 | ✅ AA |
| `navy-900` on `cream-50` | 10.93 | ✅ AA |
| white on `navy-900` | 12.84 | ✅ AA |
| `cream-50` on `royal-700` | 8.31 | ✅ AA |
| `gold-400` on `royal-700` | 6.93 | ✅ AA |
| `blue-300` on `navy-800` | 7.04 | ✅ AA |
| `navy-900` on every area tint | ≥ 10.99 | ✅ AA |
| `ink-900` on `orange-500` | ≈ 6.0 | ✅ AA (orange CTA text) |
| `navy-900` on `purple-400` | 4.56 | ✅ AA (just) |
| `navy-900` on `orange-500` | 4.41 | ❌ use `ink-900` |
| white on `orange-500` | 2.91 | ❌ never |
| `orange-500` on `paper` | 2.79 | ❌ large display text and decoration only |
| `blue-500` on `paper` | 3.66 | ❌ large text only; use `blue-700` |
| input border `#8F8778` on `paper` | 3.41 | ✅ non-text 3:1 |

**Rules that follow:**
- Orange CTAs (`Button variant="accent"`) use **ink text**, never white or navy.
- Links on light surfaces use `blue-700`, underlined. Links on royal use `cream-50`, underlined.
- `orange-500` headings ("PERSONALIZE") are display-size only (≥ 24 px).
- **Focus ring:** 3 px `gold-400` outline with a 2 px `navy-900` inner ring. The navy ring carries the contrast on light paper and the gold on blue backgrounds. It's applied globally with `:focus-visible`, so it overrides component-level `outline-none`.

### 2.4 Semantic tokens (shadcn/ui)

| Semantic | Maps to |
|---|---|
| `background` / `foreground` | `paper` / `ink-900` |
| `card`, `popover` | white / `ink-900` |
| `primary` / `primary-foreground` | `navy-900` / white |
| `secondary` / `secondary-foreground` | `blue-100` / `navy-900` |
| `muted`, `accent` | `cream-50` |
| `muted-foreground` | `ink-600` |
| `destructive` | `danger` |
| `border` / `input` / `ring` | `#DCD3C1` / `#8F8778` / `navy-900` |

The MVP is light-only (dark mode is a stretch goal); the semantic layer makes it a variable swap later.

### 2.5 Pathway and area accents

| Pathway | Fill | Text on fill | Text on light |
|---|---|---|---|
| Hired | `blue-200` | `navy-900` | `blue-700` |
| Job Search | `orange-500` | `ink-900` | `orange-700` |
| Higher Education | `green-400` | `navy-900` | `green-700` |
| Entrepreneurship | `gold-400` | `navy-900` | `gold-800` |
| Still Deciding | `purple-400` | `navy-900` | `purple-700` |

| Readiness area | Milestone (opens) | Card tint | Accent text / icon | Icon (lucide) |
|---|---|---|---|---|
| Career Readiness | Day 100 | `area-career` | `blue-700` | `Briefcase` |
| Financial Readiness | Day 75 | `area-financial` | `gold-800` | `PiggyBank` |
| Relocation & Life Logistics | Day 50 | `area-relocation` | `teal-700` | `MapPin` |
| Network & Mentorship | Day 25 | `area-network` | `purple-700` | `Users` |
| Wellness & Detour Planning | Day 0 (opens Day 25) | `area-wellness` | `pink-700` | `Compass` |

## 3. Typography

All loaded with `next/font/google` (`src/app/fonts.ts`), Latin subset, `display: swap`. The marker and handwritten faces aren't preloaded.

| Role | Face | Tailwind | Seen in the deck | Use |
|---|---|---|---|---|
| Script wordmark | **Kaushan Script** | `font-script` | "Beyond Blue" logo, "In Your Pocket" | The wordmark and occasional script accents |
| Marker caps | **Permanent Marker** | `font-marker` | "VERONICA STARTS HER PATH." | Big story headlines, countdown number |
| Handwritten | **Patrick Hand** | `font-hand` | "Career Readiness", "Selected Pathway" | Labels on tape, notes, stickers |
| Serif | **Source Serif 4** | `font-serif` / `font-heading` | "BUILT TO LAST", slide 7 screen titles | Section headings, app screen titles, Launch File |
| UI / body | **Inter** | `font-sans` (default) | Slide 7 body text | Everything else |

> The brief suggested Bebas Neue and Playfair Display. The deck uses no condensed face, and its serif is a lower-contrast, Times-like bold, so Source Serif 4 replaces Playfair and Bebas is dropped (one fewer font download).

### 3.1 Type scale (fluid, Tailwind `text-*` utilities)

| Token | Size | Line height | Typical face | Example |
|---|---|---|---|---|
| `display-xl` | 48 → 88 px | 1.0 | Script / marker | "Beyond Blue" hero |
| `display-lg` | 40 → 64 px | 1.0 | Marker | "87" countdown number |
| `display-md` | 28 → 40 px | 1.1 | Marker | "From Countdown to Launchpad" |
| `heading-xl` | 32 → 48 px | 1.05 | Serif bold caps | "BUILT TO LAST" |
| `heading-serif` | 28 → 44 px | 1.15 | Serif | Story-site section titles |
| `heading-lg` | 22 → 24 px | 1.25 | Serif bold | App screen titles ("87 Days to Graduation") |
| `heading-md` | 18 → 20 px | 1.3 | Inter 600 | Card titles |
| `body-lg` | 18 px | 1.55 | Inter 400 | Story-site paragraphs |
| `body` | 16 px | 1.5 | Inter 400 | Default UI text (never smaller for body copy) |
| `body-sm` | 14 px | 1.45 | Inter 500 | Meta, helper text, buttons |
| `caption` | 12 px | 1.4 | Inter 600, +0.02em | Chips, labels |

## 4. Space, shape, elevation

- **Spacing:** Tailwind 4 px scale. Screen gutters 16 px (mobile), 24 px (tablet), 32 px (desktop). Card padding 16–20 px.
- **Radius:** `--radius-card: 14px`, `--radius-chip: 999px`, `--radius-button: 12px`. Torn-paper cards use a clip-path edge instead of radius on one side.
- **Elevation:** paper shadows, warm and offset, not blurry grey: `--shadow-paper: 0 1px 0 var(--color-cream-200), 2px 4px 0 rgb(10 45 115 / 0.18)` (`shadow-paper` utility). A "pinned" variant adds a slight rotation (−1.5° to 1.5°, reduced to 0° with reduced motion).
- **Layout widths:** content max 1120 px. App screens max 640 px column on desktop beside the sidebar.
- **Breakpoints:** test at 375 (phone), 768 (tablet), 1280+ (desktop). Tailwind `md` = 768, `lg` = 1024, `xl` = 1280.

## 5. Texture and illustration

- **Background:** the deck's sunburst: `royal-700` with alternating `royal-500` rays from a repeating conic gradient, plus a soft radial glow (`bg-burst` utility, no image request).
- **Torn paper:** an SVG mask (two or three edge variants) applied with `mask-image`, so it costs no extra network requests.
- **Spiral notebook edge:** repeating SVG rings along the top or left edge of hero cards.
- **Masking tape:** semi-transparent `cream-200` rotated rectangles with jagged ends (SVG), placed at card corners.
- **Doodles:** hand-drawn arrows, stars, underlines and circles as inline SVG components with `stroke="currentColor"`, drawn on with a path-length animation.
- **People:** initials avatars (circle, pathway accent background, navy initials) by default. Uploaded photos supported. Veronica and all personas are illustrated or initials only. **No photos of real people from the deck.**

## 6. Motion

| Moment | Animation | Duration | Reduced motion |
|---|---|---|---|
| Countdown | Number ticks from 100 to N on first view | 900 ms ease-out | Shows N immediately |
| Progress bars | Fill from 0 when scrolled into view | 600 ms | Static |
| Cards | "Drop in" like pinned paper (y −12 px, rotate −2° → final, fade) staggered 60 ms | 350 ms spring | Fade only, 120 ms |
| Task completion | Check burst + small confetti from the button | 700 ms | Static check + "Saved" toast |
| Area complete | Stamp effect on the area card ("Done!") | 500 ms | Static stamp |
| Day 0 Launchpad | Full-screen rocket/confetti moment with "From Countdown to Launchpad" | 2.5 s, skippable | Static celebration card |
| Doodles | SVG path draw-on | 800 ms | Drawn immediately |

Implementation: Framer Motion `LazyMotion` + `domAnimation`, a shared `motion` preset file, and `useReducedMotion()` in every animated component. Confetti is lazy-loaded (`canvas-confetti`, ~6 KB).

## 7. Components

### 7.1 Primitives (shadcn/ui, themed)
Button (primary navy, accent orange, ghost, link), Input, Textarea, Select, Checkbox, RadioGroup, Switch, Label, Form (RHF + Zod), Dialog, Sheet (bottom sheet on mobile for task details), Tabs, Accordion, Toast (Sonner), Progress, Badge, Avatar, Card, Skeleton, Tooltip, DropdownMenu, Table, Separator, Alert.

### 7.2 Scrapbook kit (`src/components/scrapbook/`)
| Component | Purpose |
|---|---|
| `PaperCard` | Cream card with paper shadow. Variants: `clean`, `torn`, `spiral`, `pinned`. |
| `Tape` | Decorative masking tape at a corner (`aria-hidden`). |
| `MarkerHeading` | Permanent Marker headline with optional doodle underline. |
| `Doodle` | `arrow`, `star`, `circle`, `underline`, `squiggle` SVGs. |
| `Sticker` | Rotated chip used for stats ("68%") and countdown chips. |
| `NotebookLines` | Ruled-paper background for empty states and the Detour builder. |
| `BurstBackground` | Royal radial burst background for heroes and the app shell. |

### 7.3 Product components
| Component | Used on |
|---|---|
| `AppShell` (BottomNav ≤ 1023 px, Sidebar ≥ 1024 px) | All app screens |
| `CountdownHero` | Plan, Home |
| `StepsProgress` ("12 of 30 steps complete") | Plan, Profile |
| `FocusCard` ("Your 100-Day Curriculum") | Plan |
| `AreaCard` + `AreaTaskList` | Plan, area drill-in |
| `TaskSheet` + `OutputPicker` (file / link / form) | Task completion |
| `CompletionBurst` | Task completion |
| `PathwayOption` (radio card) | Onboarding, switch pathway, story site |
| `JourneyTagPicker` | Onboarding, profile edit |
| `ProfileHeader`, `StatusCard`, `JourneyTags` | Profile |
| `NetworkStats`, `AlumniCard` (with `MatchReason`), `ConnectionStatusButton` | Network |
| `LaunchFileSection`, `LaunchFileExportButton` | Launch File |
| `DetourStepper` | Detour Challenge |
| `FundRequestForm`, `FundStatusTimeline`, `FundReviewPanel` (rubric) | Last Mile Fund |
| `KpiTile`, `PathwayAreaHeatmap`, `AtRiskTable` | Staff dashboard |
| `DemoBanner` | Demo mode |
| `EmptyState` (scrapbook illustration + action), `ErrorState`, loading skeletons | Everywhere |

The **UI kit page** at `/dev/ui` (excluded from production builds or behind a flag) renders every token, type style and component state. It replaces Storybook for the MVP to save setup time.

## 8. Screen wireframes (mobile first, 375 px)

### 8.1 Personalize (onboarding)

```
┌───────────────────────────────┐
│ ●○○  step 1 of 3              │
│ BUILD YOUR BEYOND BLUE        │  Serif bold, navy on paper
│ Where are you headed?         │  Marker, with doodle arrow
│ ┌───────────────────────────┐ │
│ │▌Hired                     │ │  PathwayOption radio cards,
│ │▌"I already have a job."   │ │  left bar = pathway accent
│ └───────────────────────────┘ │
│ ┌ Job Search ───────────────┐ │
│ ┌ Higher Education ─────────┐ │
│ ┌ Entrepreneurship ─────────┐ │
│ ┌ Still Deciding ───────────┐ │
│                               │
│ [        Continue →        ]  │  disabled until one selected
└───────────────────────────────┘
Step 2: "What describes your journey?" multi-select chips (wrap), "Prefer not to say",
        privacy note.
Step 3: preferred name, major, target city (optional), destination role (optional)
        [ Create My 100-Day Plan → ] (orange, navy text) → celebration → /plan
```
Desktop: centered 560 px paper card on burst background, steps as a horizontal stepper.

### 8.2 Prepare (Plan)

```
┌───────────────────────────────┐
│ Good morning, Veronica   (VA) │
│ ┌──── torn paper ───────────┐ │
│ │       87                  │ │  Marker display-lg, ticks on view
│ │  DAYS TO GRADUATION       │ │  Serif caps
│ │  ▓▓▓▓▓▓░░░░░░░░  12 of 30 │ │  StepsProgress
│ └───────────────────────────┘ │
│ YOUR 100-DAY CURRICULUM       │
│ ┌ FocusCard ────────────────┐ │
│ │ Financial · due Day 70    │ │
│ │ Build your first 90-day   │ │
│ │ budget          [Start →] │ │
│ └───────────────────────────┘ │
│ READINESS AREAS               │
│ ┌pink─ Career · Day 100 ─6/6┐ │  AreaCards with progress,
│ ┌gold─ Financial · Day 75 2/6┐│  status chip (Active/Behind/Done)
│ ┌blue─ Relocation · Day 50 ..┐│
│ ┌green Network · Day 25 ....┐ │
│ ┌purp─ Wellness · Day 0 ....┐ │
├───────────────────────────────┤
│  Home   Plan   Network Profile│  BottomNav, safe-area aware
└───────────────────────────────┘
Area drill-in: header in area color, list of 6 tasks (status icon, title, due day,
output type icon). Tap → TaskSheet (bottom sheet): why it matters, support partner,
OutputPicker, [Mark complete].
```
Desktop: sidebar left, countdown + focus card in a two-column row, area cards in a 2–3 column grid.

### 8.3 Connect (Network)

```
┌───────────────────────────────┐
│ YOUR BEYOND BLUE NETWORK      │
│ ┌─────┐ ┌─────┐ ┌─────────┐   │
│ │  2  │ │ 48  │ │   31    │   │  Sticker stats
│ │Ment.│ │Alum.│ │On path  │   │
│ └─────┘ └─────┘ └─────────┘   │
│ Alumni You May Want to Meet   │
│ ┌───────────────────────────┐ │
│ │ (TJ) Tasha J. · '19       │ │
│ │ Software Engineer, Acme   │ │
│ │ ★ Also lives in Atlanta · │ │  MatchReason
│ │   Works in software ·     │ │
│ │   Also first-gen          │ │
│ │              [ Connect ]  │ │  → Pending → Connected
│ └───────────────────────────┘ │
│ ...                           │
│ MY CONNECTIONS (accepted, pending)
└───────────────────────────────┘
```
Desktop: stats row, then a 2–3 column grid of alumni cards.

### 8.4 Profile

```
┌───────────────────────────────┐
│        (  VA  )               │  avatar, pathway ring
│     Veronica A.               │
│  Senior · Class of 2027       │
│  Computer Science · Bluefield State University
│ ┌ StatusCard (taped) ───────┐ │
│ │ You did it! Now prepare   │ │
│ │ for a strong start.       │ │
│ └───────────────────────────┘ │
│ DESTINATION                   │
│ Program Manager → Software Engineer │
│ 📍 Atlanta, GA                │
│ MY JOURNEY                    │
│ [First-Generation] [Relocating] [Financially Independent]
│ [ View My Beyond Blue → ]     │  → Launch File
│ Edit profile · Switch pathway · Sign out
└───────────────────────────────┘
```

### 8.5 Landing page (story site)

| # | Section | Treatment |
|---|---|---|
| 1 | **Hero:** "Beyond Blue" (Marker, "Blue" in `blue-500`) + "What happens after graduation?" | Burst background, torn-paper card, doodle arrow to CTAs: **Try the demo as Veronica** (orange) and **Get started** (cream outline) |
| 2 | **Meet Veronica** | Illustrated/initials portrait card, pinned notes: "100 days left", "Work or grad school?", "Moving?", "What if plans change?" |
| 3 | **You're not alone** | Giant "68%" sticker, sentence, source citation (Inside Higher Ed Student Voice, 2024) |
| 4 | **5 Pathways** | Interactive tabs/cards. Selecting one shows its self-description, focus areas and accent color |
| 5 | **How it works** | Serif "HOW BEYOND BLUE WORKS", six principle cards with numbered tape labels |
| 6 | **In Your Pocket** | Four phone frames (Profile, Personalize, Prepare, Connect) with real app screenshots |
| 7 | **Alumni Loop** | Animated cycle: Senior → Graduate → Day +100 → Alumni → Next Senior (SVG circle, step highlight auto-advances, pausable, static list in reduced motion) |
| 8 | **Built to Last** | Reusable curriculum, new cohorts, growing alumni network |
| 9 | **Budget** | Accessible table of the $10,000 breakdown with a stacked bar, "Built by Bluefield" note |
| 10 | **From Countdown to Launchpad** | Day 100 → Day 0 timeline with the five outcomes checked off |
| 11 | **FAQ** | Accordion with the six deck Q&As |
| 12 | **CTA + footer** | Demo + get started, Team Northbound credits, competition line, links to GitHub |

Desktop: sections alternate left/right compositions. Mobile: single column, sticky "Try the demo" pill after the hero scrolls away.

## 9. States checklist (every screen)
- **Loading:** skeletons matching card shapes (no spinners for page loads).
- **Empty:** scrapbook illustration, one sentence, one action.
- **Error:** friendly copy, retry action, no stack traces.
- **Offline:** cached shell with "You're offline. Your progress will be here when you reconnect."
- **Demo:** `DemoBanner` visible on all app screens.
