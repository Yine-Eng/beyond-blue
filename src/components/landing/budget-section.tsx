import { BarChart3, Briefcase, UsersRound } from "lucide-react";
import { BUDGET_LINES, BUDGET_TOTAL, budgetNotes, formatUsd } from "@/content/copy/budget";
import { NotebookSection } from "./notebook-section";

const PRIORITY_ICONS = [UsersRound, Briefcase, BarChart3];
const PRIORITY_TONES = ["bg-blue-300", "bg-gold-400", "bg-blue-300"];
// Stacked bar segments (decorative; the table carries the numbers).
const BAR_TONES = [
  "bg-blue-500",
  "bg-navy-900",
  "bg-blue-300",
  "bg-gold-400",
  "bg-green-400",
  "bg-purple-400",
  "bg-pink-300",
  "bg-cream-200",
];

export function BudgetSection() {
  return (
    <NotebookSection id="budget" labelledBy="budget-title">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr]">
        <div className="min-w-0">
          <h2 id="budget-title" className="text-heading-xl text-navy-900 font-serif font-bold">
            {budgetNotes.title[0]} <span className="block">{budgetNotes.title[1]}</span>
          </h2>
          <h3 className="mt-8 font-serif text-lg font-bold tracking-wide text-blue-700 uppercase">
            {budgetNotes.largest.title}
          </h3>
          <p className="mt-2">{budgetNotes.largest.body}</p>
          <h3 className="text-gold-800 mt-8 font-serif text-3xl font-bold">
            {budgetNotes.builtByBluefield.title}
          </h3>
          <p className="mt-2">{budgetNotes.builtByBluefield.body}</p>
          <h3 className="text-navy-900 mt-8 text-sm font-bold tracking-widest uppercase">
            Our priorities:
          </h3>
          <ul className="mt-4 grid grid-cols-3 gap-3 text-center">
            {budgetNotes.priorities.map(({ title, body }, i) => {
              const Icon = PRIORITY_ICONS[i]!;
              return (
                <li key={title} className="flex flex-col items-center gap-2">
                  <span
                    className={`${PRIORITY_TONES[i]} text-navy-900 grid size-14 place-items-center rounded-full`}
                  >
                    <Icon aria-hidden="true" className="size-7" />
                  </span>
                  <span className="text-navy-900 text-sm font-black uppercase">{title}</span>
                  <span className="text-ink-600 text-xs leading-snug">{body}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* min-w-0 lets the table scroll inside its wrapper instead of widening the page. */}
        <div className="min-w-0">
          <div aria-hidden="true" className="mb-4 flex h-4 overflow-hidden rounded-full">
            {BUDGET_LINES.map((line, i) => (
              <span
                key={line.area}
                className={BAR_TONES[i]}
                style={{ width: `${(line.amount / BUDGET_TOTAL) * 100}%` }}
              />
            ))}
          </div>
          <div
            role="region"
            aria-label="Budget table (scrolls sideways on small screens)"
            // Scrollable regions must be keyboard-reachable (WCAG 2.1.1, axe scrollable-region-focusable).
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            className="rounded-card overflow-x-auto border"
          >
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Beyond Blue pilot budget, totalling {formatUsd(BUDGET_TOTAL)}
              </caption>
              <thead className="bg-navy-950 text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 font-serif text-base">
                    Budget Area
                  </th>
                  <th scope="col" className="px-4 py-3 font-serif text-base">
                    What It Funds + Expected Impact
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-serif text-base">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {BUDGET_LINES.map((line, i) => (
                  <tr key={line.area} className={i % 2 ? "bg-blue-100" : "bg-white"}>
                    <th
                      scope="row"
                      className="text-navy-900 px-4 py-3 align-top font-serif font-bold"
                    >
                      {line.area}
                      {line.area === "Student-Built App MVP" && (
                        <span className="text-gold-800 mt-1 block font-sans text-xs font-bold tracking-wide uppercase">
                          Built by Bluefield
                        </span>
                      )}
                    </th>
                    <td className="text-ink-900 px-4 py-3 align-top">{line.funds}</td>
                    <td className="text-navy-900 px-4 py-3 text-right align-top text-base font-black">
                      {formatUsd(line.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-navy-950 text-white">
                <tr>
                  <th
                    scope="row"
                    colSpan={2}
                    className="px-4 py-4 text-right font-serif text-xl tracking-widest uppercase"
                  >
                    Total
                  </th>
                  <td className="px-4 py-4 text-right font-serif text-2xl font-black text-blue-300">
                    {formatUsd(BUDGET_TOTAL)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </NotebookSection>
  );
}
