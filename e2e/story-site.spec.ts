import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

test.describe("story site", () => {
  test("tells the story in deck order", async ({ page }) => {
    await page.goto("/");
    const headings = await page.getByRole("heading", { level: 2 }).allTextContents();
    const order = ["This is", "not alone", "5 pathways", "works", "In Your Pocket"].map((needle) =>
      headings.findIndex((h) => h.toLowerCase().includes(needle.toLowerCase())),
    );
    order.forEach((index) => expect(index).toBeGreaterThanOrEqual(0));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  test("pathway tabs change the visible pathway", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Higher Education" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("I'm continuing my education.");
  });

  test("demo CTA opens the app", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Try the demo as Veronica/ }).click();
    await expect(page).toHaveURL(/\/home$/);
  });

  test("has no serious a11y violations", async ({ page }) => {
    await page.goto("/");
    await expectNoA11yViolations(page);
  });
});
