import { describe, expect, it } from "vitest";
import { type CohortTask, cohortOverview } from "./cohort";

const task = (id: string, over: Partial<CohortTask> = {}): CohortTask => ({
  id,
  pathwayId: "hired",
  areaId: "career",
  dueDayOffset: 90,
  equivalenceKey: null,
  ...over,
});

// Hired: 6 career tasks due early (Day 95..90) and 4 financial tasks due late (Day 10).
const tasks: CohortTask[] = [
  ...Array.from({ length: 6 }, (_, i) => task(`h.c${i}`, { dueDayOffset: 95 - i })),
  ...Array.from({ length: 4 }, (_, i) =>
    task(`h.f${i}`, {
      areaId: "financial",
      dueDayOffset: 10,
      equivalenceKey: i === 0 ? "budget" : null,
    }),
  ),
  task("e.f0", {
    pathwayId: "higher_ed",
    areaId: "financial",
    dueDayOffset: 10,
    equivalenceKey: "budget",
  }),
  task("e.c0", { pathwayId: "higher_ed", dueDayOffset: 95 }),
];

const student = (id: string, done: string[], over: object = {}) => ({
  id,
  name: id,
  pathwayId: "hired" as const,
  daysLeft: 80,
  completedTaskIds: done,
  completedKeys: done.includes("h.f0") ? ["budget"] : [],
  ...over,
});

describe("cohortOverview", () => {
  const overview = cohortOverview(
    [
      student("ahead", ["h.c0", "h.c1", "h.c2", "h.c3", "h.c4", "h.c5", "h.f0"]),
      student("behind", []),
      // Switched to Higher Ed: the budget done under Hired still counts.
      student("switched", ["h.f0"], { pathwayId: "higher_ed" }),
    ],
    tasks,
    ["hired", "job_search", "higher_ed"],
    ["career", "financial"],
  );

  it("summarizes the whole cohort", () => {
    expect(overview.students).toBe(3);
    // 7 of 10 + 0 of 10 + 1 of 2
    expect(overview.overall).toEqual({ completed: 8, total: 22, pct: 36 });
  });

  it("groups by pathway and drops empty pathways", () => {
    expect(overview.byPathway.map((p) => [p.pathwayId, p.students, p.pct])).toEqual([
      ["hired", 2, 35],
      ["higher_ed", 1, 50],
    ]);
  });

  it("fills the pathway × area grid, crediting shared tasks", () => {
    const cell = (p: string, a: string) =>
      overview.grid.find((g) => g.pathwayId === p && g.areaId === a)?.ratio;
    expect(cell("hired", "career")).toEqual({ completed: 6, total: 12, pct: 50 });
    expect(cell("hired", "financial")).toEqual({ completed: 1, total: 8, pct: 13 });
    expect(cell("higher_ed", "financial")).toEqual({ completed: 1, total: 1, pct: 100 });
  });

  it("flags students behind the countdown by the threshold, worst first", () => {
    expect(overview.atRisk).toEqual([
      {
        id: "behind",
        name: "behind",
        pathwayId: "hired",
        completed: 0,
        expected: 6,
        behindBy: 6,
        daysLeft: 80,
      },
    ]);
  });

  it("handles an empty cohort", () => {
    const empty = cohortOverview([], tasks, ["hired"], ["career"]);
    expect(empty).toEqual({
      students: 0,
      overall: { completed: 0, total: 0, pct: 0 },
      byPathway: [],
      grid: [],
      atRisk: [],
    });
  });
});
