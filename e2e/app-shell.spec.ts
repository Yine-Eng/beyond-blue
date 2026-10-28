import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

const APP_PATHS = ["/home", "/plan", "/network", "/profile", "/onboarding"];

test.describe("signed out", () => {
  for (const path of APP_PATHS) {
    test(`${path} redirects to sign-in and remembers where you were going`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`/sign-in\\?next=${encodeURIComponent(path)}`));
      await expect(
        page.getByRole("heading", { level: 1, name: "Sign in to Beyond Blue" }),
      ).toBeVisible();
    });
  }

  test("sign-in page is accessible and validates the email", async ({ page }) => {
    await page.goto("/sign-in");
    await expectNoA11yViolations(page);
    await expect(page.getByText("Judges and visitors: the demos need no sign-up.")).toBeVisible();
    await page.getByRole("button", { name: "Email me a sign-in link" }).click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  });

  test("an expired link shows a clear error", async ({ page }) => {
    await page.goto("/sign-in?error=link");
    await expect(page.getByText("That sign-in link has expired or was already used")).toBeVisible();
  });
});

test("UI kit renders every section without a11y violations", async ({ page }) => {
  // The kit is only built when NEXT_PUBLIC_ENABLE_UI_KIT is set (CI's local build), never on Vercel.
  test.skip(!!process.env.PLAYWRIGHT_BASE_URL, "UI kit is disabled on deployed builds");
  await page.goto("/dev/ui");
  for (const name of ["Colour", "Typography", "Buttons", "Forms", "Scrapbook kit"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expectNoA11yViolations(page);
});
