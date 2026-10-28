import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Fails the test on any serious or critical WCAG 2.1 A/AA violation. */
export async function expectNoA11yViolations(page: Page) {
  // Next swaps the <title> element during a client navigation; wait until one is in place.
  await page.waitForFunction(() => !!document.head.querySelector("title")?.textContent?.trim());
  // Stop CSS transitions (the global reduced-motion rule) so axe never samples a colour mid-fade,
  // e.g. a button fading in from its disabled opacity.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(
    blocking.map(
      (v) =>
        `${v.id}: ${v.help} -> ${v.nodes
          .slice(0, 5)
          .map((n) => n.target.join(" "))
          .join(", ")}`,
    ),
  ).toEqual([]);
}
