import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { READINESS_AREAS } from "@/content/readiness-areas";
import { requirePlan } from "@/lib/auth/session";
import { countdownStage, daysToGraduation } from "@/lib/domain/countdown";
import { type PlanTask, areaProgress, focusTask, taskStatus } from "@/lib/domain/progress";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PlanTaskView = PlanTask & {
  title: string;
  whyItMatters: string;
  outputType: "file" | "link" | "form";
  formId: string | null;
  isKeyOutput: boolean;
  status: ReturnType<typeof taskStatus>;
  /** Completed under another pathway and credited here through a shared task. */
  carriedOver: boolean;
};

/**
 * Everything the Plan screen needs for the signed-in student: countdown, tasks for their pathway,
 * completion status (including work carried over from another pathway) and per-area progress.
 */
export const getPlan = cache(async () => {
  // The countdown depends on today's date: render at request time, never in a prerender.
  await connection();
  const ctx = await requirePlan();
  const supabase = await createSupabaseServerClient();

  const [tasksRes, completionsRes] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, area_id, title, why_it_matters, due_day_offset, output_type, form_id, is_key_output, equivalence_key, sort_order",
      )
      .eq("pathway_id", ctx.plan.pathway_id)
      .order("sort_order"),
    supabase
      .from("task_completions")
      .select("task_id, task:tasks(equivalence_key)")
      .eq("student_id", ctx.user.id),
  ]);
  if (tasksRes.error) throw tasksRes.error;
  if (completionsRes.error) throw completionsRes.error;

  const cohort = ctx.cohort;
  const daysLeft = cohort ? daysToGraduation(cohort.graduation_date, cohort.time_zone) : 100;
  const opensAt = new Map(READINESS_AREAS.map((a) => [a.id as string, a.opensAtDay]));

  const directIds = new Set(completionsRes.data.map((c) => c.task_id));
  const doneKeys = new Set(completionsRes.data.map((c) => c.task?.equivalence_key).filter(Boolean));
  const creditedIds = new Set(
    tasksRes.data
      .filter((t) => t.equivalence_key && doneKeys.has(t.equivalence_key))
      .map((t) => t.id),
  );
  const completedIds = new Set([...directIds, ...creditedIds]);

  const tasks: PlanTaskView[] = tasksRes.data.map((t) => {
    const base: PlanTask = {
      id: t.id,
      areaId: t.area_id,
      dueDayOffset: t.due_day_offset,
      opensAtDay: opensAt.get(t.area_id) ?? 100,
      sortOrder: t.sort_order,
    };
    return {
      ...base,
      title: t.title,
      whyItMatters: t.why_it_matters,
      outputType: t.output_type,
      formId: t.form_id,
      isKeyOutput: t.is_key_output,
      status: taskStatus(base, daysLeft, completedIds.has(t.id)),
      carriedOver: !directIds.has(t.id) && creditedIds.has(t.id),
    };
  });

  const areas = READINESS_AREAS.map((area) => {
    const areaTasks = tasks.filter((t) => t.areaId === area.id);
    return { ...area, tasks: areaTasks, progress: areaProgress(areaTasks, daysLeft, completedIds) };
  });

  return {
    ...ctx,
    daysLeft,
    stage: countdownStage(daysLeft),
    tasks,
    areas,
    completedCount: tasks.filter((t) => t.status === "complete").length,
    focus: focusTask(tasks, daysLeft, completedIds),
  };
});

export type PlanData = Awaited<ReturnType<typeof getPlan>>;
