import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getStudentContext } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MENTOR_COLUMNS =
  "id, display_name, role_title, employer, industry, city, grad_school, pathways, journey_tags, bio, capacity, is_available";

/** For mentor screens: a signed-in user with a mentor profile, otherwise back to the app. */
export const requireMentor = cache(async () => {
  const ctx = await getStudentContext();
  const supabase = await createSupabaseServerClient();
  const { data: mentorId } = await supabase.rpc("my_mentor_id");
  if (!mentorId) redirect("/plan");
  const { data: mentor, error } = await supabase
    .from("mentor_profiles")
    .select(MENTOR_COLUMNS)
    .eq("id", mentorId)
    .single();
  if (error) throw error;
  return { ...ctx, mentor };
});

/** Incoming requests, accepted mentees with their shared outputs, and conversation logs. */
export const getMentorInbox = cache(async () => {
  const { mentor } = await requireMentor();
  const supabase = await createSupabaseServerClient();
  const { data: connections, error } = await supabase
    .from("connections")
    .select(
      "id, status, match_reason, note, requested_at, student_id, student:profiles(preferred_name, target_city, destination_role, plan:student_plans(pathway_id)), notes:mentor_notes(id, met_on, topic, notes)",
    )
    .eq("mentor_id", mentor.id)
    .in("status", ["pending", "accepted"])
    .order("requested_at", { ascending: false });
  if (error) throw error;

  const menteeIds = connections.filter((c) => c.status === "accepted").map((c) => c.student_id);
  const { data: outputs, error: outputsError } = menteeIds.length
    ? await supabase
        .from("task_completions")
        .select(
          "id, student_id, output_type, output_url, output_data, completed_at, verified_at, task:tasks(title, is_key_output)",
        )
        .in("student_id", menteeIds)
        .order("completed_at", { ascending: false })
    : { data: [], error: null };
  if (outputsError) throw outputsError;

  return {
    mentor,
    requests: connections.filter((c) => c.status === "pending"),
    mentees: connections
      .filter((c) => c.status === "accepted")
      .map((c) => ({ ...c, outputs: outputs.filter((o) => o.student_id === c.student_id) })),
  };
});
