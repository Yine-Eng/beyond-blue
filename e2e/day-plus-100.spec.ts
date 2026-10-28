import { expectNoA11yViolations } from "./a11y";
import { admin, hasAdmin } from "./support/accounts";
import { expect, test } from "./support/fixtures";

test.skip(!hasAdmin(), "Supabase admin key not configured");

/** A graduate 100 days out: their own cohort (owned by them, so it's deleted with them) and a plan. */
async function makeGraduate(userId: string) {
  const graduated = new Date(Date.now() - 100 * 86_400_000).toISOString().slice(0, 10);
  const { data: cohort, error } = await admin()
    .from("cohorts")
    .insert({
      name: "E2E graduates",
      class_year: 2026,
      graduation_date: graduated,
      time_zone: "America/New_York",
      owner_id: userId,
    })
    .select("id")
    .single();
  if (error) throw error;
  const { error: profileError } = await admin()
    .from("profiles")
    .update({ cohort_id: cohort.id, onboarded_at: new Date().toISOString() })
    .eq("id", userId);
  if (profileError) throw profileError;
  const { error: planError } = await admin()
    .from("student_plans")
    .insert({ student_id: userId, pathway_id: "job_search" });
  if (planError) throw planError;
}

test("a graduate completes the Day +100 check-in once", async ({ page, signIn }) => {
  await signIn("student", makeGraduate);
  await page.goto("/home");
  await page.getByRole("link", { name: /It's Day \+100/ }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Your Day +100 check-in" }),
  ).toBeVisible();
  await expectNoA11yViolations(page);

  await page.getByRole("button", { name: "Send my check-in" }).click();
  await expect(page.getByText("Choose what you're doing now.")).toBeVisible({ timeout: 20_000 });

  const main = page.locator("main");
  await main.getByText("Working", { exact: true }).click();
  await main.getByText("Very useful", { exact: true }).click();
  await main.getByText("A bit less stressed", { exact: true }).click();
  await page.getByLabel("What helped most? (optional)").fill("The 90-day budget.");
  await page.getByLabel(/Mentor a future senior/).check();
  await page.getByRole("button", { name: "Send my check-in" }).click();
  await expect(main.getByText("Thank you, your check-in is in.")).toBeVisible({
    timeout: 20_000,
  });
});

test("seniors see when the check-in opens", async ({ page, signIn }) => {
  await signIn("student", async (id) => {
    const { error } = await admin()
      .from("student_plans")
      .insert({ student_id: id, pathway_id: "hired" });
    if (error) throw error;
    await admin().from("profiles").update({ onboarded_at: new Date().toISOString() }).eq("id", id);
  });
  await page.goto("/day-plus-100");
  await expect(
    page.getByText(/opens 90 days after graduation|Your check-in opens on Day \+90/),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Send my check-in" })).toHaveCount(0);
});
