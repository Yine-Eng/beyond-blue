// @vitest-environment node
import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps a text colour next to a custom font size", () => {
    expect(cn("text-primary-foreground", "text-body-sm")).toBe(
      "text-primary-foreground text-body-sm",
    );
  });

  it("still merges conflicting custom font sizes", () => {
    expect(cn("text-body", "text-heading-lg")).toBe("text-heading-lg");
  });

  it("still merges conflicting colours", () => {
    expect(cn("text-ink-900", "text-navy-900")).toBe("text-navy-900");
  });
});
