import "server-only";
import { PATHWAYS, type PathwayId } from "@/content/pathways";
import { requirePlan } from "@/lib/auth/session";
import { type RemapPreview, remap } from "@/lib/domain/remap";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** What switching to each other pathway would keep and credit, plus past switches. */
export async function getSwitchPreview() {
  const { user, plan } = await requirePlan();
  const supabase = await createSupabaseServerClient();

  const [tasksRes, completionsRes, historyRes] = await Promise.all([
    supabase.from("tasks").select("id, pathway_id, equivalence_key"),
    supabase
      .from("task_completions")
      .select("task_id, task:tasks(equivalence_key)")
      .eq("student_id", user.id),
    supabase
      .from("pathway_changes")
      .select("id, from_pathway_id, to_pathway_id, reason, completed_kept, changed_at")
      .eq("student_id", user.id)
      .order("changed_at", { ascending: false }),
  ]);
  if (tasksRes.error) throw tasksRes.error;
  if (completionsRes.error) throw completionsRes.error;
  if (historyRes.error) throw historyRes.error;

  const completions = completionsRes.data.map((c) => ({
    taskId: c.task_id,
    equivalenceKey: c.task?.equivalence_key ?? null,
  }));
  const previews = Object.fromEntries(
    PATHWAYS.map((p) => [
      p.id,
      remap(
        completions,
        tasksRes.data
          .filter((t) => t.pathway_id === p.id)
          .map((t) => ({ id: t.id, equivalenceKey: t.equivalence_key })),
      ),
    ]),
  ) as Record<PathwayId, RemapPreview>;

  return { current: plan.pathway_id as PathwayId, previews, history: historyRes.data };
}
