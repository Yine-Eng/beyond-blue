/**
 * Beyond Blue design tokens, sampled from the Team Northbound pitch deck.
 *
 * This is the source of truth for JavaScript consumers (PDF export, OG images, charts, tests).
 * `src/app/globals.css` declares the same values as Tailwind theme variables; a unit test keeps
 * the two in sync. See docs/design-system.md for usage rules.
 */
export const palette = {
  // Blues
  "navy-950": "#0B1F4D", // deepest text, rarely used
  "navy-900": "#0A2D73", // headings, primary buttons, progress (app mockups)
  "navy-800": "#1F385E", // torn navy paper behind the logo
  "royal-700": "#174380", // background blue
  "royal-500": "#2B5494", // background sunburst rays
  "blue-700": "#245FA8", // links and blue text on light surfaces
  "blue-500": "#3D85D3", // accent blue ("ALUMNI LOOP", "LAST"), Hired fill
  "blue-300": "#A4CCF8", // "Blue" in the logo
  "blue-200": "#B8D7EA", // label tape, chips
  "blue-100": "#D2E3F3", // soft blue cards

  // Paper
  paper: "#FCFAF4", // app canvas (slide 7 mockups)
  "cream-50": "#F3ECE0", // notebook paper
  "cream-100": "#F0E9DB", // logo cream
  "cream-200": "#E4D4B0", // kraft paper, edges, shadows

  // Accents
  "gold-500": "#E5B54F", // marker underline strokes
  "gold-400": "#F7D685", // highlights, countdown chips, focus ring, Entrepreneurship
  "gold-800": "#7A5C00", // gold text on light surfaces
  "orange-500": "#FF6722", // emphasis headings, CTAs (ink text), Job Search
  "orange-700": "#B23F0C", // orange text on light surfaces
  "green-400": "#7FCB8A", // Higher Education, success
  "green-700": "#256B34", // green text on light surfaces
  "purple-400": "#A98BE0", // Still Deciding
  "purple-700": "#6B4FB0", // purple text on light surfaces
  "pink-300": "#F8BAC3", // pink label tape
  "pink-700": "#A3305A", // pink text on light surfaces
  "teal-700": "#1F6F5E", // teal text on light surfaces

  // Area tints (slide 7 Prepare screen)
  "area-career": "#EEF5FC",
  "area-financial": "#FBF3D8",
  "area-relocation": "#E9F6F3",
  "area-network": "#F3ECFA",
  "area-wellness": "#FAE9F0",
  "success-50": "#EAF7EE",

  // Neutrals and status
  "ink-900": "#1A1A1A",
  "ink-600": "#4A4F5C",
  danger: "#B42318",
  white: "#FFFFFF",
} as const;

export type PaletteToken = keyof typeof palette;

export type AreaId = "career" | "financial" | "relocation" | "network" | "wellness";
export type PathwayId =
  "hired" | "job_search" | "higher_ed" | "entrepreneurship" | "still_deciding";

/** Card tint and the text/icon colour that passes AA on it. */
export const areaColors: Record<AreaId, { tint: PaletteToken; ink: PaletteToken }> = {
  career: { tint: "area-career", ink: "blue-700" },
  financial: { tint: "area-financial", ink: "gold-800" },
  relocation: { tint: "area-relocation", ink: "teal-700" },
  network: { tint: "area-network", ink: "purple-700" },
  wellness: { tint: "area-wellness", ink: "pink-700" },
};

/** Fill colour, the text colour used on that fill, and the text colour on light surfaces. */
export const pathwayColors: Record<
  PathwayId,
  { fill: PaletteToken; onFill: PaletteToken; text: PaletteToken }
> = {
  hired: { fill: "blue-200", onFill: "navy-900", text: "blue-700" },
  job_search: { fill: "orange-500", onFill: "ink-900", text: "orange-700" },
  higher_ed: { fill: "green-400", onFill: "navy-900", text: "green-700" },
  entrepreneurship: { fill: "gold-400", onFill: "navy-900", text: "gold-800" },
  still_deciding: { fill: "purple-400", onFill: "navy-900", text: "purple-700" },
};

/**
 * Text/background pairs the UI relies on, with the WCAG level each must meet.
 * `normal` = 4.5:1 (body text), `large` = 3:1 (≥ 24 px, or ≥ 18.66 px bold, and UI components).
 */
export const requiredContrast: ReadonlyArray<{
  fg: PaletteToken;
  bg: PaletteToken;
  level: "normal" | "large";
  use: string;
}> = [
  { fg: "ink-900", bg: "paper", level: "normal", use: "body text" },
  { fg: "ink-600", bg: "paper", level: "normal", use: "secondary text" },
  { fg: "navy-900", bg: "paper", level: "normal", use: "headings on app canvas" },
  { fg: "navy-900", bg: "cream-50", level: "normal", use: "headings on notebook paper" },
  { fg: "navy-900", bg: "cream-200", level: "normal", use: "text on kraft paper" },
  { fg: "white", bg: "navy-900", level: "normal", use: "primary button" },
  { fg: "cream-50", bg: "royal-700", level: "normal", use: "text on background blue" },
  { fg: "cream-50", bg: "navy-800", level: "normal", use: "text on torn navy paper" },
  { fg: "blue-300", bg: "navy-800", level: "large", use: "logo 'Blue' on navy paper" },
  { fg: "gold-400", bg: "royal-700", level: "normal", use: "highlights on background blue" },
  { fg: "ink-900", bg: "orange-500", level: "normal", use: "orange CTA" },
  { fg: "blue-700", bg: "paper", level: "normal", use: "links" },
  { fg: "blue-700", bg: "cream-50", level: "normal", use: "links on paper" },
  { fg: "orange-700", bg: "paper", level: "normal", use: "orange text" },
  { fg: "green-700", bg: "paper", level: "normal", use: "success text" },
  { fg: "purple-700", bg: "paper", level: "normal", use: "purple text" },
  { fg: "gold-800", bg: "paper", level: "normal", use: "gold text" },
  { fg: "danger", bg: "paper", level: "normal", use: "error text" },
  { fg: "navy-900", bg: "gold-400", level: "normal", use: "gold chip" },
  { fg: "navy-900", bg: "pink-300", level: "normal", use: "pink label" },
  { fg: "navy-900", bg: "blue-200", level: "normal", use: "blue label / Hired chip" },
  { fg: "navy-900", bg: "blue-100", level: "normal", use: "soft blue card" },
  { fg: "navy-900", bg: "green-400", level: "normal", use: "Higher Ed chip" },
  { fg: "navy-900", bg: "purple-400", level: "normal", use: "Still Deciding chip" },
  { fg: "navy-900", bg: "success-50", level: "normal", use: "status card" },
  ...(Object.values(areaColors).flatMap(({ tint, ink }) => [
    { fg: "navy-900", bg: tint, level: "normal", use: `text on ${tint}` },
    { fg: ink, bg: tint, level: "normal", use: `accent text on ${tint}` },
  ]) as ReadonlyArray<{ fg: PaletteToken; bg: PaletteToken; level: "normal"; use: string }>),
];
