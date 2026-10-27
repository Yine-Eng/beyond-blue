# Beyond Blue: Design System

> Status: **Draft for review**. Palette values are approximations sampled from the pitch deck and should be fine-tuned against the deck file before M0 ships.

## 1. Principles

1. **Scrapbook outside, notebook inside.** Hero sections, headers, empty states and celebrations use the full scrapbook treatment (torn cream paper on royal blue, tape, spiral edges, doodles). Working screens (Plan, Network, forms) stay clean and calm like the slide 7 mockups: cream cards, clear type, one accent per area.
2. **Every decoration is optional.** Tape, doodles and torn edges are `aria-hidden` and never carry meaning. Removing them must not break comprehension.
3. **Marker for feeling, sans for doing.** Handwritten and display faces are for short headlines only. Anything a student has to read or act on uses Inter.
4. **Color means something.** Each pathway and each readiness area owns one accent, used consistently across cards, chips, progress and the Launch File.
5. **Celebrate verified action.** Motion is reserved for real progress: completing a task, finishing an area, reaching Day 0.

## 2. Color

### 2.1 Core palette

| Token | Hex | Use |
|---|---|---|
| `navy-900` | `#0B1F4D` | Headings and primary text on cream, primary buttons |
| `royal-700` | `#123C8C` | App background (with subtle radial burst), nav |
| `blue-500` | `#3E7BD9` | "Blue" in the logo, Hired accent fill, decorative |
| `blue-200` | `#BFD7F5` | Soft blue cards, Relocation area tint |
| `cream-50` | `#F6EFE2` | Paper / card surface |
| `cream-200` | `#EADFC8` | Paper shadow, edges, dividers |
| `gold-400` | `#F6C445` | Highlights, countdown chips, focus ring, Entrepreneurship |
| `orange-500` | `#F26A2E` | Emphasis fills, CTAs (with navy text), Job Search |
| `green-400` | `#7FCB8A` | Higher Education, success states |
| `purple-400` | `#A98BE0` | Still Deciding |
| `pink-300` | `#F4A9B8` | Career Readiness card |
| `ink-900` | `#1A1A1A` | Body text |

### 2.2 Text-safe companions (added for WCAG AA)

The bright accents fail AA as small text on cream, so each gets a darker companion used **only for text and icons on light surfaces**.

| Token | Hex | On `cream-50` | On white | Replaces for text |
|---|---|---|---|---|
| `blue-700` | `#2A5DB0` | 5.58 | 6.38 | `blue-500` (links) |
| `orange-700` | `#A8400F` | 5.39 | 6.17 | `orange-500` |
| `green-700` | `#256B34` | 5.68 | 6.50 | `green-400` |
| `purple-700` | `#6B4FB0` | 5.45 | 6.23 | `purple-400` |
| `gold-800` | `#7A5C00` | 5.47 | 6.25 | `gold-400` |

### 2.3 Contrast checks (computed, WCAG 2.1 relative luminance)

| Foreground on background | Ratio | Normal text (4.5) | Large text / UI (3.0) |
|---|---|---|---|
| `ink-900` on `cream-50` | 15.22 | ✅ | ✅ |
| `navy-900` on `cream-50` | 13.94 | ✅ | ✅ |
| `navy-900` on `cream-200` | 12.06 | ✅ | ✅ |
| white on `navy-900` | 15.94 | ✅ | ✅ |
| `cream-50` on `royal-700` | 8.95 | ✅ | ✅ |
| white on `royal-700` | 10.24 | ✅ | ✅ |
| `gold-400` on `royal-700` | 6.29 | ✅ | ✅ |
| `gold-400` on `navy-900` | 9.79 | ✅ | ✅ |
| `blue-200` on `royal-700` | 6.95 | ✅ | ✅ |
| `green-400` on `royal-700` | 5.27 | ✅ | ✅ |
| `navy-900` on `gold-400` | 9.79 | ✅ | ✅ |
| `navy-900` on `pink-300` | 8.51 | ✅ | ✅ |
| `navy-900` on `green-400` | 8.21 | ✅ | ✅ |
| `navy-900` on `blue-200` | 10.82 | ✅ | ✅ |
| `navy-900` on `purple-400` | 5.66 | ✅ | ✅ |
| `navy-900` on `orange-500` | 5.22 | ✅ | ✅ |
| `navy-900` on `blue-500` | 3.83 | ❌ | ✅ large only |
| white on `blue-500` | 4.17 | ❌ | ✅ large only |
| `blue-500` on `cream-50` | 3.64 | ❌ | ✅ large only |
| `orange-500` on `royal-700` | 3.35 | ❌ | ✅ large only |
| white on `orange-500` | 3.05 | ❌ | ✅ large only (avoid) |
| `orange-500` on `cream-50` | 2.67 | ❌ | ❌ decorative only |
| `blue-500` on `royal-700` | 2.46 | ❌ | ❌ decorative only |

**Rules that follow:**
- Orange CTAs use **navy text** (5.22), never white.
- Links on cream use `blue-700`. Links on royal use `cream-50` with an underline.
- Hired-accent chips use `blue-200` fill with navy text. `blue-500` is a fill or border, never a small-text background.
- The "Blue" in the logo (`blue-500` on cream) is display-size and decorative (the logo has an accessible name).
- The focus ring is `gold-400`, 3 px, with a 2 px `navy-900` offset, which stays visible on both cream and royal.

