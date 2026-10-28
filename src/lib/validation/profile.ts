import { z } from "zod";
import { JOURNEY_TAGS } from "@/content/journey-tags";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters.`)
    .transform((v) => (v ? v : null));

export const profileSchema = z.object({
  preferredName: z
    .string()
    .trim()
    .min(1, "Tell us what to call you.")
    .max(60, "Keep it under 60 characters."),
  fullName: optionalText(120),
  major: optionalText(120),
  destinationRole: optionalText(120),
  targetCity: optionalText(120),
  journeyTags: z
    .array(z.enum(JOURNEY_TAGS as unknown as [string, ...string[]]))
    .max(JOURNEY_TAGS.length),
});
