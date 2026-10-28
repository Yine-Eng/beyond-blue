import "server-only";
import { type FormId, FORMS } from "@/content/curriculum";
import { type PathwayId, getPathway } from "@/content/pathways";
import { getPlan } from "@/lib/data/plan";
import { buildLaunchFile } from "@/lib/domain/launch-file";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Everything for the Launch File page and PDF: the student's header and their six sections. */
export async function getLaunchFile() {
  const plan = await getPlan();
  const supabase = await createSupabaseServerClient();

  const [completionsRes, sectionsRes, mentorsRes] = await Promise.all([
    supabase
      .from("task_completions")
      .select(
        "task_id, pathway_id_at_completion, output_type, output_url, output_path, output_data, verified_at, completed_at, task:tasks(title, launch_file_section, form_id)",
      )
      .eq("student_id", plan.user.id),
    supabase.from("tasks").select("id, launch_file_section").eq("pathway_id", plan.plan.pathway_id),
    supabase
      .from("connections")
      .select("mentor:mentor_profiles(display_name, role_title, city)")
      .eq("student_id", plan.user.id)
      .eq("status", "accepted"),
  ]);
  if (completionsRes.error) throw completionsRes.error;
  if (sectionsRes.error) throw sectionsRes.error;
  if (mentorsRes.error) throw mentorsRes.error;

  // Uploaded files get short-lived signed links (the PDF links back to the task instead).
  const paths = completionsRes.data.flatMap((c) => (c.output_path ? [c.output_path] : []));
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage.from("task-outputs").createSignedUrls(paths, 60 * 30);
    for (const s of data ?? []) if (s.path && s.signedUrl) signed.set(s.path, s.signedUrl);
  }

  const sectionOf = new Map(sectionsRes.data.map((t) => [t.id, t.launch_file_section]));
  const openTasks = plan.tasks
    .filter((t) => t.status !== "complete")
    .sort((a, b) => b.dueDayOffset - a.dueDayOffset)
    .map((t) => ({ id: t.id, title: t.title, section: sectionOf.get(t.id) ?? "" }));

  const file = buildLaunchFile(
    completionsRes.data.map((c) => ({
      taskId: c.task_id,
      title: c.task?.title ?? c.task_id,
      section: c.task?.launch_file_section ?? "resources",
      pathwayName: getPathway(c.pathway_id_at_completion as PathwayId).name,
      completedAt: c.completed_at,
      verified: c.verified_at !== null,
      outputType: c.output_type,
      url: c.output_url ?? (c.output_path ? (signed.get(c.output_path) ?? null) : null),
      data: (c.output_data as Record<string, unknown> | null) ?? null,
      fields: c.task?.form_id ? FORMS[c.task.form_id as FormId].fields : [],
    })),
    openTasks,
    mentorsRes.data.flatMap((c) =>
      c.mentor
        ? [{ name: c.mentor.display_name, role: c.mentor.role_title, city: c.mentor.city }]
        : [],
    ),
  );

  const { profile, cohort } = plan;
  return {
    file,
    student: {
      name: profile.full_name || profile.preferred_name || "Student",
      school: profile.school,
      classYear: profile.class_year ?? cohort?.class_year ?? null,
      major: profile.major,
      pathway: getPathway(plan.plan.pathway_id as PathwayId).name,
      destination: profile.destination_role,
      targetCity: profile.target_city,
    },
    daysLeft: plan.daysLeft,
    stepsComplete: plan.completedCount,
    stepsTotal: plan.tasks.length,
  };
}

export type LaunchFileData = Awaited<ReturnType<typeof getLaunchFile>>;
