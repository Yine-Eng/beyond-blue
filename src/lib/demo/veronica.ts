import "server-only";
import { addDays, todayInTimeZone } from "@/lib/domain/countdown";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

/** Veronica's demo story (deck slides 3 and 7). Fictional data only. */
export const DEMO_DAYS_LEFT = 87;
const TIME_ZONE = "America/New_York";

const PROFILE = {
  preferred_name: "Veronica",
  full_name: "Veronica Thompson",
  class_year: 2027,
  major: "Computer Science",
  destination_role: "Program Manager → Software Engineer",
  target_city: "Atlanta, GA",
  journey_tags: ["First-Generation", "Relocating", "Financially Independent"],
};

type Completion = {
  task: string;
  link?: string;
  form?: Record<string, string | number>;
};

/**
 * 12 of 30 steps complete. "Finalize onboarding documents" is left open, so it becomes her
 * current (overdue) task, exactly as in the slide 7 mockup, and judges can try a file upload.
 */
const COMPLETIONS: Completion[] = [
  {
    task: "hired.career.offer-review",
    form: {
      organization: "Halcyra Digital",
      role: "Associate Program Manager",
      startDate: "2027-06-14",
      location: "Atlanta, GA (hybrid)",
      benefits:
        "Health, dental and vision from day one; 401(k) with 4% match; 15 PTO days; $2,000 relocation stipend.",
      questions:
        "Is the relocation stipend paid before or after the move? Who is my onboarding buddy?",
    },
  },
  {
    task: "hired.career.goals-90",
    form: {
      goal1: "Ship my first project milestone on time",
      goal2: "Meet one-on-one with everyone on my team",
      goal3: "Start a weekly coding practice toward software engineering",
      measure:
        "Milestone delivered, 8 one-on-ones logged, 12 practice sessions completed by day 90.",
    },
  },
  { task: "hired.career.know-your-team", link: "https://www.linkedin.com/company/" },
  {
    task: "hired.career.first-week-questions",
    form: {
      objective: "Arrive ready to learn how success is measured",
      steps:
        "Ask how my team measures success\nAsk which tools I need access to\nAsk who to go to when I'm stuck",
      deadline: "2027-06-14",
      support: "My manager and onboarding buddy",
    },
  },
  { task: "hired.career.profile-update", link: "https://www.linkedin.com/in/" },
  {
    task: "hired.financial.paycheck-benefits",
    form: {
      reflection:
        "My salary is $62,000, but after taxes, insurance and 401(k) my take-home is about $3,750 a month.",
      nextStep: "Use $3,750 as my real monthly income in my budget.",
    },
  },
  {
    task: "hired.financial.budget-90",
    form: {
      income: 3750,
      housing: 1450,
      transport: 250,
      food: 400,
      loans: 320,
      savings: 500,
      other: 450,
      notes: "Rent assumes a one-bedroom with a roommate option as backup.",
    },
  },
  {
    task: "hired.financial.benefit-choices",
    form: {
      objective: "Choose health plan and 401(k) contribution",
      steps: "Compare the two health plans\nSet 401(k) to the 4% match",
      deadline: "2027-06-30",
      support: "HR benefits team",
    },
  },
  {
    task: "hired.financial.emergency-fund",
    form: {
      objective: "Build a one-month emergency fund",
      steps: "Open a separate savings account\nAuto-transfer $250 each paycheck",
      deadline: "2027-09-30",
      support: "",
    },
  },
  {
    task: "hired.relocation.housing-compare",
    form: {
      optionA: "Midtown one-bedroom apartment",
      costA: 1650,
      optionB: "Decatur shared townhouse",
      costB: 1100,
      commute:
        "Midtown: 10-minute walk to the office. Decatur: 25 minutes on MARTA, quiet and well lit.",
      choice: "Decatur: it saves $550 a month and the train ride is easy.",
    },
  },
  {
    task: "hired.relocation.cost-of-living",
    link: "https://www.numbeo.com/cost-of-living/in/Atlanta",
  },
  {
    task: "hired.relocation.moving-checklist",
    form: {
      objective: "Move to Atlanta two weeks before my start date",
      steps: "Book the truck\nTransfer utilities\nUpdate my address\nPack by room",
      deadline: "2027-05-31",
      support: "My aunt in Marietta",
    },
  },
];

