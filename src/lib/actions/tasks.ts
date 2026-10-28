"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormId } from "@/content/curriculum";
import { getStudentContext, requirePlan } from "@/lib/auth/session";
import { RATE_LIMITS, checkRateLimit } from "@/lib/security/rate-limit";
import type { Json } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  MAX_DEMO_UPLOAD_BYTES,
  completeTaskSchema,
  extensionFor,
  formSchema,
  uploadRequestSchema,
} from "@/lib/validation/task-output";
import { type ActionResult, fail, fieldErrorsFrom, ok, withValidation } from "./action-result";

const BUCKET = "task-outputs";

/**
 * Step 1 of a file output: validate the file and hand back a short-lived signed upload URL for a
 * path inside the student's own folder. The browser uploads directly to Storage.
 */
export async function prepareUpload(
  input: unknown,
): Promise<ActionResult<{ path: string; token: string }>> {
  return withValidation(uploadRequestSchema, input, async ({ taskId, mime, size }) => {
    const { user, profile } = await getStudentContext();
    if (profile.is_demo && size > MAX_DEMO_UPLOAD_BYTES) {
      return fail("In the demo, files must be 2 MB or smaller.", {
        file: ["In the demo, files must be 2 MB or smaller."],
      });
    }
    if (!(await checkRateLimit(`upload:${user.id}`, RATE_LIMITS.uploadUrlPerUser))) {
      return fail("You've uploaded a lot in the last hour. Please try again later.");
    }
    const path = `${user.id}/${taskId}/${randomUUID()}.${extensionFor(mime)}`;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) throw error;
    return ok({ path: data.path, token: data.token });
  });
}

/** Saves a task's output (link, form answers or uploaded file) and marks the task complete. */
export async function completeTask(input: unknown): Promise<ActionResult<{ taskId: string }>> {
  return withValidation(completeTaskSchema, input, async (output) => {
    const { user, plan } = await requirePlan();
    const supabase = await createSupabaseServerClient();

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, output_type, form_id")
      .eq("id", output.taskId)
      .single();
    if (taskError || !task) return fail("That task doesn't exist.");
    if (task.output_type !== output.type)
      return fail("This task needs a different kind of output.");

    const row = {
      student_id: user.id,
      task_id: task.id,
      pathway_id_at_completion: plan.pathway_id,
      output_type: output.type,
      output_url: null as string | null,
      output_path: null as string | null,
      output_data: null as Json | null,
      completed_at: new Date().toISOString(),
    };

    if (output.type === "link") row.output_url = output.url;

    if (output.type === "form") {
      const parsed = formSchema(task.form_id as FormId).safeParse(output.data);
      if (!parsed.success)
        return fail("Please fix the highlighted fields.", fieldErrorsFrom(parsed.error));
      row.output_data = parsed.data as Json;
    }

    if (output.type === "file") {
      // Only accept files the student actually uploaded into their own folder for this task.
      const prefix = `${user.id}/${task.id}/`;
      if (!output.path.startsWith(prefix)) return fail("That upload doesn't belong to this task.");
      const { data: listed } = await supabase.storage.from(BUCKET).list(prefix.slice(0, -1), {
        search: output.path.slice(prefix.length),
      });
      if (!listed?.length) return fail("We couldn't find your upload. Please try again.");
      row.output_path = output.path;
    }

    // No upsert: ON CONFLICT DO UPDATE would touch student_id/task_id, which students may not
    // update (column grants also keep them away from the verification fields). Replacing an
    // existing output updates only the output columns.
    const { student_id, task_id, ...output_columns } = row;
    const { data: updated, error: updateError } = await supabase
      .from("task_completions")
      .update(output_columns)
      .eq("student_id", student_id)
      .eq("task_id", task_id)
      .select("id");
    if (updateError) throw updateError;
    if (!updated?.length) {
      const { error: insertError } = await supabase.from("task_completions").insert(row);
      if (insertError) throw insertError;
    }

    revalidatePath("/plan", "layout");
    revalidatePath("/home");
    return ok({ taskId: task.id });
  });
}

/** Removes a task's output so the student can start it again. */
export async function undoTask(taskId: unknown): Promise<ActionResult<null>> {
  return withValidation(z.string().min(3).max(120), taskId, async (id) => {
    const { user } = await requirePlan();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("task_completions")
      .delete()
      .eq("student_id", user.id)
      .eq("task_id", id);
    if (error) throw error;
    revalidatePath("/plan", "layout");
    return ok(null);
  });
}

const shareSchema = z.object({ taskId: z.string().min(3).max(120), shared: z.boolean() });

/** Shares (or stops sharing) an output with the student's accepted mentors. */
export async function setOutputShared(input: unknown): Promise<ActionResult<null>> {
  return withValidation(shareSchema, input, async ({ taskId, shared }) => {
    const { user } = await requirePlan();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("task_completions")
      .update({ shared_with_mentors: shared })
      .eq("student_id", user.id)
      .eq("task_id", taskId);
    if (error) throw error;
    return ok(null);
  });
}
