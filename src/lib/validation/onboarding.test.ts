// @vitest-environment node
import { describe, expect, it } from "vitest";
import { onboardingSchema } from "./onboarding";

const valid = {
  pathwayId: "hired",
  journeyTags: ["First-Generation", "Relocating"],
  preferredName: " Veronica ",
  major: "Computer Science",
  targetCity: "",
  destinationRole: "Program Manager",
};

describe("onboardingSchema", () => {
  it("accepts a complete answer and trims text", () => {
    const parsed = onboardingSchema.parse(valid);
    expect(parsed.preferredName).toBe("Veronica");
    expect(parsed.targetCity).toBeUndefined();
    expect(parsed.journeyTags).toEqual(["First-Generation", "Relocating"]);
  });

  it("requires a pathway and a name", () => {
    const result = onboardingSchema.safeParse({
      ...valid,
      pathwayId: "astronaut",
      preferredName: "",
    });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path[0]);
    expect(paths).toEqual(expect.arrayContaining(["pathwayId", "preferredName"]));
  });

  it("treats 'Prefer not to say' as no tags", () => {
    const parsed = onboardingSchema.parse({
      ...valid,
      journeyTags: ["Veteran", "Prefer not to say"],
    });
    expect(parsed.journeyTags).toEqual([]);
  });

  it("rejects unknown tags", () => {
    expect(onboardingSchema.safeParse({ ...valid, journeyTags: ["Astronaut"] }).success).toBe(
      false,
    );
  });
});
