import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y";

// Needs a real Supabase project (local .env.local, or GitHub Actions secrets in CI).
test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, "Supabase env vars not configured");

// One demo session per viewport keeps the run inside the demo rate limits.
test("explore as Veronica: plan, area drill-in and reset", async ({ page }) => {
  // A long journey; give it room for real-network latency when run against the live site.
  test.setTimeout(90_000);
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

  // Network: seeded connections, matched alumni and a connection request.
  await page.goto("/network");
  await expect(
    page.getByRole("heading", { level: 1, name: "Your Beyond Blue Network" }),
  ).toBeVisible();
  const marcus = main.getByRole("listitem").filter({ hasText: "Marcus Bell" });
  await expect(marcus.getByText("Connected")).toBeVisible();
  await expect(
    main.getByRole("listitem").filter({ hasText: "Alicia Moreno" }).getByText("Pending"),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Alumni You May Want to Meet" })).toBeVisible();
  await expect(main.getByText(/Also lives in Atlanta, GA/).first()).toBeVisible();
  await expectNoA11yViolations(page);
  await main
    .getByRole("button", { name: /^Connect with / })
    .first()
    .click();
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByText(/Request sent to/)).toBeVisible({ timeout: 20_000 });
  await expect(main.getByRole("button", { name: /^Withdraw request to / })).toHaveCount(2);

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

test("Detour Challenge, then switch Hired → Higher Education without losing work", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await page
    .getByRole("button", { name: /Try the demo as Veronica/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { name: "Your 100-Day Curriculum" })).toBeVisible({
    timeout: 30_000,
  });
  const main = page.locator("main");
  // Next keeps recently visited pages mounted but hidden, so only match visible fields.
  const field = (label: string | RegExp) => page.getByLabel(label).filter({ visible: true });

  // The Detour task links to the guided builder.
  await page.goto("/tasks/hired.wellness.detour-plan");
  await page.getByRole("link", { name: /Start the Detour Challenge/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "The Detour Challenge" })).toBeVisible();
  await expect(page).toHaveTitle(/Detour Challenge/);
  await expectNoA11yViolations(page);

  const next = page.getByRole("button", { name: "Save and continue" });
  await next.click();
  await expect(page.getByText("This field is required.")).toBeVisible();
  await field("What's the job you're counting on?").fill("Start at Halcyra Digital in June.");
  await next.click();
  await field("Start date delayed").check();
  await next.click();
  await field(/wobbling/).fill("Onboarding paperwork goes quiet.");
  await next.click();
  await field(/first step/).fill("Restart applications and call Career Services.");
  await next.click();
  await field(/least you need each month/).fill("1800");
  await expect(page.getByRole("heading", { name: /You don't have to detour alone/ })).toBeVisible();
  await page.getByRole("button", { name: "Finish my Detour plan" }).click();
  await expect(page.getByText("Detour plan saved to your Launch File.")).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("link", { name: "Back to your plan" }).click();
  await expect(main.getByText("13 of 30 steps complete").filter({ visible: true })).toBeVisible();

  // Switch pathway: the preview shows what's kept, then the plan re-maps.
  await page.goto("/profile");
  await page.getByRole("link", { name: "Switch pathway" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Switch pathway" })).toBeVisible();
  await field(/Higher Education/).check();
  await expect(main.getByText(/13 completed outputs stay in your Launch File/)).toBeVisible();
  await expectNoA11yViolations(page);
  await field("What changed? (optional)").fill("Got into a funded master's program.");
  await page.getByRole("button", { name: "Switch to Higher Education" }).click();
  await expect(page).toHaveURL(/\/plan\?switched=higher_ed$/, { timeout: 20_000 });
  await expect(
    main.getByText(/You're now on the Higher Education pathway/).filter({ visible: true }),
  ).toBeVisible();
  await expect(main.getByText(/Pathway: Higher Education/).filter({ visible: true })).toBeVisible();

  // The history records the change.
  await page.goto("/switch-pathway");
  await expect(main.getByText("Hired → Higher Education").filter({ visible: true })).toBeVisible();
  await expect(main.getByText("“Got into a funded master's program.”")).toBeVisible();
});

test("Launch File with PDF export, then a Last Mile Fund request", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await page
    .getByRole("button", { name: /Try the demo as Veronica/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { name: "Your 100-Day Curriculum" })).toBeVisible({
    timeout: 30_000,
  });
  const main = page.locator("main");
  const field = (label: string | RegExp) => page.getByLabel(label).filter({ visible: true });

  // Launch File: six sections, saved outputs with pathway labels, mentors and empty states.
  await page.goto("/launch-file");
  await expect(page.getByRole("heading", { level: 1, name: "My Launch File" })).toBeVisible();
  await expect(main.getByText(/12 outputs saved/)).toBeVisible();
  for (const name of ["Next-step plan", "Financial prep", "My network", "Detour plan"])
    await expect(main.getByRole("heading", { level: 2, name })).toBeVisible();
  await expect(main.getByText("Halcyra Digital").first()).toBeVisible();
  await expect(main.getByText(/Hired pathway/).first()).toBeVisible();
  await expect(main.getByText("Marcus Bell")).toBeVisible();
  await expect(main.getByRole("link", { name: /^Start: / }).first()).toBeVisible();
  await expectNoA11yViolations(page);

  await main.getByRole("button", { name: "Download PDF" }).click();
  await expect(main.getByText("Your Launch File PDF is ready.")).toBeVisible({ timeout: 30_000 });

  // Last Mile Fund: validation, then a request that shows up as submitted.
  await page.goto("/fund");
  await expect(
    page.getByRole("heading", { level: 1, name: "Small grants for the last mile" }),
  ).toBeVisible();
  await expectNoA11yViolations(page);
  await field("What is it for?").selectOption("deposit");
  await field(/Amount/).fill("400");
  await field("Which next step does this unlock?").fill("Sign my first lease in Atlanta");
  await field("Why do you need help with this cost?").fill("Too short.");
  await field("Needed by").fill("2027-05-20");
  await page.getByRole("button", { name: "Send my request" }).click();
  await expect(page.getByText(/at least 50 characters/)).toBeVisible({ timeout: 20_000 });
  await field("Why do you need help with this cost?").fill(
    "The apartment deposit is due two weeks before my first paycheck arrives in June.",
  );
  await page.getByRole("button", { name: "Send my request" }).click();
  await expect(page.getByText("Requests are capped at $250.")).toBeVisible({ timeout: 20_000 });
  await field(/Amount/).fill("200");
  await page.getByRole("button", { name: "Send my request" }).click();
  await expect(main.getByRole("heading", { name: "Your request" })).toBeVisible({
    timeout: 20_000,
  });
  await expect(main.getByText("$200 · Housing deposit")).toBeVisible();
  await expect(main.getByText("Submitted", { exact: true })).toBeVisible();
});

test("the /demo page starts nothing until you press the button", async ({ page }) => {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { level: 1, name: "Explore Beyond Blue as Veronica" }),
  ).toBeVisible();
  await page.goto("/plan");
  await expect(page).toHaveURL(/\/sign-in/);
});
