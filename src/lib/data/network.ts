import "server-only";
import { cache } from "react";
import { type PathwayId, getPathway } from "@/content/pathways";
import { requirePlan } from "@/lib/auth/session";
import { type MatchStudent, deriveIndustry, suggestMentors } from "@/lib/domain/matching";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ConnectionStatus = "pending" | "accepted" | "declined" | "withdrawn";

/** The student's side of matching: profile basics plus the organization from their offer review. */
export const getMatchStudent = cache(async (): Promise<MatchStudent> => {
  const { user, profile, plan } = await requirePlan();
  const supabase = await createSupabaseServerClient();
  const { data: offer } = await supabase
    .from("task_completions")
    .select("output_data, task:tasks!inner(form_id)")
    .eq("student_id", user.id)
    .eq("task.form_id", "offer-review")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const organization =
    offer?.output_data && typeof offer.output_data === "object" && !Array.isArray(offer.output_data)
      ? String(offer.output_data.organization ?? "") || null
      : null;
  const pathwayId = plan.pathway_id as PathwayId;
  return {
    pathwayId,
    pathwayName: getPathway(pathwayId).name,
    targetCity: profile.target_city,
    employer: pathwayId === "higher_ed" ? null : organization,
    gradSchool: pathwayId === "higher_ed" ? organization : null,
    industry: deriveIndustry(profile.destination_role, profile.major),
    journeyTags: profile.journey_tags,
  };
});

/** Fetches available mentors in the shape the matching function expects. */
export async function getAvailableMentors() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("available_mentors");
  if (error) throw error;
  return data.map((m) => ({
    id: m.id,
    displayName: m.display_name,
    gradYear: m.grad_year,
    roleTitle: m.role_title,
    employer: m.employer,
    industry: m.industry,
    city: m.city,
    gradSchool: m.grad_school,
    pathways: m.pathways,
    journeyTags: m.journey_tags,
    bio: m.bio,
    activeMentees: m.active_mentees,
    lastActiveAt: m.last_active_at,
  }));
}

export type AvailableMentor = Awaited<ReturnType<typeof getAvailableMentors>>[number];

/** Everything the Network screen needs: stats, the student's connections and suggestions. */
export const getNetwork = cache(async () => {
  const { user } = await requirePlan();
  const supabase = await createSupabaseServerClient();

  const [student, mentors, statsRes, connectionsRes] = await Promise.all([
    getMatchStudent(),
    getAvailableMentors(),
    supabase.rpc("network_stats").single(),
    supabase
      .from("connections")
      .select(
        "id, status, match_reason, requested_at, mentor:mentor_profiles(id, display_name, role_title, employer, city)",
      )
      .eq("student_id", user.id)
      .neq("status", "withdrawn")
      .order("requested_at", { ascending: false }),
  ]);
  if (statsRes.error) throw statsRes.error;
  if (connectionsRes.error) throw connectionsRes.error;

  const connections = connectionsRes.data;
  // Hide mentors the student already asked; a withdrawn request can be sent again.
  const exclude = new Set(connections.map((c) => c.mentor?.id).filter((id) => id !== undefined));

  return {
    stats: statsRes.data,
    connections,
    pendingCount: connections.filter((c) => c.status === "pending").length,
    suggestions: suggestMentors(student, mentors, { exclude }),
  };
});

export type NetworkData = Awaited<ReturnType<typeof getNetwork>>;
