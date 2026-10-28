import { expect, test } from "@playwright/test";

// The full magic-link round trip needs a mail server (see ADR 0006), so this covers what the
// callback does with bad or hostile links: no session, a friendly error, never an open redirect.
test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, "Supabase env vars not configured");

test.describe("magic-link callback", () => {
  test("a link without a code goes back to sign-in with an error", async ({ page }) => {
    await page.goto("/auth/callback");
    await expect(page).toHaveURL(/\/sign-in\?error=link$/);
  });

  test("an invalid or expired code doesn't sign anyone in", async ({ page, context }) => {
    await page.goto("/auth/callback?code=not-a-real-code&next=/plan");
    await expect(page).toHaveURL(/\/sign-in\?error=link$/);
    const authCookies = (await context.cookies()).filter((c) => /-auth-token/.test(c.name));
    expect(authCookies).toEqual([]);
    await page.goto("/plan");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("never redirects off-site", async ({ page, baseURL }) => {
    for (const next of ["https://evil.example", "//evil.example", "/\\evil.example"]) {
      await page.goto(`/auth/callback?code=bogus&next=${encodeURIComponent(next)}`);
      expect(new URL(page.url()).origin).toBe(new URL(baseURL!).origin);
    }
  });
});
