import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

test.describe("installable PWA", () => {
  test("serves a manifest with installable icons", async ({ page, request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.ok()).toBe(true);
    const manifest = await res.json();
    expect(manifest).toMatchObject({ name: "Beyond Blue", display: "standalone" });
    const purposes = manifest.icons.map((i: { purpose: string }) => i.purpose);
    expect(purposes).toEqual(expect.arrayContaining(["any", "maskable"]));
    for (const icon of manifest.icons) {
      const iconRes = await request.get(icon.src);
      expect(iconRes.headers()["content-type"]).toBe("image/png");
    }

    await page.goto("/");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      "href",
      "/manifest.webmanifest",
    );
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  });

  test("registers a service worker that is never cached by the browser", async ({
    page,
    request,
  }) => {
    const sw = await request.get("/sw.js");
    expect(sw.headers()["cache-control"]).toContain("no-store");

    await page.goto("/");
    const scope = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      return reg.scope;
    });
    expect(scope).toMatch(/\/$/);
  });

  test("has an accessible offline page", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.getByRole("heading", { level: 1, name: "You're offline" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await expectNoA11yViolations(page);
  });
});
