import { describe, expect, it } from "vitest";
import { type CompletionInput, buildLaunchFile, formRows } from "./launch-file";

const fields = [
  { name: "rent", label: "Rent", kind: "money" },
  { name: "notes", label: "Notes", kind: "textarea" },
];

const completion = (over: Partial<CompletionInput>): CompletionInput => ({
  taskId: "hired.financial.budget-90",
  title: "Build your first 90-day budget",
  section: "financial_prep",
  pathwayName: "Hired",
  completedAt: "2027-03-01T12:00:00Z",
  verified: false,
  outputType: "form",
  url: null,
  data: { rent: 1450, notes: "" },
  fields,
  ...over,
});

describe("formRows", () => {
  it("formats money and drops blank answers", () => {
    expect(formRows(fields, { rent: 1450, notes: "" })).toEqual([
      { label: "Rent", value: "$1,450" },
    ]);
  });

  it("returns nothing without data", () => {
    expect(formRows(fields, null)).toEqual([]);
  });
});

describe("buildLaunchFile", () => {
  it("groups outputs into the six sections, oldest first, with empty-state links", () => {
    const file = buildLaunchFile(
      [
        completion({ taskId: "b", completedAt: "2027-03-05T00:00:00Z" }),
        completion({ taskId: "a", completedAt: "2027-03-01T00:00:00Z", pathwayName: "Job Search" }),
        completion({
          taskId: "c",
          section: "network",
          outputType: "link",
          url: "https://www.linkedin.com/in/example",
          data: null,
        }),
      ],
      [
        {
          id: "hired.wellness.detour-plan",
          title: "Complete the Detour Challenge",
          section: "detour_plan",
        },
        { id: "hired.financial.other", title: "Other", section: "financial_prep" },
      ],
      [{ name: "Marcus Bell", role: "Senior Program Manager", city: "Atlanta, GA" }],
    );

    expect(file.sections.map((s) => s.id)).toEqual([
      "next_step_plan",
      "financial_prep",
      "strategy",
      "network",
      "resources",
      "detour_plan",
    ]);
    expect(file.total).toBe(3);
    const financial = file.sections[1]!;
    expect(financial.items.map((i) => i.taskId)).toEqual(["a", "b"]);
    expect(financial.items[0]!.pathwayName).toBe("Job Search");
    expect(financial.items[0]!.rows).toEqual([{ label: "Rent", value: "$1,450" }]);
    expect(file.sections[3]!.items[0]).toMatchObject({ kind: "link", rows: [] });
    expect(file.sections[5]!.nextTask?.id).toBe("hired.wellness.detour-plan");
    expect(file.sections[0]!.nextTask).toBeNull();
    expect(file.mentors).toHaveLength(1);
  });
});
