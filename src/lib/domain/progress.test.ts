// @vitest-environment node
import { describe, expect, it } from "vitest";
import { type PlanTask, areaProgress, expectedCompleted, focusTask, taskStatus } from "./progress";

const task = (id: string, dueDayOffset: number, opensAtDay: number, sortOrder = 1): PlanTask => ({
  id,
  areaId: "x",
  dueDayOffset,
  opensAtDay,
  sortOrder,
});

describe("taskStatus", () => {
  const t = task("a", 70, 75);
  it.each([
    [80, false, "upcoming"],
    [75, false, "active"],
    [70, false, "active"],
    [69, false, "behind"],
    [69, true, "complete"],
  ] as const)("at %i days left (done=%s) → %s", (days, done, status) => {
    expect(taskStatus(t, days, done)).toBe(status);
  });
});

describe("areaProgress", () => {
  const tasks = [task("a", 73, 75), task("b", 66, 75)];
  it("reports behind before active, and complete when all done", () => {
    expect(areaProgress(tasks, 70, new Set())).toEqual({
      completed: 0,
      total: 2,
      status: "behind",
    });
    expect(areaProgress(tasks, 74, new Set())).toEqual({
      completed: 0,
      total: 2,
      status: "active",
    });
    expect(areaProgress(tasks, 90, new Set())).toEqual({
      completed: 0,
      total: 2,
      status: "upcoming",
    });
    expect(areaProgress(tasks, 60, new Set(["a", "b"]))).toEqual({
      completed: 2,
      total: 2,
      status: "complete",
    });
  });
});

describe("expectedCompleted", () => {
  it("counts tasks due on or before today", () => {
    const tasks = [task("a", 98, 100), task("b", 90, 100), task("c", 70, 75)];
    expect(expectedCompleted(tasks, 90)).toBe(2);
    expect(expectedCompleted(tasks, 100)).toBe(0);
  });
});

describe("focusTask", () => {
  const tasks = [task("career1", 98, 100, 1), task("career2", 90, 100, 2), task("fin1", 73, 75, 3)];

  it("picks the most overdue task first", () => {
    expect(focusTask(tasks, 87, new Set())?.id).toBe("career1");
  });

  it("otherwise picks the earliest-due task in an open area", () => {
    expect(focusTask(tasks, 99, new Set())?.id).toBe("career1");
    expect(focusTask(tasks, 74, new Set(["career1", "career2"]))?.id).toBe("fin1");
  });

  it("falls back to the next upcoming task, and nothing when all are done", () => {
    expect(focusTask(tasks, 95, new Set(["career1", "career2"]))?.id).toBe("fin1");
    expect(focusTask(tasks, 50, new Set(["career1", "career2", "fin1"]))).toBeUndefined();
  });
});
