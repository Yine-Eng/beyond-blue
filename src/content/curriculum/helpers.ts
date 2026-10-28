import type { FormId } from "./forms";
import { DOCUMENT_TYPES, type TaskDef, type TaskOutput } from "./types";

/** Compact task constructor for the pathway files. */
export const t = (
  slug: string,
  title: string,
  whyItMatters: string,
  dueDayOffset: number,
  output: TaskOutput,
  launchFileSection: TaskDef["launchFileSection"],
  extra: Pick<TaskDef, "isKeyOutput" | "support" | "equivalenceKey"> = {},
): TaskDef => ({ slug, title, whyItMatters, dueDayOffset, output, launchFileSection, ...extra });

export const file = (): TaskOutput => ({ type: "file", accept: DOCUMENT_TYPES });
export const link = (): TaskOutput => ({ type: "link" });
export const form = (formId: FormId): TaskOutput => ({ type: "form", formId });

/** Due days per slot within each area window (6 tasks per area). */
export const DUE = {
  career: [98, 95, 90, 86, 82, 78],
  financial: [73, 70, 66, 62, 58, 54],
  relocation: [48, 45, 41, 37, 33, 29],
  network: [24, 21, 17, 13, 9, 5],
  wellness: [22, 18, 14, 10, 6, 0],
} as const;

/** Shared tasks every pathway includes, so they carry over when a student switches pathway. */
export const shared = {
  goals: (due: number): TaskDef => ({
    slug: "goals-90",
    title: "Set your first 90-day goals",
    whyItMatters: "Clear goals turn a vague future into a plan you can act on from day one.",
    dueDayOffset: due,
    output: form("goals-90"),
    equivalenceKey: "goals-90",
    launchFileSection: "next_step_plan",
    support: ["career_services"],
  }),
  budget: (due: number): TaskDef => ({
    slug: "budget-90",
    title: "Build your first 90-day budget",
    whyItMatters:
      "Knowing your numbers is the difference between a stressful move and a confident one.",
    dueDayOffset: due,
    output: form("budget-90"),
    equivalenceKey: "budget-90",
    isKeyOutput: true,
    launchFileSection: "financial_prep",
    support: ["financial_pro", "financial_aid"],
  }),
  mentor: (due: number): TaskDef => ({
    slug: "mentor-conversation",
    title: "Schedule and log a mentor conversation",
    whyItMatters:
      "One honest conversation with someone a few steps ahead saves months of guessing.",
    dueDayOffset: due,
    output: form("mentor-conversation"),
    equivalenceKey: "mentor-conversation",
    isKeyOutput: true,
    launchFileSection: "network",
    support: ["alumni"],
  }),
  detour: (due: number): TaskDef => ({
    slug: "detour-plan",
    title: "Complete the Detour Challenge",
    whyItMatters:
      "A backup plan written while things are calm keeps a setback from becoming a crisis.",
    dueDayOffset: due,
    output: form("detour-plan"),
    equivalenceKey: "detour-plan",
    isKeyOutput: true,
    launchFileSection: "detour_plan",
    support: ["counseling", "career_services"],
  }),
  wellbeing: (due: number): TaskDef => ({
    slug: "wellbeing-routine",
    title: "Design a weekly wellbeing routine",
    whyItMatters:
      "Transitions are stressful; routines for sleep, movement and connection keep you steady.",
    dueDayOffset: due,
    output: form("reflection"),
    equivalenceKey: "wellbeing-routine",
    launchFileSection: "resources",
    support: ["counseling", "student_success"],
  }),
  campusResources: (due: number): TaskDef => ({
    slug: "place-to-turn",
    title: "Save your 'place to turn' contacts",
    whyItMatters:
      "Knowing exactly who to call at Bluefield State keeps you connected after you graduate.",
    dueDayOffset: due,
    output: form("action-plan"),
    equivalenceKey: "place-to-turn",
    launchFileSection: "resources",
    support: ["student_success"],
  }),
};
