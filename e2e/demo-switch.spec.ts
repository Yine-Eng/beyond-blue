import { deleteTestUser, hasAdmin, sessionUserId } from "./support/accounts";
import { expect, test } from "./support/fixtures";

// Each test starts two demo sessions; the fixtures delete the last one and the test the first.
test.skip(!hasAdmin(), "Supabase admin key not configured");

test("switching from Veronica to the staff demo opens the staff dashboard", async ({
  page,
  context,
}) => {
  test.setTimeout(90_000);
  await page.goto("/demo");
  await page.getByRole("button", { name: /Try the demo as Veronica/ }).click();
  await expect(page.getByRole("heading", { name: "Your 100-Day Curriculum" })).toBeVisible({
    timeout: 30_000,
  });
  const veronica = await sessionUserId(context);

  try {
    await page.goto("/demo");
    await page.getByRole("button", { name: "View as staff (demo) →" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Cohort dashboard" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page).toHaveURL(/\/staff$/);
    await expect(page.getByRole("navigation", { name: "Staff" })).toBeVisible();
    expect(await sessionUserId(context)).not.toBe(veronica);
  } finally {
    if (veronica) await deleteTestUser(veronica);
  }
});

test("switching from the staff demo to Veronica opens her plan", async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.goto("/demo");
  await page.getByRole("button", { name: "View as staff (demo) →" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cohort dashboard" })).toBeVisible({
    timeout: 30_000,
  });
  const staff = await sessionUserId(context);

  try {
    await page.goto("/demo");
    await page.getByRole("button", { name: /Try the demo as Veronica/ }).click();
    await expect(page.getByRole("heading", { name: "Your 100-Day Curriculum" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page).toHaveURL(/\/plan$/);
    expect(await sessionUserId(context)).not.toBe(staff);
  } finally {
    if (staff) await deleteTestUser(staff);
  }
});

test("a signed-in account is asked to sign out instead of being replaced", async ({
  page,
  context,
  signIn,
}) => {
  const id = await signIn("student");
  await page.goto("/demo");
  await page.getByRole("button", { name: "View as staff (demo) →" }).click();
  await expect(page).toHaveURL(/\/demo\?error=signed-in$/, { timeout: 20_000 });
  await expect(
    page.getByRole("alert").filter({ hasText: "Sign out to try the demo" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  expect(await sessionUserId(context)).toBe(id);
});
