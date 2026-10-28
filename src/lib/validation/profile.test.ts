// @vitest-environment node
import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile";

const blank = { fullName: "", major: "", destinationRole: "", targetCity: "" };

describe("profileSchema", () => {
  it("turns blank optional fields into null", () => {
    const parsed = profileSchema.parse({
      ...blank,
      preferredName: "Ana",
      major: " ",
      destinationRole: "Analyst",
      journeyTags: ["Veteran"],
    });
    expect(parsed).toMatchObject({
      fullName: null,
      major: null,
      destinationRole: "Analyst",
      targetCity: null,
    });
  });

  it("requires a preferred name and known tags", () => {
    expect(profileSchema.safeParse({ ...blank, preferredName: "", journeyTags: [] }).success).toBe(
      false,
    );
    expect(
      profileSchema.safeParse({ ...blank, preferredName: "Ana", journeyTags: ["Astronaut"] })
        .success,
    ).toBe(false);
  });
});
