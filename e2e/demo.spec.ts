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

  // File output: the focus task asks for an upload.
  await main.getByRole("link", { name: "Start", exact: true }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Finalize onboarding documents" }),
  ).toBeVisible();
  await page.getByLabel("Upload your file").setInputFiles({
    name: "onboarding-checklist.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"),
  });
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByText("Saved to your Launch File.")).toBeVisible({ timeout: 20_000 });
  await expectNoA11yViolations(page);
  await page.getByRole("link", { name: "Back to your plan" }).click();
  await expect(main.getByText("13 of 30 steps complete").filter({ visible: true })).toBeVisible();

  // Link output.
  await page.goto("/tasks/hired.network.alum-at-company");
  await page.getByLabel("Link to your work").fill("http://not-secure.example");
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByText("Links must start with https://")).toBeVisible();
  await page.getByLabel("Link to your work").fill("https://www.linkedin.com/in/example");
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByText("Saved to your Launch File.")).toBeVisible({ timeout: 20_000 });

  // Form output, with a validation error first.
  await page.goto("/tasks/hired.relocation.commute-plan");
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByText("This field is required.").first()).toBeVisible();
  await page
    .getByLabel("Your reflection")
    .fill("MARTA from Decatur takes 25 minutes door to door.");
  await page.getByLabel("One next step").fill("Buy a monthly Breeze card.");
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByText("Saved to your Launch File.")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("link", { name: "Back to your plan" }).click();
  await expect(main.getByText("15 of 30 steps complete").filter({ visible: true })).toBeVisible();

  // Profile, and an edit round-trip.
  await page.goto("/profile");
  await expect(page.getByRole("heading", { level: 1, name: "Veronica Thompson" })).toBeVisible();
  await expect(main.getByText("Senior · Class of 2027")).toBeVisible();
  await expect(main.getByText("You did it! Now prepare for a strong start.")).toBeVisible();
  await expect(main.getByText("Atlanta, GA")).toBeVisible();
  await expectNoA11yViolations(page);
  await page.getByRole("link", { name: "Edit profile" }).click();
  await page.getByLabel("Target city").fill("Decatur, GA");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
  await expect(main.getByText("Decatur, GA")).toBeVisible();
});

test("the /demo page starts nothing until you press the button", async ({ page }) => {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { level: 1, name: "Explore Beyond Blue as Veronica" }),
  ).toBeVisible();
  await page.goto("/plan");
  await expect(page).toHaveURL(/\/sign-in/);
});
