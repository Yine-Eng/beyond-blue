import { expect, test } from "@playwright/test";

const PAGES = ["/", "/home", "/plan", "/network", "/profile"];

for (const path of PAGES) {
  test(`${path} never scrolls horizontally`, async ({ page }) => {
    await page.goto(path);
    // Compare with the configured viewport, not innerWidth: with isMobile, Chromium widens the
    // layout viewport to fit overflowing content, which would hide the bug.
    const viewportWidth = page.viewportSize()!.width;
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
  });
}
