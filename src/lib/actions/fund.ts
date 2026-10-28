"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { FundCategory } from "@/content/fund";
import { requirePlan } from "@/lib/auth/session";
import { requireStaff } from "@/lib/data/fund";
import { RATE_LIMITS, checkRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extensionFor } from "@/lib/validation/task-output";
import { fundDecisionSchema, fundRequestSchema, fundUploadSchema } from "@/lib/validation/fund";
import { type ActionResult, fail, ok, withValidation } from "./action-result";

const BUCKET = "fund-docs";

/** Database errors raised on purpose (P0001) carry a message written for the student. */
const friendly = (error: { code?: string; message: string }) =>
  error.code === "P0001" ? fail(error.message) : null;

/** Signed upload URL for an optional supporting document, inside the student's own folder. */
export async function prepareFundUpload(
  input: unknown,
): Promise<ActionResult<{ path: string; token: string }>> {
  return withValidation(fundUploadSchema, input, async ({ mime }) => {
    const { user } = await requirePlan();
    if (!(await checkRateLimit(`upload:${user.id}`, RATE_LIMITS.uploadUrlPerUser))) {
      return fail("You've uploaded a lot in the last hour. Please try again later.");
    }
    const path = `${user.id}/${randomUUID()}.${extensionFor(mime)}`;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) throw error;
    return ok({ path: data.path, token: data.token });
  });
}

/** Submits a new request, or resubmits one that staff sent back with "needs info". */
export async function submitFundRequest(
  input: unknown,
  resubmitId?: string,
): Promise<ActionResult<null>> {
  return withValidation(fundRequestSchema, input, async (data) => {
    const { user } = await requirePlan();
    if (data.documentPath && !data.documentPath.startsWith(`${user.id}/`))
      return fail("That document doesn't belong to you.");
    const supabase = await createSupabaseServerClient();

    const { data: settings } = await supabase
      .from("fund_settings")
      .select("request_cap_cents")
      .single();
    const capDollars = (settings?.request_cap_cents ?? 25000) / 100;
    if (data.amount > capDollars)
      return fail("Please fix the highlighted fields.", {
        amount: [`Requests are capped at $${capDollars}.`],
      });

    const args = {
      p_category: data.category as FundCategory,
      p_amount_cents: data.amount * 100,
      p_next_step: data.nextStep,
      p_justification: data.justification,
      p_needed_by: data.neededBy,
      p_document_path: data.documentPath,
    };
    const { error } = resubmitId
      ? await supabase.rpc("resubmit_fund_request", { ...args, p_id: resubmitId })
      : await supabase.rpc("submit_fund_request", args);
    if (error) {
      const handled = friendly(error);
      if (handled) return handled;
      throw error;
    }
    revalidatePath("/fund");
    return ok(null);
  });
}

/** Staff decision on a request: rubric, note, status. The RPC enforces balance and audit. */
export async function decideFundRequest(input: unknown): Promise<ActionResult<null>> {
  return withValidation(fundDecisionSchema, input, async ({ id, status, rubric, note }) => {
    await requireStaff();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("decide_fund_request", {
      p_id: id,
      p_status: status,
      p_rubric: rubric,
      p_note: note,
    });
    if (error) {
      const handled = friendly(error);
      if (handled) return handled;
      throw error;
    }
    revalidatePath("/staff", "layout");
    return ok(null);
  });
}
