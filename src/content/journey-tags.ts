/** "What describes your journey?" tags (deck slide 7). Used for matching and resources only. */
export const JOURNEY_TAGS = [
  "First-Generation",
  "International Student",
  "Relocating",
  "Staying Local",
  "Transfer",
  "Parent / Caregiver",
  "Financially Independent",
  "Veteran",
] as const;

export const PREFER_NOT_TO_SAY = "Prefer not to say";

export type JourneyTag = (typeof JOURNEY_TAGS)[number] | typeof PREFER_NOT_TO_SAY;
