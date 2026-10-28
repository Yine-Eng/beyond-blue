import "server-only";
import { connection } from "next/server";
import { PATHWAYS, type PathwayId } from "@/content/pathways";
import { READINESS_AREAS } from "@/content/readiness-areas";
import { getFundBalance, requireStaff } from "@/lib/data/fund";
import { type CohortOverview, cohortOverview } from "@/lib/domain/cohort";
import { daysToGraduation } from "@/lib/domain/countdown";
import type { AreaId } from "@/lib/design/tokens";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FundStatus } from "@/content/fund";

const PAGE = 1000;

/** PostgREST returns at most 1,000 rows per request; page through larger tables. */
async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

export type FundSummary = {
  byStatus: Record<FundStatus, number>;
  remainingCents: number;
  approvedCents: number;
  totalCents: number;
};

export type DayPlus100Insight = {
  pathwayId: PathwayId | null;
  responses: number;
  suppressed: boolean;
  outcomes: {
    employed: number;
    enrolled: number;
    selfEmployed: number;
    searching: number;
    other: number;
  } | null;
  avgUsefulness: number | null;
  lessStressedPct: number | null;
  sameStressPct: number | null;
  moreStressedPct: number | null;
  mentorPct: number | null;
  sessionPct: number | null;
  givePct: number | null;
};

export type StaffDashboard = {
  overview: CohortOverview;
  cohorts: string[];
  fund: FundSummary;
  insights: DayPlus100Insight[];
};

/**
 * Staff dashboard data, read through the staff RLS policies that already exist (staff read
 * profiles, plans, completions and cohorts). Demo sessions and non-students are left out.
 */
export async function getStaffDashboard(): Promise<StaffDashboard> {
  await connection();
  await requireStaff();
  const supabase = await createSupabaseServerClient();

  const [students, tasks, fundRows, balance, insightsRes] = await Promise.all([
    fetchAll((from, to) =>
      supabase
        .from("profiles")
        .select(
          "id, preferred_name, full_name, plan:student_plans!inner(pathway_id), cohort:cohorts!inner(name, graduation_date, time_zone, is_demo)",
        )
        .eq("role", "student")
        .eq("is_demo", false)
        .eq("cohort.is_demo", false)
        .order("id")
        .range(from, to),
    ),
    fetchAll((from, to) =>
      supabase
        .from("tasks")
        .select("id, pathway_id, area_id, due_day_offset, equivalence_key")
        .order("id")
        .range(from, to),
    ),
    fetchAll((from, to) =>
      supabase
        .from("fund_requests")
        .select("status, student:profiles!fund_requests_student_id_fkey!inner(is_demo)")
        .eq("student.is_demo", false)
        .order("id")
        .range(from, to),
    ),
    getFundBalance(),
    supabase.rpc("day_plus_100_insights"),
  ]);
  if (insightsRes.error) throw insightsRes.error;

  const ids = students.map((s) => s.id);
  const completions = ids.length
    ? await fetchAll((from, to) =>
        supabase
          .from("task_completions")
          .select("student_id, task_id, task:tasks(equivalence_key)")
          .in("student_id", ids)
          .order("id")
          .range(from, to),
      )
    : [];
  const doneBy = new Map<string, { ids: string[]; keys: string[] }>();
  for (const c of completions) {
    const entry = doneBy.get(c.student_id) ?? { ids: [], keys: [] };
    entry.ids.push(c.task_id);
    if (c.task?.equivalence_key) entry.keys.push(c.task.equivalence_key);
    doneBy.set(c.student_id, entry);
  }

  const overview = cohortOverview(
    students.flatMap((s) => {
      const plan = Array.isArray(s.plan) ? s.plan[0] : s.plan;
      if (!plan || !s.cohort) return [];
      return [
        {
          id: s.id,
          name: s.full_name || s.preferred_name || "Student",
          pathwayId: plan.pathway_id as PathwayId,
          daysLeft: daysToGraduation(s.cohort.graduation_date, s.cohort.time_zone),
          completedTaskIds: doneBy.get(s.id)?.ids ?? [],
          completedKeys: doneBy.get(s.id)?.keys ?? [],
        },
      ];
    }),
    tasks.map((t) => ({
      id: t.id,
      pathwayId: t.pathway_id as PathwayId,
      areaId: t.area_id as AreaId,
      dueDayOffset: t.due_day_offset,
      equivalenceKey: t.equivalence_key,
    })),
    PATHWAYS.map((p) => p.id),
    READINESS_AREAS.map((a) => a.id),
  );

  const byStatus: Record<FundStatus, number> = {
    submitted: 0,
    in_review: 0,
    needs_info: 0,
    approved: 0,
    declined: 0,
  };
  for (const r of fundRows) byStatus[r.status] += 1;

  const insights: DayPlus100Insight[] = insightsRes.data.map((r) => ({
    pathwayId: r.pathway_id as PathwayId | null,
    responses: r.responses,
    suppressed: r.suppressed,
    outcomes: r.suppressed
      ? null
      : {
          employed: r.employed ?? 0,
          enrolled: r.enrolled ?? 0,
          selfEmployed: r.self_employed ?? 0,
          searching: r.searching ?? 0,
          other: r.other ?? 0,
        },
    avgUsefulness: r.avg_usefulness,
    lessStressedPct: r.less_stressed_pct,
    sameStressPct: r.same_stress_pct,
    moreStressedPct: r.more_stressed_pct,
    mentorPct: r.mentor_pct,
    sessionPct: r.session_pct,
    givePct: r.give_pct,
  }));

  return {
    insights,
    overview,
    cohorts: [...new Set(students.map((s) => s.cohort?.name).filter((n): n is string => !!n))],
    fund: {
      byStatus,
      remainingCents: balance.remaining_cents,
      approvedCents: balance.approved_cents,
      totalCents: balance.total_cents,
    },
  };
}
