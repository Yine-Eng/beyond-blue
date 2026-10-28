/**
 * Task status, area progress, expected pace and the focus task (docs/architecture.md §6).
 * Nothing is ever locked: students can always work ahead or catch up.
 */

export type TaskStatus = "complete" | "active" | "behind" | "upcoming";

export type PlanTask = {
  id: string;
  areaId: string;
  dueDayOffset: number;
  /** Day the task's readiness area opens (its focus window starts). */
  opensAtDay: number;
  sortOrder: number;
};

export function taskStatus(task: PlanTask, daysLeft: number, completed: boolean): TaskStatus {
  if (completed) return "complete";
  if (daysLeft < task.dueDayOffset) return "behind";
  if (daysLeft <= task.opensAtDay) return "active";
  return "upcoming";
}

export type AreaProgress = {
  completed: number;
  total: number;
  status: "upcoming" | "active" | "behind" | "complete";
};

export function areaProgress(
  tasks: PlanTask[],
  daysLeft: number,
  completedIds: ReadonlySet<string>,
): AreaProgress {
  const statuses = tasks.map((t) => taskStatus(t, daysLeft, completedIds.has(t.id)));
  const completed = statuses.filter((s) => s === "complete").length;
  const status =
    completed === tasks.length
      ? "complete"
      : statuses.includes("behind")
        ? "behind"
        : statuses.includes("active")
          ? "active"
          : "upcoming";
  return { completed, total: tasks.length, status };
}

/** Tasks a student "should" have finished by now: everything due on or before today. */
export function expectedCompleted(tasks: PlanTask[], daysLeft: number): number {
  return tasks.filter((t) => t.dueDayOffset >= daysLeft).length;
}

/** At-risk when the student trails the expected pace by this many steps. */
export const BEHIND_THRESHOLD = 5;

/**
 * The single most relevant next task: the most overdue one if any are behind, otherwise the
 * earliest-due task in an open area, otherwise the next upcoming task.
 */
export function focusTask<T extends PlanTask>(
  tasks: T[],
  daysLeft: number,
  completedIds: ReadonlySet<string>,
): T | undefined {
  const open = tasks.filter((t) => !completedIds.has(t.id));
  const byUrgency = (a: T, b: T) => b.dueDayOffset - a.dueDayOffset || a.sortOrder - b.sortOrder;
  const behind = open.filter((t) => taskStatus(t, daysLeft, false) === "behind").sort(byUrgency);
  if (behind[0]) return behind[0];
  const active = open.filter((t) => taskStatus(t, daysLeft, false) === "active").sort(byUrgency);
  if (active[0]) return active[0];
  return open.sort(byUrgency)[0];
}
