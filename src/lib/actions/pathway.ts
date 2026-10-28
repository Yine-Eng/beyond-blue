"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePlan } from "@/lib/auth/session";
import { PATHWAYS } from "@/content/pathways";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type ActionResult, fail, withValidation } from "./action-result";

const PATHWAY_IDS = PATHWAYS.map((p) => p.id) as [string, ...string[]];

const switchSchema = z.object({
  pathwayId: z.enum(PATHWAY_IDS, { error: "Choose a pathway." }),
  reason: z.string().trim().max(300, "Keep it under 300 characters.").optional(),
});

/**
 * Moves the student to another pathway. The RPC keeps every completion, records the change in
 * pathway history and the audit log in one transaction, then the plan reopens on the new path.
 */
export async function switchPathway(input: unknown): Promise<ActionResult<never>> {
  return withValidation(switchSchema, input, async ({ pathwayId, reason }) => {
    const { plan } = await requirePlan();
    if (plan.pathway_id === pathwayId) return fail("You're already on that pathway.");
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("switch_pathway", {
      p_to: pathwayId,
      p_reason: reason ?? undefined,
    });
    if (error) throw error;
    revalidatePath("/", "layout");
    redirect(`/plan?switched=${pathwayId}`);
  });
}
