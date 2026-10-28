import { z } from "zod";
import { JOURNEY_TAGS, PREFER_NOT_TO_SAY } from "@/content/journey-tags";
import { PATHWAYS } from "@/content/pathways";

const pathwayIds = PATHWAYS.map((p) => p.id) as [string, ...string[]];
const tags = [...JOURNEY_TAGS, PREFER_NOT_TO_SAY] as [string, ...string[]];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters.`)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Shared by the onboarding form and the createPlan Server Action. */
export const onboardingSchema = z.object({
  pathwayId: z.enum(pathwayIds, { error: "Choose where you're headed." }),
  journeyTags: z
    .array(z.enum(tags))
    .max(JOURNEY_TAGS.length)
    .transform((list) => (list.includes(PREFER_NOT_TO_SAY) ? [] : [...new Set(list)])),
  preferredName: z
    .string()
    .trim()
    .min(1, "Tell us what to call you.")
    .max(60, "Keep it under 60 characters."),
  major: optionalText(120),
  targetCity: optionalText(120),
  destinationRole: optionalText(120),
});

export type OnboardingInput = z.input<typeof onboardingSchema>;
