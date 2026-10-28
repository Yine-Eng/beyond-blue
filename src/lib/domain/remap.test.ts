import { describe, expect, it } from "vitest";
import { remap } from "./remap";

const hiredDone = [
  { taskId: "hired.financial.budget-90", equivalenceKey: "budget-90" },
  { taskId: "hired.career.offer-review", equivalenceKey: null },
  { taskId: "hired.wellness.detour-plan", equivalenceKey: "detour-plan" },
];

const higherEd = [
  { id: "higher_ed.financial.budget-90", equivalenceKey: "budget-90" },
  { id: "higher_ed.career.shortlist", equivalenceKey: null },
  { id: "higher_ed.career.statement", equivalenceKey: null },
  { id: "higher_ed.wellness.detour-plan", equivalenceKey: "detour-plan" },
];

describe("remap", () => {
  it("keeps every completion and credits shared tasks", () => {
    expect(remap(hiredDone, higherEd)).toEqual({ kept: 3, credited: 2, remaining: 2, total: 4 });
  });

  it("credits nothing when no work overlaps", () => {
    expect(remap([hiredDone[1]!], higherEd)).toEqual({
      kept: 1,
      credited: 0,
      remaining: 4,
      total: 4,
    });
  });

  it("handles a fresh plan with no completions", () => {
    expect(remap([], higherEd)).toEqual({ kept: 0, credited: 0, remaining: 4, total: 4 });
  });

  it("credits a task completed directly even without an equivalence key", () => {
    const done = [{ taskId: "higher_ed.career.shortlist", equivalenceKey: null }];
    expect(remap(done, higherEd).credited).toBe(1);
  });

  it("counts a task once when it matches by id and by key", () => {
    const done = [{ taskId: "higher_ed.financial.budget-90", equivalenceKey: "budget-90" }];
    expect(remap(done, higherEd).credited).toBe(1);
  });
});
