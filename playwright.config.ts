import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Local runs use the same Supabase project as `next start`; CI passes secrets as env vars.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

// The demo is rate-limited per client IP in the shared database. Against a local `next start`
// there is no proxy header, so every CI run and local run would share one "unknown" bucket and
// exhaust it. Give each test worker its own private-range address, as a proxy would. (Vercel sets
// the real client IP itself, so this has no effect on deployed sites.)
const octet = () => Math.floor(Math.random() * 254) + 1;
const clientIp = `10.${octet()}.${octet()}.${octet()}`;

/** Viewports from the Definition of Done: 375 px phone, 768 px tablet, 1280 px desktop. */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    extraHTTPHeaders: {
      "x-forwarded-for": clientIp,
      // Vercel previews sit behind Deployment Protection; this lets e2e verify a preview URL.
      ...(process.env.PLAYWRIGHT_BASE_URL && process.env.VERCEL_AUTOMATION_BYPASS_SECRET
        ? {
            "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
            "x-vercel-set-bypass-cookie": "true",
          }
        : {}),
    },
  },
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "tablet",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: process.env.CI ? `npm run start -- -p ${PORT}` : `npm run dev -- -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
