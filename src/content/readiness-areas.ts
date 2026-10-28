import type { AreaId } from "@/lib/design/tokens";

export type { AreaId };

export type ReadinessArea = {
  id: AreaId;
  name: string;
  /** Milestone shown on the timeline (days before graduation). */
  milestoneDay: number;
  /** Day the area's focus window opens. Wellness opens alongside Network so the Detour plan is done by Day 0. */
  opensAtDay: number;
  /** Example tasks for Veronica (Hired pathway), from the deck timeline slide. */
  hiredExamples: readonly [string, string];
};

/** The five shared readiness areas on the 100-day timeline. Shared by the site and app. */
export const READINESS_AREAS: readonly ReadinessArea[] = [
  {
    id: "career",
    name: "Career Readiness",
    milestoneDay: 100,
    opensAtDay: 100,
    hiredExamples: ["Review offer details", "Set first 90-day career goals"],
  },
  {
    id: "financial",
    name: "Financial Readiness",
    milestoneDay: 75,
    opensAtDay: 75,
    hiredExamples: ["Build first 90-day budget", "Review paycheck and benefits"],
  },
  {
    id: "relocation",
    name: "Relocation & Life Logistics",
    milestoneDay: 50,
    opensAtDay: 50,
    hiredExamples: ["Compare housing options", "Create moving checklist"],
  },
  {
    id: "network",
    name: "Network & Mentorship",
    milestoneDay: 25,
    opensAtDay: 25,
    hiredExamples: [
      "Connect with an alum at her company or in her field",
      "Schedule mentor conversation",
    ],
  },
  {
    id: "wellness",
    name: "Wellness & Detour Planning",
    milestoneDay: 0,
    opensAtDay: 25,
    hiredExamples: ["Complete Detour Challenge", "Build a backup plan if her start date changes"],
  },
];
