import { expectNoA11yViolations } from "./a11y";
import { admin, hasAdmin } from "./support/accounts";
import { expect, test } from "./support/fixtures";

// Throwaway accounts in the hosted project (deleted after each test); needs the secret key.
test.skip(!hasAdmin(), "Supabase admin key not configured");

test("staff dashboard and fund queue are accessible to staff", async ({ page, signIn }) => {
  await signIn("staff");
  await page.goto("/staff");
  await expect(page.getByRole("heading", { level: 1, name: "Cohort dashboard" })).toBeVisible();
  const main = page.locator("main");
  for (const name of [
    "Progress by pathway",
    "Pathway × readiness area",
    "At risk",
    "Last Mile Fund",
  ])
    await expect(main.getByRole("heading", { level: 2, name })).toBeVisible();
  // Demo sessions never count towards the real cohort.
  await expect(main.getByText("Students", { exact: true })).toBeVisible();
  await expectNoA11yViolations(page);

  await main.getByRole("link", { name: "Open the fund review queue" }).click();
  await expect(page).toHaveURL(/\/staff\/fund$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 1, name: "Last Mile Fund review" })).toBeVisible({
    timeout: 15_000,
  });
  await expectNoA11yViolations(page);
});

test("the mentor inbox is accessible", async ({ page, signIn }) => {
  await signIn("mentor", async (userId) => {
    // Unavailable, so it is never suggested to students or counted in the alumni stat.
    const { error } = await admin().from("mentor_profiles").insert({
      user_id: userId,
      display_name: "E2E Mentor",
      role_title: "Test mentor",
      city: "Bluefield, WV",
      capacity: 1,
      is_available: false,
    });
    if (error) throw error;
  });
  await page.goto("/mentor");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoA11yViolations(page);
  await page.goto("/mentor/profile");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoA11yViolations(page);
});

test("non-staff see a Staff only page and stay signed in", async ({ page, signIn }) => {
  await signIn("student");
  for (const path of ["/staff", "/staff/fund"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: "Staff only" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Last Mile Fund review" })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Staff" })).toHaveCount(0);
  }
  await expectNoA11yViolations(page);
  // Still signed in: the app sends a student without a plan to onboarding, not to sign-in.
  await page.goto("/home");
  await expect(page).toHaveURL(/\/onboarding/);
});

test("a role change to staff takes effect without signing in again", async ({ page, signIn }) => {
  const id = await signIn("student");
  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/onboarding/);

  // An admin grants the staff role while the user is signed in (as done in SQL in production).
  const { error } = await admin().from("profiles").update({ role: "staff" }).eq("id", id);
  if (error) throw error;

  await page.goto("/staff/fund");
  await expect(page.getByRole("heading", { level: 1, name: "Last Mile Fund review" })).toBeVisible({
    timeout: 20_000,
  });
  await page.goto("/staff");
  await expect(page.getByRole("heading", { level: 1, name: "Cohort dashboard" })).toBeVisible();
  // The session survived every role check: staff without a plan land on the dashboard.
  await page.goto("/home");
  await expect(page).toHaveURL(/\/staff$/, { timeout: 20_000 });
});
