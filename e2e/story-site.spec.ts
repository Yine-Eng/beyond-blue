import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

test.describe("story site", () => {
  test("tells the story in deck order", async ({ page }) => {
    await page.goto("/");
    const headings = await page.getByRole("heading", { level: 2 }).allTextContents();
    const order = [
      "This is",
      "not alone",
      "5 pathways",
      "works",
      "In Your Pocket",
      "Alumni Loop",
      "Built to",
      "Financial Plan",
      "starts",
      "Q",
      "Ready to see it",
    ].map((needle) => headings.findIndex((h) => h.toLowerCase().includes(needle.toLowerCase())));
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
    await page
      .getByRole("link", { name: /Try the demo as Veronica/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/home$/);
  });

  test("FAQ answers expand with the deck wording", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Who owns and runs Beyond Blue?/ }).click();
    await expect(
      page.getByText("Career Services and Student Success would serve as the central owners", {
        exact: false,
      }),
    ).toBeVisible();
  });

  test("budget table totals $10,000", async ({ page }) => {
    await page.goto("/");
    const table = page.getByRole("table", { name: /pilot budget/ });
    await expect(table.getByRole("row")).toHaveCount(10); // header + 8 lines + total
    await expect(table.locator("tfoot")).toContainText("$10,000");
  });

  test("the alumni loop can be paused", async ({ page }) => {
    await page.goto("/");
    const pause = page.getByRole("button", { name: "Pause the loop" });
    await pause.click();
    await expect(page.getByRole("button", { name: "Play the loop" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("has no serious a11y violations", async ({ page }) => {
    await page.goto("/");
    await expectNoA11yViolations(page);
  });
});
