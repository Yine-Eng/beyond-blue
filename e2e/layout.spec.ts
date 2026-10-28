import { expect, test } from "@playwright/test";

const PAGES = ["/", "/home", "/plan", "/network", "/profile"];

for (const path of PAGES) {
  test(`${path} never scrolls horizontally`, async ({ page }) => {
    await page.goto(path);
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });
}
