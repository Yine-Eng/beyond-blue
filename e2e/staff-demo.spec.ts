import { expectNoA11yViolations } from "./a11y";
import { expect, test } from "./support/fixtures";

test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, "Supabase env vars not configured");

test("judges can view the staff side with fictional data", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/demo");
  await page.getByRole("button", { name: "View as staff (demo) →" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cohort dashboard" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page).toHaveURL(/\/staff$/);
  const main = page.locator("main");
  await expect(page.getByRole("complementary", { name: "Staff demo" })).toBeVisible();
  await expect(main.getByText(/fictional/).first()).toBeVisible();
  await expect(main.getByText("60", { exact: true })).toBeVisible();
  await expect(main.getByText(/steps behind/).first()).toBeVisible();
  await expect(main.getByText(/Fewer than 5 responses/)).toBeVisible();
  await expectNoA11yViolations(page);

  // The fund queue and a review, where decisions aren't saved.
  await main.getByRole("link", { name: "Open the fund review queue" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Last Mile Fund review" })).toBeVisible({
    timeout: 20_000,
  });
  await page.goto("/staff/fund?status=submitted");
  await main.getByRole("link").filter({ hasText: "CompTIA Security+" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: /\$175/ })).toBeVisible({
    timeout: 20_000,
  });
  for (const group of await page.getByRole("radiogroup").all())
    await group.getByText("Met", { exact: true }).click();
  await page.getByLabel("Decision note (the student sees this)").fill("Looks good.");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText(/This is the staff demo, so decisions aren't saved/)).toBeVisible({
    timeout: 20_000,
  });
  await expectNoA11yViolations(page);

  // A staff demo session has no student plan.
  await page.goto("/home");
  await expect(page).toHaveURL(/\/staff$/, { timeout: 20_000 });
});
