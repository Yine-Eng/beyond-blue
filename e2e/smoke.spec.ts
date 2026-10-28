import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

test("home page renders without console errors or a11y violations", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Beyond Blue" })).toBeVisible();
  await expectNoA11yViolations(page);
  expect(errors).toEqual([]);
});
