import type { AreaId, PathwayId } from "@/lib/design/tokens";
import { BEHIND_THRESHOLD } from "./progress";

/**
 * Cohort progress for the staff dashboard (PRD US-STAFF-1/2). Pure, so the real dashboard and the
 * staff demo share one implementation. Credit follows the student plan: a task counts as done when
 * it, or a task with the same equivalence key, has an output (work carries over between pathways).
 */

export type CohortTask = {
  id: string;
  pathwayId: PathwayId;
  areaId: AreaId;
  dueDayOffset: number;
  equivalenceKey: string | null;
};

export type CohortStudent = {
  id: string;
  name: string;
  pathwayId: PathwayId;
  daysLeft: number;
  /** Task ids the student has an output for, and those tasks' equivalence keys. */
  completedTaskIds: readonly string[];
  completedKeys: readonly string[];
};

export type Ratio = { completed: number; total: number; pct: number };

export type AtRiskStudent = {
  id: string;
  name: string;
  pathwayId: PathwayId;
  completed: number;
  expected: number;
  behindBy: number;
  daysLeft: number;
};

export type CohortOverview = {
  students: number;
  overall: Ratio;
  byPathway: (Ratio & { pathwayId: PathwayId; students: number })[];
  /** pathway × area: share of all task slots completed. Empty pathways are omitted. */
  grid: { pathwayId: PathwayId; areaId: AreaId; ratio: Ratio }[];
  atRisk: AtRiskStudent[];
};

const ratio = (completed: number, total: number): Ratio => ({
  completed,
  total,
  pct: total === 0 ? 0 : Math.round((completed / total) * 100),
});

export function cohortOverview(
  students: readonly CohortStudent[],
  tasks: readonly CohortTask[],
  pathways: readonly PathwayId[],
  areas: readonly AreaId[],
): CohortOverview {
  const tasksByPathway = new Map<PathwayId, CohortTask[]>();
  for (const t of tasks)
    tasksByPathway.set(t.pathwayId, [...(tasksByPathway.get(t.pathwayId) ?? []), t]);

  const cell = new Map<string, { completed: number; total: number }>();
  const key = (p: PathwayId, a: AreaId) => `${p}:${a}`;
  const atRisk: AtRiskStudent[] = [];
  let doneAll = 0;
  let totalAll = 0;

  for (const s of students) {
    const own = tasksByPathway.get(s.pathwayId) ?? [];
    const ids = new Set(s.completedTaskIds);
    const keys = new Set(s.completedKeys);
    const isDone = (t: CohortTask) =>
      ids.has(t.id) || (t.equivalenceKey !== null && keys.has(t.equivalenceKey));

    let completed = 0;
    for (const t of own) {
      const c = cell.get(key(s.pathwayId, t.areaId)) ?? { completed: 0, total: 0 };
      c.total += 1;
      if (isDone(t)) {
        c.completed += 1;
        completed += 1;
      }
      cell.set(key(s.pathwayId, t.areaId), c);
    }
    doneAll += completed;
    totalAll += own.length;

    // Expected pace: everything due on or before today (same rule as the student's plan).
    const expected = own.filter((t) => t.dueDayOffset >= s.daysLeft).length;
    const doneByNow = own.filter((t) => t.dueDayOffset >= s.daysLeft && isDone(t)).length;
    const behindBy = expected - doneByNow;
    if (behindBy >= BEHIND_THRESHOLD)
      atRisk.push({
        id: s.id,
        name: s.name,
        pathwayId: s.pathwayId,
        completed,
        expected,
        behindBy,
        daysLeft: s.daysLeft,
      });
  }

  const byPathway = pathways
    .map((pathwayId) => {
      const group = students.filter((s) => s.pathwayId === pathwayId);
      const sums = areas.reduce(
        (acc, a) => {
          const c = cell.get(key(pathwayId, a));
          return {
            completed: acc.completed + (c?.completed ?? 0),
            total: acc.total + (c?.total ?? 0),
          };
        },
        { completed: 0, total: 0 },
      );
      return { pathwayId, students: group.length, ...ratio(sums.completed, sums.total) };
    })
    .filter((p) => p.students > 0);

  const grid = byPathway.flatMap(({ pathwayId }) =>
    areas.map((areaId) => {
      const c = cell.get(key(pathwayId, areaId)) ?? { completed: 0, total: 0 };
      return { pathwayId, areaId, ratio: ratio(c.completed, c.total) };
    }),
  );

  return {
    students: students.length,
    overall: ratio(doneAll, totalAll),
    byPathway,
    grid,
    atRisk: atRisk.sort((a, b) => b.behindBy - a.behindBy || a.daysLeft - b.daysLeft),
  };
}
