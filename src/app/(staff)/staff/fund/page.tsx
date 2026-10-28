import type { Metadata } from "next";
import Link from "next/link";
import { FundStatusChip } from "@/components/fund/fund-status";
import {
  FUND_CATEGORIES,
  FUND_STATUS,
  type FundCategory,
  type FundStatus,
  categoryLabel,
} from "@/content/fund";
import { getFundQueue } from "@/lib/data/fund";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Fund review" };

const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

const isStatus = (v: unknown): v is FundStatus => typeof v === "string" && v in FUND_STATUS;
const isCategory = (v: unknown): v is FundCategory => FUND_CATEGORIES.some((c) => c.id === v);

export default async function FundQueuePage({ searchParams }: PageProps<"/staff/fund">) {
  const params = await searchParams;
  const status = isStatus(params.status) ? params.status : undefined;
  const category = isCategory(params.category) ? params.category : undefined;
  const { requests, balance } = await getFundQueue({ status, category });

  const filterHref = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { status, category, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const qs = next.toString();
    return qs ? `/staff/fund?${qs}` : "/staff/fund";
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-heading-lg text-navy-900 font-serif font-bold">
          Last Mile Fund review
        </h1>
        <p className="text-ink-600 mt-1">
          Oldest first. Every request is reviewed against the same four-item rubric.
        </p>
      </header>

      <dl className="grid grid-cols-3 gap-3">
        {[
          ["Remaining", money(balance.remaining_cents)],
          ["Approved", money(balance.approved_cents)],
          ["Per-request cap", money(balance.request_cap_cents)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-card border bg-white p-4">
            <dt className="text-caption text-ink-600 font-semibold tracking-wide uppercase">
              {label}
            </dt>
            <dd className="text-navy-900 mt-1 font-serif text-2xl font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {[undefined, ...Object.keys(FUND_STATUS)].map((s) => (
          <Link
            key={s ?? "all"}
            href={filterHref({ status: s })}
            aria-current={status === s ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-semibold",
              status === s ? "bg-navy-900 text-cream-50 border-navy-900" : "text-navy-900 bg-white",
            )}
          >
            {s ? FUND_STATUS[s as FundStatus].label : "All statuses"}
          </Link>
        ))}
      </nav>
      <nav aria-label="Filter by category" className="flex flex-wrap gap-2">
        {[undefined, ...FUND_CATEGORIES.map((c) => c.id)].map((c) => (
          <Link
            key={c ?? "all"}
            href={filterHref({ category: c })}
            aria-current={category === c ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              category === c
                ? "bg-navy-900 text-cream-50 border-navy-900"
                : "text-navy-900 bg-white",
            )}
          >
            {c ? categoryLabel(c) : "All categories"}
          </Link>
        ))}
      </nav>

      {requests.length === 0 ? (
        <p className="rounded-card text-ink-600 border border-dashed bg-white px-4 py-8 text-center">
          No requests match these filters.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {requests.map((r) => (
            <li key={r.id}>
              <Link
                href={`/staff/fund/${r.id}`}
                className="rounded-card hover:border-navy-900 flex flex-wrap items-center gap-x-4 gap-y-1 border bg-white px-4 py-3"
              >
                <span className="text-navy-900 min-w-24 font-serif text-lg font-bold">
                  {money(r.amount_cents)}
                </span>
                <span className="flex-1">
                  <span className="text-navy-900 block font-semibold">
                    {r.student?.full_name || r.student?.preferred_name || "Student"} ·{" "}
                    {categoryLabel(r.category)}
                  </span>
                  <span className="text-ink-600 block text-sm">
                    {r.next_step} · sent {dateFormat.format(new Date(r.submitted_at))} · needed by{" "}
                    {r.needed_by}
                  </span>
                </span>
                <FundStatusChip status={r.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
