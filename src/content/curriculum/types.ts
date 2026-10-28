import type { AreaId, PathwayId } from "@/lib/design/tokens";
import type { FormId } from "./forms";

export type { AreaId, PathwayId };

export type LaunchFileSection =
  "next_step_plan" | "financial_prep" | "strategy" | "network" | "resources" | "detour_plan";

export type SupportPartner =
  | "career_services"
  | "student_success"
  | "alumni"
  | "employers"
  | "financial_pro"
  | "financial_aid"
  | "counseling"
  | "faculty";

export type TaskOutput =
  { type: "file"; accept: readonly string[] } | { type: "link" } | { type: "form"; formId: FormId };

export type TaskDef = {
  /** Unique within the pathway; id = `${pathway}.${area}.${slug}`. */
  slug: string;
  title: string;
  whyItMatters: string;
  /** Days before graduation the task is due (inside its area's window). */
  dueDayOffset: number;
  output: TaskOutput;
  /** Shared across pathways so completed work counts after a pathway switch. */
  equivalenceKey?: string;
  /** The one output per area that a mentor or staff member may badge "Verified". */
  isKeyOutput?: boolean;
  launchFileSection: LaunchFileSection;
  support?: readonly SupportPartner[];
};

export type PathwayCurriculum = Record<AreaId, readonly TaskDef[]>;

export const DOCUMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

/** Area focus windows: tasks must be due between `from` and `to` days before graduation. */
export const AREA_WINDOWS: Record<AreaId, { from: number; to: number }> = {
  career: { from: 100, to: 76 },
  financial: { from: 75, to: 51 },
  relocation: { from: 50, to: 26 },
  network: { from: 25, to: 1 },
  wellness: { from: 25, to: 0 },
};
