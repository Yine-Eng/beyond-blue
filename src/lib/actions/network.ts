"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePlan } from "@/lib/auth/session";
import { getAvailableMentors, getMatchStudent } from "@/lib/data/network";
import { scoreMentor } from "@/lib/domain/matching";
import { RATE_LIMITS, checkRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type ActionResult, fail, ok, withValidation } from "./action-result";

const requestSchema = z.object({
  mentorId: z.uuid(),
  note: z.string().trim().max(300, "Keep your note to 300 characters or fewer.").optional(),
});

/**
 * Sends a connection request. The score and reason are recomputed here rather than trusted from
 * the client, and stored on the connection so staff can audit matching later.
 */
export async function requestConnection(input: unknown): Promise<ActionResult<null>> {
  return withValidation(requestSchema, input, async ({ mentorId, note }) => {
    const { user } = await requirePlan();
    if (!(await checkRateLimit(`connect:${user.id}`, RATE_LIMITS.connectionRequestsPerUser)))
      return fail("You've sent a lot of requests in the last hour. Please try again later.");

    const [student, mentors] = await Promise.all([getMatchStudent(), getAvailableMentors()]);
    const mentor = mentors.find((m) => m.id === mentorId);
    if (!mentor) return fail("This mentor isn't taking new mentees right now.");
    const { score, reasons } = scoreMentor(student, mentor);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("connections").insert({
      student_id: user.id,
      mentor_id: mentorId,
      match_score: score,
      match_reason: reasons.join(" · ") || null,
      note: note || null,
    });
    if (error?.code === "P0001")
      return fail("You can have 3 pending requests at a time. Withdraw one to send another.");
    if (error?.code === "23505") return fail("You've already sent this mentor a request.");
    if (error) throw error;

    revalidatePath("/network");
    return ok(null);
  });
}

/** Withdraws a pending request (or ends a connection). */
export async function withdrawConnection(connectionId: unknown): Promise<ActionResult<null>> {
  return withValidation(z.uuid(), connectionId, async (id) => {
    const { user } = await requirePlan();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("connections")
      .update({ status: "withdrawn" })
      .eq("id", id)
      .eq("student_id", user.id);
    if (error) throw error;
    revalidatePath("/network");
    return ok(null);
  });
}
