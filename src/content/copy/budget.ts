/** "Financial Plan & Detailed Budget" (deck slide 10). Amounts in whole dollars. */
export const BUDGET_LINES = [
  {
    area: "Student-Built App MVP",
    funds:
      "Paid stipends for Bluefield State CS students to build, test, and document the MVP, creating applied-learning experience while giving Beyond Blue a campus-owned digital tool.",
    amount: 2000,
  },
  {
    area: "App Infrastructure + Publishing",
    funds:
      "Hosting, domain, platform, and publishing costs needed to keep the app accessible and usable beyond the pilot year.",
    amount: 250,
  },
  {
    area: "Career Test Drives + Transition Experiences",
    funds:
      "Employer visits, job shadowing, graduate-school exposure, entrepreneurship experiences, and transportation that allows students to test real next-step options before graduation.",
    amount: 2000,
  },
  {
    area: "Last Mile Fund",
    funds:
      "Verified transition expenses such as certifications, background checks, interview travel fund, deposits, and relocation needs, removing small financial barriers that could block a real opportunity.",
    amount: 2500,
  },
  {
    area: "Five Core Sessions",
    funds:
      "Materials, logistics, refreshments, guest travel, and limited outside-expert support that make the five readiness areas practical and action-based.",
    amount: 1250,
  },
  {
    area: "Alumni + Mentor Activation",
    funds:
      "Mentor onboarding, alumni recruitment, matching support, and engagement that expand each student's network and strengthen future cohorts.",
    amount: 750,
  },
  {
    area: "Day +100 Assessment + Program Materials",
    funds: "Feedback collection, evaluation, reporting, and updates for the next graduating class.",
    amount: 500,
  },
  {
    area: "Pilot Contingency",
    funds:
      "Reserve for unexpected first-year rollout needs so the pilot can adapt without cutting core student support.",
    amount: 750,
  },
] as const;

export const BUDGET_TOTAL = 10_000;

export const budgetNotes = {
  title: ["Financial Plan", "& Detailed Budget"],
  largest: {
    title: "Largest investment: Last Mile Fund",
    body: "Preparation only matters if students can act on the opportunities in front of them. The fund removes small, verified financial barriers that could otherwise stop a student's next step.",
  },
  builtByBluefield: {
    title: "Built by Bluefield",
    body: "By keeping MVP development on campus, Beyond Blue creates a paid applied-learning opportunity for Computer Science students while reducing the need for outside development.",
  },
  priorities: [
    { title: "Access", body: "Remove barriers and create opportunities" },
    { title: "Experience", body: "Turn preparation into real-world exposure" },
    { title: "Infrastructure", body: "Build sustainable systems for future classes" },
  ],
} as const;

export const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
