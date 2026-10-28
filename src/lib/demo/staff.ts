import "server-only";
import { flattenCurriculum } from "@/content/curriculum";
import type { FundCategory, FundStatus } from "@/content/fund";
import { PATHWAYS, type PathwayId } from "@/content/pathways";
import { READINESS_AREAS } from "@/content/readiness-areas";
import { cohortOverview } from "@/lib/domain/cohort";
import type { DayPlus100Insight, StaffDashboard } from "@/lib/data/staff";

/**
 * "View as staff (demo)": a fictional pilot cohort for judges. Nothing here is stored or read
 * from the database. It is generated per demo session (seeded by the session id, so it stays
 * consistent while you click around) and disappears with the session. Every name is invented.
 */

// Mid-program, so the dashboard shows real pace differences (Veronica's own demo is at 87 days).
const DEMO_DAYS_LEFT = 52;
const CAP_CENTS = 25_000;
const BUDGET_CENTS = 250_000;

const FIRST = [
  "Aaliyah",
  "Brandon",
  "Camille",
  "Darius",
  "Elise",
  "Fatima",
  "Gavin",
  "Hana",
  "Isaac",
  "Jada",
  "Kiara",
  "Liam",
  "Marisol",
  "Nadia",
  "Omar",
  "Paige",
  "Quinton",
  "Rosa",
  "Silas",
  "Tamika",
  "Uriel",
  "Vanessa",
  "Wesley",
  "Ximena",
  "Yusuf",
  "Zora",
  "Andre",
  "Bianca",
  "Cedric",
  "Dalia",
];
const LAST = [
  "Ashford",
  "Bellamy",
  "Calder",
  "Dunmore",
  "Ellery",
  "Fairbanks",
  "Garrow",
  "Holloway",
  "Ingram",
  "Jessup",
  "Kettering",
  "Lindell",
  "Marlowe",
  "Northcott",
  "Oakes",
  "Pembrook",
  "Quarles",
  "Redfield",
  "Stanwick",
  "Thorne",
  "Underhill",
  "Vance",
  "Whitlock",
  "Yardley",
];

/** Small, fast, seedable PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seedFrom = (id: string) =>
  [...id].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 2166136261);

const MIX: [PathwayId, number][] = [
  ["hired", 14],
  ["job_search", 16],
  ["higher_ed", 12],
  ["entrepreneurship", 6],
  ["still_deciding", 12],
];

function students(seed: number) {
  const random = rng(seed);
  const tasks = flattenCurriculum();
  const out = [];
  let n = 0;
  for (const [pathwayId, count] of MIX) {
    const own = tasks.filter((t) => t.pathwayId === pathwayId);
    for (let i = 0; i < count; i++, n++) {
      // Most students keep pace; a handful fall behind, a few work ahead.
      const pace = n % 9 === 4 ? 0.25 + random() * 0.15 : 0.7 + random() * 0.4;
      const done = own.filter((t) =>
        t.dueDayOffset >= DEMO_DAYS_LEFT ? random() < Math.min(pace, 0.98) : random() < pace * 0.18,
      );
      out.push({
        id: `demo-student-${n}`,
        name: `${FIRST[n % FIRST.length]} ${LAST[(n * 7) % LAST.length]}`,
        pathwayId,
        daysLeft: DEMO_DAYS_LEFT,
        completedTaskIds: done.map((t) => t.id),
        completedKeys: done.flatMap((t) => (t.equivalenceKey ? [t.equivalenceKey] : [])),
      });
    }
  }
  return { students: out, tasks };
}

export type DemoFundRequest = {
  id: string;
  category: FundCategory;
  amount_cents: number;
  next_step: string;
  justification: string;
  document_path: string | null;
  needed_by: string;
  status: FundStatus;
  rubric: Record<string, boolean> | null;
  reviewer_notes: string | null;
  submitted_at: string;
  decided_at: string | null;
  updated_at: string;
  student: {
    preferred_name: string;
    full_name: string;
    is_demo: boolean;
    major: string;
    target_city: string;
    class_year: number;
  };
};

const REQUESTS: [FundCategory, number, string, string, FundStatus, number][] = [
  [
    "certification_fee",
    175,
    "Sit the CompTIA Security+ exam before my start date",
    "My offer depends on passing the exam within 60 days of starting, and the voucher costs more than I have left after rent.",
    "submitted",
    1,
  ],
  [
    "interview_travel",
    90,
    "Final-round interview in Charlotte",
    "The employer covers the hotel but not travel, and the bus leaves before my campus job pays out.",
    "submitted",
    2,
  ],
  [
    "deposit",
    250,
    "Sign the lease for my first apartment in Atlanta",
    "The security deposit is due two weeks before my first paycheck. I've covered first month's rent myself.",
    "in_review",
    4,
  ],
  [
    "background_check",
    60,
    "Complete the background check for my teaching placement",
    "The district requires fingerprinting before the start date, and the fee isn't reimbursed until after I start.",
    "needs_info",
    6,
  ],
  [
    "relocation",
    220,
    "Rent a moving truck to Columbus",
    "I'm moving for a graduate assistantship and the department doesn't cover relocation for master's students.",
    "approved",
    9,
  ],
  [
    "certification_fee",
    125,
    "Register for the state nursing exam (NCLEX)",
    "My job offer is contingent on the license, and the registration fee is due this month.",
    "approved",
    12,
  ],
  [
    "other",
    80,
    "Buy interview clothes for career fair week",
    "I have three employer interviews lined up and don't own a suit. Career Services suggested I apply.",
    "declined",
    14,
  ],
  [
    "interview_travel",
    140,
    "Fly to a funded PhD visit day",
    "The program reimburses travel after the visit, but I can't front the airfare.",
    "submitted",
    0,
  ],
];

export function demoFundRequests(sessionId: string): DemoFundRequest[] {
  const random = rng(seedFrom(sessionId) ^ 0x5eed);
  const day = 86_400_000;
  return REQUESTS.map(([category, dollars, next_step, justification, status, ageDays], i) => {
    const n = Math.floor(random() * 1000);
    const submitted = new Date(Date.now() - (ageDays + random()) * day).toISOString();
    const decided = status === "approved" || status === "declined";
    return {
      id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      category,
      amount_cents: dollars * 100,
      next_step,
      justification,
      document_path: null,
      needed_by: new Date(Date.now() + (10 + i * 3) * day).toISOString().slice(0, 10),
      status,
      rubric:
        decided || status === "needs_info"
          ? {
              next_step: true,
              documented: status !== "needs_info",
              within_cap: true,
              no_other_source: status !== "declined",
            }
          : null,
      reviewer_notes:
        status === "approved"
          ? "Verified the quote. Paid through the student account."
          : status === "declined"
            ? "Career Services' clothing closet covers this. We've booked you a fitting."
            : status === "needs_info"
              ? "Please upload the district's fee notice."
              : null,
      submitted_at: submitted,
      decided_at: decided ? new Date(Date.parse(submitted) + 2 * day).toISOString() : null,
      updated_at: submitted,
      student: {
        preferred_name: FIRST[(n + i) % FIRST.length]!,
        full_name: `${FIRST[(n + i) % FIRST.length]} ${LAST[(n * 3 + i) % LAST.length]}`,
        is_demo: true,
        major: ["Computer Science", "Nursing", "Education", "Business", "Engineering Technology"][
          i % 5
        ]!,
        target_city: ["Atlanta, GA", "Charlotte, NC", "Columbus, OH", "Bluefield, WV"][i % 4]!,
        class_year: 2027,
      },
    };
  });
}

export function demoFundBalance(sessionId: string) {
  const approved = demoFundRequests(sessionId)
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.amount_cents, 0);
  return {
    total_cents: BUDGET_CENTS,
    approved_cents: approved,
    remaining_cents: BUDGET_CENTS - approved,
    request_cap_cents: CAP_CENTS,
  };
}

/** Last year's (fictional) Day +100 results. Entrepreneurship has 4 responses, so it's hidden. */
const INSIGHTS: [PathwayId | null, number, number[], number, number[], number][] = [
  // pathway, responses, [employed, enrolled, self-employed, searching, other], usefulness, [less, same, more] %, mentor %
  [null, 41, [19, 9, 3, 8, 2], 4.2, [68, 22, 10], 37],
  ["hired", 11, [10, 0, 0, 1, 0], 4.5, [82, 18, 0], 45],
  ["job_search", 12, [6, 1, 0, 4, 1], 3.9, [58, 25, 17], 33],
  ["higher_ed", 8, [1, 7, 0, 0, 0], 4.3, [63, 25, 12], 38],
  ["entrepreneurship", 4, [0, 0, 0, 0, 0], 0, [0, 0, 0], 0],
  ["still_deciding", 6, [2, 1, 0, 2, 1], 4.0, [67, 17, 16], 33],
];

