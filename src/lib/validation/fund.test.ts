import { describe, expect, it } from "vitest";
import { fundDecisionSchema, fundRequestSchema } from "./fund";

const request = {
  category: "deposit",
  amount: "200",
  nextStep: "Sign my first lease in Atlanta",
  justification: "The deposit is due two weeks before my first paycheck arrives in June.",
  neededBy: "2027-05-20",
};

const allMet = { next_step: true, documented: true, within_cap: true, no_other_source: true };
const id = "0b9f9c1e-3c1a-4a52-9a5e-2b1f0e7c8d11";

describe("fundRequestSchema", () => {
  it("accepts a complete request and coerces the amount", () => {
    expect(fundRequestSchema.parse(request).amount).toBe(200);
  });

  it.each([
    ["amount", "12.50"],
    ["amount", "0"],
    ["justification", "Too short."],
    ["category", "bank_transfer"],
    ["neededBy", "next week"],
  ])("rejects a bad %s", (field, value) => {
    expect(fundRequestSchema.safeParse({ ...request, [field]: value }).success).toBe(false);
  });
});

describe("fundDecisionSchema", () => {
  it("needs a note", () => {
    expect(
      fundDecisionSchema.safeParse({ id, status: "declined", rubric: allMet, note: " " }).success,
    ).toBe(false);
  });

  it("needs every rubric item answered", () => {
    expect(
      fundDecisionSchema.safeParse({
        id,
        status: "declined",
        rubric: { next_step: true },
        note: "No",
      }).success,
    ).toBe(false);
  });

  it("only approves when every item is met", () => {
    const rubric = { ...allMet, documented: false };
    expect(
      fundDecisionSchema.safeParse({ id, status: "approved", rubric, note: "ok" }).success,
    ).toBe(false);
    expect(
      fundDecisionSchema.safeParse({ id, status: "needs_info", rubric, note: "Upload the quote." })
        .success,
    ).toBe(true);
    expect(
      fundDecisionSchema.safeParse({ id, status: "approved", rubric: allMet, note: "Verified." })
        .success,
    ).toBe(true);
  });
});
