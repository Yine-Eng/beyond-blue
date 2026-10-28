import type { Metadata } from "next";
import {
  AreaHeatmap,
  AtRiskList,
  FundSummaryCard,
  KpiTiles,
  PathwayProgress,
} from "@/components/staff/cohort-dashboard";
import { getStaffDashboard } from "@/lib/data/staff";

export const metadata: Metadata = { title: "Staff dashboard" };

/** Program overview for Career Services and Student Success (PRD US-STAFF-1/2). */
export default async function StaffDashboardPage() {
  const { overview, cohorts, fund } = await getStaffDashboard();
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-heading-lg text-navy-900 font-serif font-bold">Cohort dashboard</h1>
        <p className="text-ink-600 mt-1">
          {cohorts.length ? cohorts.join(" · ") : "No cohorts yet"} · progress counts finished
          outputs, not attendance.
        </p>
      </header>

      <KpiTiles overview={overview} fund={fund} />

      <section aria-labelledby="pathways-title">
        <h2 id="pathways-title" className="text-heading-md text-navy-900 mb-3 font-semibold">
          Progress by pathway
        </h2>
        <PathwayProgress overview={overview} />
      </section>

      <section aria-labelledby="areas-title">
        <h2 id="areas-title" className="text-heading-md text-navy-900 mb-3 font-semibold">
          Pathway × readiness area
        </h2>
        <AreaHeatmap overview={overview} />
      </section>

      <section aria-labelledby="risk-title">
        <h2 id="risk-title" className="text-heading-md text-navy-900 mb-1 font-semibold">
          At risk
        </h2>
        <p className="text-body-sm text-ink-600 mb-3">
          Students five or more steps behind what&apos;s due by today. A nudge from Career Services
          or Student Success helps most here.
        </p>
        <AtRiskList overview={overview} />
      </section>

      <section aria-labelledby="fund-title">
        <h2 id="fund-title" className="text-heading-md text-navy-900 mb-3 font-semibold">
          Last Mile Fund
        </h2>
        <FundSummaryCard fund={fund} />
      </section>
    </div>
  );
}