function demoInsights(): DayPlus100Insight[] {
  return INSIGHTS.map(([pathwayId, responses, o, usefulness, stress, mentor]) => {
    const suppressed = responses < 5;
    return {
      pathwayId,
      responses,
      suppressed,
      outcomes: suppressed
        ? null
        : { employed: o[0]!, enrolled: o[1]!, selfEmployed: o[2]!, searching: o[3]!, other: o[4]! },
      avgUsefulness: suppressed ? null : usefulness,
      lessStressedPct: suppressed ? null : stress[0]!,
      sameStressPct: suppressed ? null : stress[1]!,
      moreStressedPct: suppressed ? null : stress[2]!,
      mentorPct: suppressed ? null : mentor,
      sessionPct: suppressed ? null : Math.round(mentor * 0.6),
      givePct: suppressed ? null : Math.round(mentor * 0.4),
    };
  });
}

export function demoStaffDashboard(sessionId: string): StaffDashboard {
  const { students: cohort, tasks } = students(seedFrom(sessionId));
  const overview = cohortOverview(
    cohort,
    tasks.map((t) => ({
      id: t.id,
      pathwayId: t.pathwayId,
      areaId: t.areaId,
      dueDayOffset: t.dueDayOffset,
      equivalenceKey: t.equivalenceKey ?? null,
    })),
    PATHWAYS.map((p) => p.id),
    READINESS_AREAS.map((a) => a.id),
  );
  const requests = demoFundRequests(sessionId);
  const byStatus: Record<FundStatus, number> = {
    submitted: 0,
    in_review: 0,
    needs_info: 0,
    approved: 0,
    declined: 0,
  };
  for (const r of requests) byStatus[r.status] += 1;
  const balance = demoFundBalance(sessionId);
  return {
    overview,
    cohorts: [`Demo pilot · Class of 2027 (fictional) · ${DEMO_DAYS_LEFT} days to graduation`],
    fund: {
      byStatus,
      remainingCents: balance.remaining_cents,
      approvedCents: balance.approved_cents,
      totalCents: balance.total_cents,
    },
    insights: demoInsights(),
  };
}
