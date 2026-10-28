/**
 * The Launch File (principle 6, PRD US-LF-1): every completed output grouped into six sections.
 * Pure, so the page, the PDF and the export snapshot all render the same structure.
 */

export const LAUNCH_FILE_SECTIONS = [
  { id: "next_step_plan", title: "Next-step plan" },
  { id: "financial_prep", title: "Financial prep" },
  { id: "strategy", title: "Professional & educational strategy" },
  { id: "network", title: "My network" },
  { id: "resources", title: "Resources" },
  { id: "detour_plan", title: "Detour plan" },
] as const;

export type LaunchFileSectionId = (typeof LAUNCH_FILE_SECTIONS)[number]["id"];

export type FieldDef = { name: string; label: string; kind: string };

export type CompletionInput = {
  taskId: string;
  title: string;
  section: string;
  pathwayName: string;
  completedAt: string;
  verified: boolean;
  outputType: "file" | "link" | "form";
  url: string | null;
  data: Record<string, unknown> | null;
  fields: readonly FieldDef[];
};

export type LaunchFileItem = {
  taskId: string;
  title: string;
  pathwayName: string;
  completedAt: string;
  verified: boolean;
  kind: "file" | "link" | "form";
  url: string | null;
  rows: { label: string; value: string }[];
};

export type Mentor = { name: string; role: string; city: string | null };

export type LaunchFileSection = {
  id: LaunchFileSectionId;
  title: string;
  items: LaunchFileItem[];
  /** First open task feeding this section, for the empty state. */
  nextTask: { id: string; title: string } | null;
};

export type LaunchFile = {
  sections: LaunchFileSection[];
  mentors: Mentor[];
  total: number;
};

const formatValue = (kind: string, value: unknown) =>
  kind === "money" ? `$${Number(value).toLocaleString("en-US")}` : String(value);

export function formRows(
  fields: readonly FieldDef[],
  data: Record<string, unknown> | null,
): LaunchFileItem["rows"] {
  if (!data) return [];
  return fields
    .filter((f) => data[f.name] !== undefined && data[f.name] !== null && data[f.name] !== "")
    .map((f) => ({ label: f.label, value: formatValue(f.kind, data[f.name]) }));
}

export function buildLaunchFile(
  completions: CompletionInput[],
  openTasks: { id: string; title: string; section: string }[],
  mentors: Mentor[],
): LaunchFile {
  const sections = LAUNCH_FILE_SECTIONS.map(({ id, title }) => ({
    id,
    title,
    items: completions
      .filter((c) => c.section === id)
      .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
      .map((c) => ({
        taskId: c.taskId,
        title: c.title,
        pathwayName: c.pathwayName,
        completedAt: c.completedAt,
        verified: c.verified,
        kind: c.outputType,
        url: c.url,
        rows: c.outputType === "form" ? formRows(c.fields, c.data) : [],
      })),
    nextTask: openTasks.find((t) => t.section === id) ?? null,
  }));
  return { sections, mentors, total: completions.length };
}
