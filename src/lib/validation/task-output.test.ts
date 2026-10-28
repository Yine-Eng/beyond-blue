// @vitest-environment node
import { describe, expect, it } from "vitest";
import { completeTaskSchema, formSchema, linkSchema, uploadRequestSchema } from "./task-output";

describe("formSchema", () => {
  const budget = formSchema("budget-90");

  it("accepts whole-dollar money values from form strings", () => {
    const parsed = budget.parse({
      income: "3750",
      housing: "1450",
      transport: "250",
      food: "400",
      savings: "500",
    });
    expect(parsed.income).toBe(3750);
  });

  it("rejects missing required fields and decimals", () => {
    const result = budget.safeParse({ income: "3750.50", housing: "" });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((i) => i.path[0]);
    expect(fields).toEqual(
      expect.arrayContaining(["income", "housing", "transport", "food", "savings"]),
    );
  });

  it("allows optional fields to be blank", () => {
    expect(
      budget.safeParse({
        income: 1,
        housing: 1,
        transport: 1,
        food: 1,
        savings: 1,
        loans: "",
        notes: "",
      }).success,
    ).toBe(true);
  });

  it("validates select options", () => {
    const detour = formSchema("detour-plan");
    const base = {
      planA: "Start at Peachtree",
      signs: "No contract",
      planB: "Call Career Services",
      minBudget: 2000,
    };
    expect(detour.safeParse({ ...base, detour: "Start date delayed" }).success).toBe(true);
    expect(detour.safeParse({ ...base, detour: "Alien invasion" }).success).toBe(false);
  });
});

describe("linkSchema", () => {
  it("only accepts https links", () => {
    expect(linkSchema.safeParse("https://example.edu/plan").success).toBe(true);
    expect(linkSchema.safeParse("http://example.edu").success).toBe(false);
    expect(linkSchema.safeParse("javascript:alert(1)").success).toBe(false);
  });
});

describe("uploadRequestSchema", () => {
  it("enforces type and size", () => {
    expect(
      uploadRequestSchema.safeParse({ taskId: "a.b.c", mime: "application/pdf", size: 1000 })
        .success,
    ).toBe(true);
    expect(
      uploadRequestSchema.safeParse({
        taskId: "a.b.c",
        mime: "application/x-msdownload",
        size: 1000,
      }).success,
    ).toBe(false);
    expect(
      uploadRequestSchema.safeParse({ taskId: "a.b.c", mime: "image/png", size: 11 * 1024 * 1024 })
        .success,
    ).toBe(false);
  });
});

describe("completeTaskSchema", () => {
  it("discriminates by output type", () => {
    expect(
      completeTaskSchema.safeParse({ type: "link", taskId: "a.b.c", url: "https://x.edu" }).success,
    ).toBe(true);
    expect(completeTaskSchema.safeParse({ type: "link", taskId: "a.b.c", path: "x" }).success).toBe(
      false,
    );
  });
});
