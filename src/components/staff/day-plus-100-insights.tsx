import { getPathway } from "@/content/pathways";
import type { DayPlus100Insight } from "@/lib/data/staff";

const pct = (v: number | null) => (v === null ? "—" : `${v}%`);
const share = (n: number, total: number) => `${n} (${Math.round((n / total) * 100)}%)`;

/**
 * Day +100 outcomes as counts and percentages only (PRD US-D100-2). Groups under five responses
 * are suppressed by the database, and free-text answers are never shown here.
 */
export function DayPlus100Insights({ insights }: { insights: DayPlus100Insight[] }) {
  const overall = insights.find((i) => i.pathwayId === null);
  if (!overall || overall.responses === 0)
    return (
      <p className="rounded-card border border-dashed bg-white px-4 py-5 text-sm">
        No Day +100 check-ins yet. Graduates are invited from Day +90 to Day +130.
      </p>
    );
  const rows = [overall, ...insights.filter((i) => i.pathwayId !== null)];
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-card overflow-x-auto border bg-white">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <caption className="sr-only">
            Day +100 check-in results by pathway, as counts and percentages
          </caption>
          <thead>
            <tr className="text-ink-600 text-left">
              {[
                "Pathway",
                "Responses",
                "Working",
                "In school",
                "Own business",
                "Searching",
                "Usefulness (1–5)",
                "Less stressed",
                "Will mentor",
              ].map((h) => (
                <th key={h} scope="col" className="p-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.pathwayId ?? "all"} className="border-t">
                <th scope="row" className="text-navy-900 p-3 text-left font-semibold">
                  {r.pathwayId ? getPathway(r.pathwayId).name : "All graduates"}
                </th>
                <td className="p-3">{r.responses}</td>
                {r.suppressed || !r.outcomes ? (
                  <td colSpan={7} className="text-ink-600 p-3">
                    Fewer than 5 responses: hidden to protect anonymity
                  </td>
                ) : (
                  <>
                    <td className="p-3">{share(r.outcomes.employed, r.responses)}</td>
                    <td className="p-3">{share(r.outcomes.enrolled, r.responses)}</td>
                    <td className="p-3">{share(r.outcomes.selfEmployed, r.responses)}</td>
                    <td className="p-3">{share(r.outcomes.searching, r.responses)}</td>
                    <td className="p-3">{r.avgUsefulness ?? "—"}</td>
                    <td className="p-3">{pct(r.lessStressedPct)}</td>
                    <td className="p-3">{pct(r.mentorPct)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-ink-600 text-xs">
        Less stressed = feels less stressed about what&apos;s next than on graduation day. Groups
        under five responses are hidden.
      </p>
    </div>
  );
}
