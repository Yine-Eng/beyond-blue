import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

const TABS = [
  { label: "Home", path: "/home" },
  { label: "Plan", path: "/plan" },
  { label: "Network", path: "/network" },
  { label: "Profile", path: "/profile" },
] as const;

test.describe("app shell", () => {
  test("navigates between the four tabs and marks the current one", async ({ page }, testInfo) => {
    const desktop = testInfo.project.name === "desktop";
    await page.goto("/home");

    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toHaveCount(1); // only one of bottom nav / sidebar is visible per viewport
    await expect(nav).toBeVisible();

    for (const { label, path } of TABS) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(path);
      await expect(nav.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }

    // The bottom bar is for phones/tablets, the sidebar for desktop.
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    if (desktop) expect(box!.x + box!.width).toBeLessThan(300);
    else expect(box!.y).toBeGreaterThan(page.viewportSize()!.height / 2);
  });

  test("offers a skip link that moves focus to the main content", async ({ page }) => {
    await page.goto("/plan");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  for (const { path } of TABS) {
    test(`${path} has no serious a11y violations`, async ({ page }) => {
      await page.goto(path);
      await expectNoA11yViolations(page);
    });
  }
});

test("UI kit renders every section without a11y violations", async ({ page }) => {
  await page.goto("/dev/ui");
  for (const name of ["Colour", "Typography", "Buttons", "Forms", "Scrapbook kit"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expectNoA11yViolations(page);
});
