"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation/onboarding";
import { type ActionResult, withValidation } from "./action-result";

/**
 * "Create My 100-Day Plan": saves the student's answers and creates their plan, then opens it.
 * Idempotent: submitting twice never creates a second plan or changes an existing pathway.
 */
export async function createPlan(input: unknown): Promise<ActionResult<never>> {
  return withValidation(onboardingSchema, input, async (data) => {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        preferred_name: data.preferredName,
        major: data.major ?? null,
        target_city: data.targetCity ?? null,
        destination_role: data.destinationRole ?? null,
        journey_tags: data.journeyTags,
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (profileError) throw profileError;

    const { error: planError } = await supabase
      .from("student_plans")
      .upsert(
        { student_id: user.id, pathway_id: data.pathwayId },
        { onConflict: "student_id", ignoreDuplicates: true },
      );
    if (planError) throw planError;

    // withValidation lets this navigation signal through.
    redirect("/plan?welcome=1");
  });
}
