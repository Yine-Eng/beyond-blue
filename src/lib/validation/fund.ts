import { z } from "zod";
import { FUND_CATEGORIES, FUND_DOCUMENT_TYPES, FUND_RUBRIC } from "@/content/fund";
import { MAX_UPLOAD_BYTES } from "./task-output";

const categoryIds = FUND_CATEGORIES.map((c) => c.id) as [string, ...string[]];

/** Student request form (PRD US-FUND-1). The dollar cap is checked again on the server. */
export const fundRequestSchema = z.object({
  category: z.enum(categoryIds, { error: "Choose what the money is for." }),
  amount: z.coerce
    .number({ error: "Enter a whole-dollar amount." })
    .int("Use whole dollars.")
    .min(1, "Enter at least $1."),
  nextStep: z
    .string()
    .trim()
    .min(5, "Name the next step this unlocks.")
    .max(200, "Keep it under 200 characters."),
  justification: z
    .string()
    .trim()
    .min(50, "Tell us a little more (at least 50 characters).")
    .max(1000, "Keep it under 1,000 characters."),
  neededBy: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date."),
  documentPath: z.string().min(10).max(300).optional(),
});

export type FundRequestInput = z.infer<typeof fundRequestSchema>;

export const fundUploadSchema = z.object({
  mime: z.enum(FUND_DOCUMENT_TYPES, { error: "Upload a PDF or an image (PNG, JPG, WebP)." }),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, "Files must be 10 MB or smaller."),
});

const rubricShape = Object.fromEntries(FUND_RUBRIC.map((r) => [r.id, z.boolean()])) as Record<
  (typeof FUND_RUBRIC)[number]["id"],
  z.ZodBoolean
>;

/** Staff decision: every rubric item answered and a note (PRD US-FUND-2). */
export const fundDecisionSchema = z
  .object({
    id: z.uuid(),
    status: z.enum(["in_review", "needs_info", "approved", "declined"], {
      error: "Choose a decision.",
    }),
    rubric: z.object(rubricShape, { error: "Complete the rubric before deciding." }),
    note: z
      .string()
      .trim()
      .min(1, "Add a note explaining the decision.")
      .max(1000, "Keep it under 1,000 characters."),
  })
  .refine((d) => d.status !== "approved" || Object.values(d.rubric).every(Boolean), {
    path: ["rubric"],
    message: "Every rubric item must be met to approve.",
  });
