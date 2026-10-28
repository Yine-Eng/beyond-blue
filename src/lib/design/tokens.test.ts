// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MIN_CONTRAST, contrastRatio } from "./contrast";
import { palette, requiredContrast } from "./tokens";

describe("contrastRatio", () => {
  it("matches known WCAG values", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
    expect(contrastRatio("#767676", "#FFFFFF")).toBeCloseTo(4.54, 2);
  });
});

describe("palette contrast", () => {
  it.each(requiredContrast)("$fg on $bg meets $level ($use)", ({ fg, bg, level }) => {
    expect(contrastRatio(palette[fg], palette[bg])).toBeGreaterThanOrEqual(MIN_CONTRAST[level]);
  });
});

describe("globals.css", () => {
  const css = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

  it.each(Object.entries(palette))("declares --color-%s with the token value", (name, hex) => {
    const match = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`).exec(css);
    expect(match?.[1]?.toUpperCase()).toBe(hex.toUpperCase());
  });
});
