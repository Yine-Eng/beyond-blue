"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePlan } from "@/lib/auth/session";
import type { Json } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formSchema } from "@/lib/validation/task-output";
import { type ActionResult, fail, fieldErrorsFrom, ok, withValidation } from "./action-result";
import { completeTask } from "./tasks";

const answersSchema = z.record(z.string(), z.union([z.string(), z.number()]));

const saveSchema = z.object({ step: z.number().int().min(1).max(5), answers: answersSchema });

/** Drops blank answers so a half-finished draft validates. */
const filled = (answers: Record<string, string | number>) =>
  Object.fromEntries(Object.entries(answers).filter(([, v]) => v !== ""));

/** Saves Detour Challenge progress after each step, so students can leave and come back. */
export async function saveDetourStep(input: unknown): Promise<ActionResult<null>> {
  return withValidation(saveSchema, input, async ({ step, answers }) => {
    const parsed = formSchema("detour-plan").partial().safeParse(filled(answers));
    if (!parsed.success)
      return fail("Please fix the highlighted fields.", fieldErrorsFrom(parsed.error));
    const { user } = await requirePlan();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("detour_plans")
      .upsert(
        { student_id: user.id, answers: parsed.data as Json, current_step: step },
        { onConflict: "student_id" },
      );
    if (error) throw error;
    return ok(null);
  });
}

/**
 * Finishes the challenge: the answers become the Detour task's output (and the Launch File's
 * Detour plan) on the student's current pathway.
 */
export async function finishDetour(input: unknown): Promise<ActionResult<{ taskId: string }>> {
  return withValidation(z.object({ answers: answersSchema }), input, async ({ answers }) => {
    const { user, plan } = await requirePlan();
    const supabase = await createSupabaseServerClient();
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id")
      .eq("pathway_id", plan.pathway_id)
      .eq("equivalence_key", "detour-plan")
      .single();
    if (taskError) throw taskError;

    const result = await completeTask({ type: "form", taskId: task.id, data: answers });
    if (!result.ok) return result;

    const { error } = await supabase.from("detour_plans").upsert(
      {
        student_id: user.id,
        answers: filled(answers) as Json,
        current_step: 5,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "student_id" },
    );
    if (error) throw error;
    revalidatePath("/detour");
    return ok({ taskId: task.id });
  });
}
