// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { PATHWAYS } from "../pathways";
import { READINESS_AREAS } from "../readiness-areas";
import { AREA_WINDOWS, CURRICULUM, FORMS, flattenCurriculum } from ".";

const taskSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(8).max(90),
  whyItMatters: z.string().min(20).max(200),
  dueDayOffset: z.number().int().min(0).max(100),
  output: z.discriminatedUnion("type", [
    z.object({ type: z.literal("file"), accept: z.array(z.string()).min(1) }),
    z.object({ type: z.literal("link") }),
    z.object({
      type: z.literal("form"),
      formId: z.enum(Object.keys(FORMS) as [string, ...string[]]),
    }),
  ]),
  equivalenceKey: z.string().optional(),
  isKeyOutput: z.boolean().optional(),
  launchFileSection: z.enum([
    "next_step_plan",
    "financial_prep",
    "strategy",
    "network",
    "resources",
    "detour_plan",
  ]),
  support: z.array(z.string()).optional(),
});

const SHARED_KEYS = [
  "goals-90",
  "budget-90",
  "mentor-conversation",
  "detour-plan",
  "wellbeing-routine",
  "place-to-turn",
];

describe("curriculum", () => {
  const all = flattenCurriculum();

  it("has 5 pathways × 5 areas × 6 tasks = 150 tasks", () => {
    expect(Object.keys(CURRICULUM).sort()).toEqual(PATHWAYS.map((p) => p.id).sort());
    expect(all).toHaveLength(150);
    for (const pathway of PATHWAYS) {
      for (const area of READINESS_AREAS) {
        expect(CURRICULUM[pathway.id][area.id], `${pathway.id}.${area.id}`).toHaveLength(6);
      }
    }
  });

  it("every task matches the schema", () => {
    for (const task of all) {
      const result = taskSchema.safeParse(task);
      expect(result.success, `${task.id}: ${result.error?.message}`).toBe(true);
    }
  });

  it("task ids are unique", () => {
    expect(new Set(all.map((t) => t.id)).size).toBe(all.length);
  });

  it("every task is due inside its area's window", () => {
    for (const task of all) {
      const { from, to } = AREA_WINDOWS[task.areaId];
      expect(task.dueDayOffset, task.id).toBeLessThanOrEqual(from);
      expect(task.dueDayOffset, task.id).toBeGreaterThanOrEqual(to);
    }
  });

  it("each area marks exactly one key output per pathway", () => {
    for (const pathway of PATHWAYS) {
      for (const area of READINESS_AREAS) {
        const keys = CURRICULUM[pathway.id][area.id].filter((t) => t.isKeyOutput);
        expect(keys, `${pathway.id}.${area.id}`).toHaveLength(1);
      }
    }
  });

  it("every pathway includes the shared tasks that carry over on a pathway switch", () => {
    for (const pathway of PATHWAYS) {
      const keys = all.filter((t) => t.pathwayId === pathway.id).map((t) => t.equivalenceKey);
      for (const key of SHARED_KEYS) expect(keys, `${pathway.id} missing ${key}`).toContain(key);
    }
  });

  it("the Detour Challenge is due by graduation day", () => {
    for (const task of all.filter((t) => t.equivalenceKey === "detour-plan")) {
      expect(task.dueDayOffset).toBe(0);
    }
  });

  it("Veronica's Hired plan includes the deck's example tasks", () => {
    const titles = all.filter((t) => t.pathwayId === "hired").map((t) => t.title);
    for (const example of [
      "Review your offer details",
      "Build your first 90-day budget",
      "Compare housing options",
      "Create your moving checklist",
      "Complete the Detour Challenge",
    ]) {
      expect(titles).toContain(example);
    }
  });
});
