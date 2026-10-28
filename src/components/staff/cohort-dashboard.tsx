import { AlertTriangle, ArrowRight, HandCoins } from "lucide-react";
import Link from "next/link";
import { FUND_STATUS, type FundStatus } from "@/content/fund";
import { type PathwayId, getPathway } from "@/content/pathways";
import { READINESS_AREAS } from "@/content/readiness-areas";
import type { FundSummary } from "@/lib/data/staff";
import type { CohortOverview, Ratio } from "@/lib/domain/cohort";
import { palette, pathwayColors } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;

/** Sequential single-hue ramp (light → dark blue); navy text passes AA on every step. */
const HEAT = [
  { min: 0, className: "bg-white", label: "0–24%" },
  { min: 25, className: "bg-area-career", label: "25–49%" },
  { min: 50, className: "bg-blue-100", label: "50–74%" },
  { min: 75, className: "bg-blue-200", label: "75–100%" },
] as const;
const heat = (pct: number) => [...HEAT].reverse().find((h) => pct >= h.min)!;

export function KpiTiles({ overview, fund }: { overview: CohortOverview; fund: FundSummary }) {
  const open = fund.byStatus.submitted + fund.byStatus.in_review + fund.byStatus.needs_info;
  const tiles = [
    ["Students", String(overview.students)],
    ["Average progress", `${overview.overall.pct}%`],
    ["At risk", String(overview.atRisk.length)],
    ["Open fund requests", String(open)],
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map(([label, value]) => (
        <div key={label} className="rounded-card border bg-white p-4">
          <dt className="text-caption text-ink-600 font-semibold tracking-wide uppercase">
            {label}
          </dt>
          <dd className="text-navy-900 mt-1 font-serif text-3xl font-bold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Bar({ ratio, color }: { ratio: Ratio; color: string }) {
  return (
    <div className="bg-cream-200 h-2.5 w-full overflow-hidden rounded-full" aria-hidden="true">
      <div className="h-full rounded-full" style={{ width: `${ratio.pct}%`, background: color }} />
    </div>
  );
}

export function PathwayProgress({ overview }: { overview: CohortOverview }) {
  if (overview.byPathway.length === 0)
    return <p className="text-ink-600">No students have a plan yet.</p>;
  return (
    <ul className="flex flex-col gap-4">
      {overview.byPathway.map((p) => (
        <li key={p.pathwayId}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-navy-900 font-semibold">{getPathway(p.pathwayId).name}</span>
            <span className="text-ink-600">
              <strong className="text-navy-900">{p.pct}%</strong> · {p.students}{" "}
              {p.students === 1 ? "student" : "students"}
            </span>
          </div>
          <Bar ratio={p} color={palette[pathwayColors[p.pathwayId].fill]} />
        </li>
      ))}
    </ul>
  );
}

export function AreaHeatmap({ overview }: { overview: CohortOverview }) {
  if (overview.grid.length === 0) return null;
  const pathways = overview.byPathway.map((p) => p.pathwayId);
  const cell = (p: PathwayId, a: string) =>
    overview.grid.find((g) => g.pathwayId === p && g.areaId === a)!.ratio;
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-card overflow-x-auto border bg-white">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <caption className="sr-only">
            Share of steps completed, by pathway and readiness area
          </caption>
          <thead>
            <tr className="text-ink-600 text-left">
              <th scope="col" className="p-3 font-semibold">
                Pathway
              </th>
              {READINESS_AREAS.map((a) => (
                <th key={a.id} scope="col" className="p-3 font-semibold">
                  {a.name.replace(" Readiness", "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pathways.map((p) => (
              <tr key={p} className="border-t">
                <th scope="row" className="text-navy-900 p-3 text-left font-semibold">
                  {getPathway(p).name}
                </th>
                {READINESS_AREAS.map((a) => {
                  const r = cell(p, a.id);
                  return (
                    <td
                      key={a.id}
                      className={cn("border-l-2 border-white p-3", heat(r.pct).className)}
                    >
                      <span className="text-navy-900 font-semibold">{r.pct}%</span>
                      <span className="text-ink-600 block text-xs">
                        {r.completed} of {r.total}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="text-ink-600 flex flex-wrap gap-3 text-xs" aria-label="Legend">
        {HEAT.map((h) => (
          <li key={h.label} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("size-3.5 rounded-sm border", h.className)} />
            {h.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AtRiskList({ overview }: { overview: CohortOverview }) {
  if (overview.atRisk.length === 0)
    return (
      <p className="rounded-card bg-success-50 px-4 py-3 text-sm font-semibold text-green-700">
        No one is behind the countdown right now.
      </p>
    );
  return (
    <ul className="flex flex-col gap-2">
      {overview.atRisk.map((s) => (
        <li
          key={s.id}
          className="rounded-card flex flex-wrap items-center gap-x-4 gap-y-1 border bg-white px-4 py-3"
        >
          <span className="min-w-[11rem] flex-1">
            <span className="text-navy-900 block font-semibold">{s.name}</span>
            <span className="text-ink-600 block text-sm">
              {getPathway(s.pathwayId).name} · {s.completed} steps done ·{" "}
              {s.daysLeft >= 0 ? `${s.daysLeft} days to graduation` : "graduated"}
            </span>
          </span>
          <span className="bg-area-wellness inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-pink-700">
            <AlertTriangle aria-hidden="true" className="size-3.5" />
            {s.behindBy} steps behind
          </span>
        </li>
      ))}
    </ul>
  );
}

export function FundSummaryCard({ fund }: { fund: FundSummary }) {
  const statuses = Object.keys(FUND_STATUS) as FundStatus[];
  return (
    <div className="rounded-card flex flex-col gap-4 border bg-white p-5">
      <p className="text-navy-900 flex items-center gap-2 font-semibold">
        <HandCoins aria-hidden="true" className="size-5" /> {money(fund.remainingCents)} left of{" "}
        {money(fund.totalCents)}
      </p>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
        {statuses.map((s) => (
          <div key={s} className="bg-cream-50 rounded-lg px-3 py-2">
            <dt className="text-ink-600">{FUND_STATUS[s].label}</dt>
            <dd className="text-navy-900 text-lg font-bold">{fund.byStatus[s]}</dd>
          </div>
        ))}
      </dl>
      <Link
        href="/staff/fund"
        className="inline-flex min-h-11 items-center gap-1 self-start font-semibold text-blue-700 underline underline-offset-4"
      >
        Open the fund review queue <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </div>
  );
}
