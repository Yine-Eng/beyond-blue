import { z } from "zod";
import { JOURNEY_TAGS } from "@/content/journey-tags";
import { PATHWAYS } from "@/content/pathways";

const pathwayIds = PATHWAYS.map((p) => p.id) as [string, ...string[]];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters.`)
    .transform((v) => v || null);

/** Mentor profile edit form: what students see, plus capacity and availability. */
export const mentorProfileSchema = z.object({
  displayName: z.string().trim().min(1, "Add your name.").max(80),
  roleTitle: z.string().trim().min(1, "Add your role.").max(120),
  employer: optionalText(120),
  industry: optionalText(60),
  city: optionalText(120),
  gradSchool: optionalText(120),
  bio: optionalText(600),
  pathways: z.array(z.enum(pathwayIds)).max(PATHWAYS.length),
  journeyTags: z.array(z.enum(JOURNEY_TAGS)).max(JOURNEY_TAGS.length),
  capacity: z.coerce.number().int().min(0, "Use 0 to 20.").max(20, "Use 0 to 20."),
  isAvailable: z.boolean(),
});
