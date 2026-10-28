// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isProtectedPath, safeNextPath } from "./routes";

describe("isProtectedPath", () => {
  it.each([
    ["/plan", true],
    ["/plan/financial", true],
    ["/onboarding", true],
    ["/", false],
    ["/sign-in", false],
    ["/planning-guide", false],
  ])("%s → %s", (path, expected) => {
    expect(isProtectedPath(path)).toBe(expected);
  });
});

describe("safeNextPath", () => {
  it("keeps same-site relative paths", () => {
    expect(safeNextPath("/plan/career")).toBe("/plan/career");
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "plan",
    "",
    null,
    undefined,
  ])("rejects %s", (value) => {
    expect(safeNextPath(value)).toBe("/plan");
  });
});