### 2.4 Semantic tokens

```css
:root {
  --bg-app: var(--royal-700);
  --bg-surface: var(--cream-50);
  --bg-surface-muted: var(--cream-200);
  --text-primary: var(--ink-900);
  --text-heading: var(--navy-900);
  --text-on-dark: var(--cream-50);
  --text-link: var(--blue-700);
  --action-primary: var(--navy-900);   /* text: cream-50 */
  --action-accent: var(--orange-500);  /* text: navy-900 */
  --success: var(--green-400);         /* text companion: green-700 */
  --warning: var(--gold-400);          /* text companion: gold-800 */
  --danger: #B42318;                   /* 5.75:1 on cream */
  --focus-ring: var(--gold-400);
}
```

Defined once in `src/app/globals.css` and exposed to Tailwind v4 through `@theme`, so classes like `bg-cream-50`, `text-navy-900` and `ring-focus` work. Dark mode is a stretch goal; the token layer makes it a variable swap.

### 2.5 Pathway and area accents

| Pathway | Fill | Text on light | Chip |
|---|---|---|---|
| Hired | `blue-500` | `blue-700` | `blue-200` bg, navy text |
| Job Search | `orange-500` | `orange-700` | `orange-500` bg, navy text |
| Higher Education | `green-400` | `green-700` | `green-400` bg, navy text |
| Entrepreneurship | `gold-400` | `gold-800` | `gold-400` bg, navy text |
| Still Deciding | `purple-400` | `purple-700` | `purple-400` bg, navy text |

| Readiness area | Milestone | Card color | Icon (lucide) |
|---|---|---|---|
| Career Readiness | Day 100 | `pink-300` | `Briefcase` |
| Financial Readiness | Day 75 | `gold-400` | `PiggyBank` |
| Relocation & Life Logistics | Day 50 | `blue-200` | `MapPin` |
| Network & Mentorship | Day 25 | `green-400` | `Users` |
| Wellness & Detour Planning | Day 0 | `purple-400` | `Compass` |

All area cards carry navy text (≥ 5.66:1 on every fill).

## 3. Typography

All loaded with `next/font/google`, subset to Latin, `display: swap`.

| Role | Face | Fallback | Use |
|---|---|---|---|
| Marker display | **Permanent Marker** | `"Comic Sans MS", cursive` | Hero titles, countdown number, celebration moments. Short phrases only. |
| Condensed header | **Bebas Neue** | `Impact, "Arial Narrow", sans-serif` | Section headers, stat labels, nav labels on desktop |
| Editorial serif | **Playfair Display** | `Georgia, serif` | Story-site headings ("HOW BEYOND BLUE WORKS"), Launch File section titles |
| UI / body | **Inter** (variable) | `system-ui, sans-serif` | Everything else |

### 3.1 Type scale (mobile → desktop, fluid with `clamp`)

| Token | Size | Line height | Face | Example |
|---|---|---|---|---|
| `display-xl` | 48 → 88 px | 1.0 | Marker | "Beyond Blue" hero |
| `display-lg` | 40 → 64 px | 1.0 | Marker | "87" countdown number |
| `display-md` | 28 → 40 px | 1.1 | Marker | "From Countdown to Launchpad" |
| `heading-xl` | 32 → 48 px | 1.05 | Bebas Neue | Section headers |
| `heading-serif` | 28 → 44 px | 1.15 | Playfair | "How Beyond Blue Works" |
| `heading-lg` | 22 → 24 px | 1.25 | Inter 700 | Screen titles |
| `heading-md` | 18 → 20 px | 1.3 | Inter 600 | Card titles |
| `body-lg` | 18 px | 1.55 | Inter 400 | Story-site paragraphs |
| `body` | 16 px | 1.5 | Inter 400 | Default UI text (never smaller for body copy) |
| `body-sm` | 14 px | 1.45 | Inter 500 | Meta, helper text |
| `caption` | 12 px | 1.4 | Inter 600, +0.02em | Chips, labels (uppercase allowed) |

## 4. Space, shape, elevation

- **Spacing:** Tailwind 4 px scale. Screen gutters 16 px (mobile), 24 px (tablet), 32 px (desktop). Card padding 16–20 px.
- **Radius:** `--radius-card: 14px`, `--radius-chip: 999px`, `--radius-button: 12px`. Torn-paper cards use a clip-path edge instead of radius on one side.
- **Elevation:** paper shadows, warm and offset, not blurry grey: `--shadow-paper: 0 1px 0 var(--cream-200), 2px 4px 0 rgb(11 31 77 / 0.18)`. A "pinned" variant adds a slight rotation (−1.5° to 1.5°, reduced to 0° with reduced motion).
- **Layout widths:** content max 1120 px. App screens max 640 px column on desktop beside the sidebar.
- **Breakpoints:** test at 375 (phone), 768 (tablet), 1280+ (desktop). Tailwind `md` = 768, `lg` = 1024, `xl` = 1280.

## 5. Texture and illustration

- **Background:** `royal-700` with a soft radial burst (`radial-gradient` from `#1A4DA8` at the center to `royal-700`), plus an optional subtle noise SVG at 4% opacity.
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
│ BUILD YOUR BEYOND BLUE        │  Bebas, cream on royal
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
│ │  DAYS TO GRADUATION       │ │  Bebas
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
| 5 | **How it works** | Playfair "HOW BEYOND BLUE WORKS", six principle cards with numbered tape labels |
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
