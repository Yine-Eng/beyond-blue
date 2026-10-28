import { expectNoA11yViolations } from "./a11y";
import { admin, clientFor, hasAdmin } from "./support/accounts";
import { expect, test } from "./support/fixtures";

/** A student with a plan and a unique name, so parallel runs never see each other's requests. */
const studentWithPlan = (pathwayId: string) => async (id: string) => {
  const { error: nameError } = await admin()
    .from("profiles")
    .update({ full_name: `E2E student ${id.slice(0, 8)}` })
    .eq("id", id);
  if (nameError) throw nameError;
  const { error } = await admin()
    .from("student_plans")
    .insert({ student_id: id, pathway_id: pathwayId });
  if (error) throw error;
};

test.skip(!hasAdmin(), "Supabase admin key not configured");

test("staff review a fund request with the rubric, and the student sees the decision", async ({
  page,
  account,
  signIn,
}) => {
  test.setTimeout(90_000);
  // A student with a plan sends a $75 interview travel request.
  const student = await account("student", studentWithPlan("job_search"));
  const studentDb = await clientFor(student);
  const neededBy = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);
  const { data: request, error } = await studentDb.rpc("submit_fund_request", {
    p_category: "interview_travel",
    p_amount_cents: 7500,
    p_next_step: "Final-round interview in Charlotte",
    p_justification:
      "The employer covers the hotel but not the bus fare, and my first paycheck comes later.",
    p_needed_by: neededBy,
  });
  if (error) throw error;

  await signIn("staff");
  await page.goto("/staff/fund?status=submitted");
  await page
    .locator("main")
    .getByRole("link")
    .filter({ hasText: `E2E student ${student.id.slice(0, 8)} · Interview travel` })
    .click();
  await expect(page.getByRole("heading", { level: 1, name: "$75 · Interview travel" })).toBeVisible(
    { timeout: 20_000 },
  );
  await expectNoA11yViolations(page);

  // The rubric comes first, then a note.
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("Complete the rubric before deciding.")).toBeVisible();
  for (const group of await page.getByRole("radiogroup").all())
    await group.getByText("Met", { exact: true }).click();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("Add a note explaining the decision.").first()).toBeVisible({
    timeout: 20_000,
  });
  await page
    .getByLabel("Decision note (the student sees this)")
    .fill("Approved: the bus fare covers your final round. Good luck!");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("This request has been decided.")).toBeVisible({ timeout: 20_000 });

  // The student sees the outcome and the note.
  const { data: seen } = await studentDb
    .from("fund_requests")
    .select("status, reviewer_notes")
    .eq("id", request.id)
    .single();
  expect(seen).toEqual({
    status: "approved",
    reviewer_notes: "Approved: the bus fare covers your final round. Good luck!",
  });
});

test("approval is blocked when a rubric item isn't met", async ({ page, account, signIn }) => {
  const student = await account("student", studentWithPlan("hired"));
  const { error } = await (
    await clientFor(student)
  ).rpc("submit_fund_request", {
    p_category: "deposit",
    p_amount_cents: 20000,
    p_next_step: "Sign my lease",
    p_justification: "The apartment deposit is due two weeks before my first paycheck arrives.",
    p_needed_by: new Date(Date.now() + 20 * 86_400_000).toISOString().slice(0, 10),
  });
  if (error) throw error;

  await signIn("staff");
  await page.goto("/staff/fund?category=deposit&status=submitted");
  await page
    .locator("main")
    .getByRole("link")
    .filter({ hasText: `E2E student ${student.id.slice(0, 8)} · Housing deposit` })
    .click();
  await expect(page.getByRole("heading", { level: 1, name: "$200 · Housing deposit" })).toBeVisible(
    {
      timeout: 20_000,
    },
  );
  const groups = await page.getByRole("radiogroup").all();
  for (const [i, group] of groups.entries())
    await group.getByText(i === 1 ? "Not met" : "Met", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Approve" })).toBeDisabled();
  await page
    .getByLabel("Decision note (the student sees this)")
    .fill("Please upload the lease page.");
  await page.getByRole("button", { name: "Ask for more info" }).click();
  await expect(page.getByText("Needs info").first()).toBeVisible({ timeout: 20_000 });
});
