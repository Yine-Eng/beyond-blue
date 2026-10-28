"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMentor } from "@/lib/data/mentor";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mentorProfileSchema } from "@/lib/validation/mentor";
import { type ActionResult, fail, ok, withValidation } from "./action-result";

const respondSchema = z.object({ connectionId: z.uuid(), accept: z.boolean() });

/** Accept or decline a pending request (RLS: only the mentor it was sent to). */
export async function respondToConnection(input: unknown): Promise<ActionResult<null>> {
  return withValidation(respondSchema, input, async ({ connectionId, accept }) => {
    const { mentor } = await requireMentor();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("connections")
      .update({ status: accept ? "accepted" : "declined" })
      .eq("id", connectionId)
      .eq("mentor_id", mentor.id)
      .eq("status", "pending")
      .select("id");
    if (error) throw error;
    if (!data.length) return fail("This request is no longer pending.");
    revalidatePath("/mentor");
    return ok(null);
  });
}

const noteSchema = z.object({
  connectionId: z.uuid(),
  metOn: z.iso.date("Choose the date you met."),
  topic: z.string().trim().min(1, "Add a topic.").max(120),
  notes: z.string().trim().max(2000).optional(),
});

export async function logConversation(input: unknown): Promise<ActionResult<null>> {
  return withValidation(noteSchema, input, async ({ connectionId, metOn, topic, notes }) => {
    await requireMentor();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("mentor_notes")
      .insert({ connection_id: connectionId, met_on: metOn, topic, notes: notes || null });
    if (error) throw error;
    revalidatePath("/mentor");
    return ok(null);
  });
}

/** Marks a mentee's shared output as Verified. Never blocks the student's progress. */
export async function verifyOutput(completionId: unknown): Promise<ActionResult<null>> {
  return withValidation(z.uuid(), completionId, async (id) => {
    await requireMentor();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("verify_output", { p_completion: id });
    if (error?.code === "42501") return fail("You can only verify outputs a mentee shared.");
    if (error) throw error;
    revalidatePath("/mentor");
    return ok(null);
  });
}

export async function updateMentorProfile(
  _prev: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  const input = {
    displayName: formData.get("displayName") ?? "",
    roleTitle: formData.get("roleTitle") ?? "",
    employer: formData.get("employer") ?? "",
    industry: formData.get("industry") ?? "",
    city: formData.get("city") ?? "",
    gradSchool: formData.get("gradSchool") ?? "",
    bio: formData.get("bio") ?? "",
    pathways: formData.getAll("pathways"),
    journeyTags: formData.getAll("journeyTags"),
    capacity: formData.get("capacity") ?? "3",
    isAvailable: formData.get("isAvailable") === "on",
  };
  return withValidation(mentorProfileSchema, input, async (data) => {
    const { mentor } = await requireMentor();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("mentor_profiles")
      .update({
        display_name: data.displayName,
        role_title: data.roleTitle,
        employer: data.employer,
        industry: data.industry,
        city: data.city,
        grad_school: data.gradSchool,
        bio: data.bio,
        pathways: data.pathways,
        journey_tags: data.journeyTags,
        capacity: data.capacity,
        is_available: data.isAvailable,
        last_active_at: new Date().toISOString(),
      })
      .eq("id", mentor.id);
    if (error) throw error;
    revalidatePath("/mentor");
    return ok(null);
  });
}
