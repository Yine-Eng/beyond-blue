// @vitest-environment node
import { describe, expect, it } from "vitest";
import { BUDGET_LINES, BUDGET_TOTAL, formatUsd } from "./budget";
import { FAQ } from "./faq";
import { alumniLoop, launchpad } from "./story-end";

describe("story content", () => {
  it("budget lines add up to the $10,000 total", () => {
    expect(BUDGET_LINES.reduce((sum, line) => sum + line.amount, 0)).toBe(BUDGET_TOTAL);
    expect(BUDGET_LINES).toHaveLength(8);
    expect(BUDGET_LINES.find((l) => l.area === "App Infrastructure + Publishing")?.amount).toBe(
      250,
    );
  });

  it("formats dollars without cents", () => {
    expect(formatUsd(10_000)).toBe("$10,000");
  });

  it("has the deck's six FAQ entries", () => {
    expect(FAQ).toHaveLength(6);
    expect(FAQ[0].question).toBe("How is Beyond Blue different from Career Services?");
  });

  it("has the five Alumni Loop steps and five Day 0 outcomes", () => {
    expect(alumniLoop.steps.map((s) => s.title)).toEqual([
      "Senior",
      "Graduate",
      "Day +100",
      "Alumni",
      "Next Senior",
    ]);
    expect(launchpad.outcomes.map((o) => o.title)).toEqual([
      "A plan",
      "A budget",
      "A network",
      "A backup plan",
      "A place to turn",
    ]);
  });
});
