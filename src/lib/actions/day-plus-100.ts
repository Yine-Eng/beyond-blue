"use server";

import { revalidatePath } from "next/cache";
import { requirePlan } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dayPlus100Schema } from "@/lib/validation/day-plus-100";
import { type ActionResult, fail, ok, withValidation } from "./action-result";

/** Saves the graduate's Day +100 check-in. The RPC enforces the window and one response each. */
export async function submitDayPlus100(input: unknown): Promise<ActionResult<null>> {
  return withValidation(dayPlus100Schema, input, async (d) => {
    await requirePlan();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("submit_day_plus_100", {
      p_outcome: d.outcome,
      p_usefulness: d.usefulness,
      p_stress: d.stress,
      p_most_useful: d.mostUseful ?? "",
      p_improve: d.improve ?? "",
      p_opt_in_mentor: d.optInMentor,
      p_opt_in_session: d.optInSession,
      p_opt_in_give: d.optInGive,
    });
    if (error) {
      if (error.code === "P0001") return fail(error.message);
      throw error;
    }
    revalidatePath("/day-plus-100");
    revalidatePath("/home");
    return ok(null);
  });
}