/**
 * Seeds (or resets) Veronica's demo data for an anonymous user. Server-only, secret key:
 * the demo user's own client couldn't set their cohort or demo flag.
 */
export async function seedVeronica(userId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const graduation = addDays(todayInTimeZone(TIME_ZONE), DEMO_DAYS_LEFT);

  // One private cohort per demo user, so the countdown always reads 87 days.
  await admin.from("cohorts").delete().eq("owner_id", userId);
  const { data: cohort, error: cohortError } = await admin
    .from("cohorts")
    .insert({
      name: "Demo · Class of 2027",
      class_year: 2027,
      graduation_date: graduation,
      time_zone: TIME_ZONE,
      is_demo: true,
      owner_id: userId,
    })
    .select("id")
    .single();
  if (cohortError) throw cohortError;

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      ...PROFILE,
      cohort_id: cohort.id,
      is_demo: true,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (profileError) throw profileError;

  const { error: planError } = await admin
    .from("student_plans")
    .upsert({ student_id: userId, pathway_id: "hired" }, { onConflict: "student_id" });
  if (planError) throw planError;

  await admin.from("task_completions").delete().eq("student_id", userId);
  const now = Date.now();
  const { error: completionError } = await admin.from("task_completions").insert(
    COMPLETIONS.map((c, i) => ({
      student_id: userId,
      task_id: c.task,
      pathway_id_at_completion: "hired",
      output_type: c.link ? ("link" as const) : ("form" as const),
      output_url: c.link ?? null,
      output_data: (c.form ?? null) as Json,
      // Spread completions over the last few weeks for a realistic Launch File.
      completed_at: new Date(now - (COMPLETIONS.length - i) * 2 * 86_400_000).toISOString(),
    })),
  );
  if (completionError) throw completionError;

  await seedConnections(admin, userId);
}

/** One accepted and one pending connection with fictional alumni, plus a logged conversation. */
async function seedConnections(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
) {
  await admin.from("connections").delete().eq("student_id", userId);
  const { data: mentors, error } = await admin
    .from("mentor_profiles")
    .select("id, display_name")
    .eq("is_seeded_fictional", true)
    .in("display_name", ["Marcus Bell", "Alicia Moreno"]);
  if (error) throw error;
  const idOf = (name: string) => mentors.find((m) => m.display_name === name)?.id;
  const marcus = idOf("Marcus Bell");
  const alicia = idOf("Alicia Moreno");
  if (!marcus || !alicia) return;

  const day = 86_400_000;
  const { data: rows, error: insertError } = await admin
    .from("connections")
    .insert([
      {
        student_id: userId,
        mentor_id: marcus,
        status: "accepted" as const,
        match_score: 98,
        match_reason: "Also lives in Atlanta, GA · Works at Halcyra Digital · Works in Technology",
        note: "Hi Marcus! I'm starting at Halcyra Digital in June and would love advice on the move.",
        requested_at: new Date(Date.now() - 9 * day).toISOString(),
        responded_at: new Date(Date.now() - 8 * day).toISOString(),
      },
      {
        student_id: userId,
        mentor_id: alicia,
        status: "pending" as const,
        match_score: 88,
        match_reason: "Works at Halcyra Digital · Works in Technology · Mentors Hired students",
        note: "Hi Alicia, I'd love to hear how you moved from program work into engineering.",
        requested_at: new Date(Date.now() - 1 * day).toISOString(),
      },
    ])
    .select("id, mentor_id");
  if (insertError) throw insertError;

  const accepted = rows.find((r) => r.mentor_id === marcus);
  if (accepted)
    await admin.from("mentor_notes").insert({
      connection_id: accepted.id,
      met_on: addDays(todayInTimeZone(TIME_ZONE), -5),
      topic: "Moving to Atlanta",
      notes:
        "Talked through neighborhoods near MARTA and what the first two weeks at Halcyra look like.",
    });

  // Veronica shares her budget with her mentors.
  await admin
    .from("task_completions")
    .update({ shared_with_mentors: true })
    .eq("student_id", userId)
    .eq("task_id", "hired.financial.budget-90");
}
