import { z } from "zod";
import { OUTCOMES } from "@/content/day-plus-100";

const outcomeIds = OUTCOMES.map((o) => o.id) as [string, ...string[]];
const scale = (message: string) =>
  z.coerce.number({ error: message }).int().min(1, message).max(5, message);

export const dayPlus100Schema = z.object({
  outcome: z.enum(outcomeIds, { error: "Choose what you're doing now." }),
  usefulness: scale("Pick how useful Beyond Blue was."),
  stress: scale("Pick how your stress compares with graduation."),
  mostUseful: z.string().trim().max(500, "Keep it under 500 characters.").optional(),
  improve: z.string().trim().max(500, "Keep it under 500 characters.").optional(),
  optInMentor: z.boolean(),
  optInSession: z.boolean(),
  optInGive: z.boolean(),
});

export type DayPlus100Input = z.infer<typeof dayPlus100Schema>;
