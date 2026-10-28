import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

// Needs a real Supabase project (local .env.local, or GitHub Actions secrets in CI).
test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, "Supabase env vars not configured");

// One demo session per viewport keeps the run inside the demo rate limits.
test("explore as Veronica: plan, area drill-in and reset", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /Try the demo as Veronica/ })
    .first()
    .click();

  await expect(page.getByRole("heading", { name: "Your 100-Day Curriculum" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page).toHaveURL(/\/plan$/);
  const main = page.locator("main");
  await expect(main.locator("p.font-marker").first()).toHaveText("87");
  await expect(main.getByText("12 of 30 steps complete").filter({ visible: true })).toBeVisible();
  await expect(
    main.getByRole("heading", { level: 3, name: "Finalize onboarding documents" }),
  ).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Demo mode" })).toBeVisible();
  await expectNoA11yViolations(page);

  await main.getByRole("link", { name: /Financial Readiness/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Financial Readiness" })).toBeVisible();
  await expect(main.getByText("4 of 6 complete").filter({ visible: true })).toBeVisible();
  await expectNoA11yViolations(page);

  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page).toHaveURL(/\/plan\?reset=1$/);
  await expect(main.getByText("12 of 30 steps complete").filter({ visible: true })).toBeVisible();
});

test("the /demo page starts nothing until you press the button", async ({ page }) => {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { level: 1, name: "Explore Beyond Blue as Veronica" }),
  ).toBeVisible();
  await page.goto("/plan");
  await expect(page).toHaveURL(/\/sign-in/);
});
