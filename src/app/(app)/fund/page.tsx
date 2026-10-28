import { HandCoins } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { FundRequestForm } from "@/components/fund/fund-request-form";
import { FundStatusChip, FundTimeline } from "@/components/fund/fund-status";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { type FundCategory, categoryLabel } from "@/content/fund";
import { requirePlan } from "@/lib/auth/session";
import { getMyFundRequests } from "@/lib/data/fund";

export const metadata: Metadata = { title: "Last Mile Fund" };

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

async function FundContent() {
  const { user } = await requirePlan();
  const { requests, open, capCents } = await getMyFundRequests(user.id);
  const capDollars = capCents / 100;
  const past = requests.filter((r) => r.id !== open?.id);

  return (
    <div className="flex flex-col gap-8">
      <header className="bg-area-financial rounded-card p-5">
        <p className="text-caption text-gold-800 flex items-center gap-2 font-bold tracking-wide uppercase">
          <HandCoins aria-hidden="true" className="size-4" /> Last Mile Fund
        </p>
        <h1 className="text-heading-lg text-navy-900 mt-1 font-serif font-bold">
          Small grants for the last mile
        </h1>
        <p className="text-ink-900 mt-2">
          Up to ${capDollars} for a cost that stands between you and a real next step: certification
          fees, background checks, interview travel, deposits or relocation. A small campus team
          reviews every request with the same four questions.
        </p>
      </header>

      {open ? (
        <section aria-labelledby="open-title" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="open-title" className="text-heading-md text-navy-900 font-semibold">
              Your request
            </h2>
            <FundStatusChip status={open.status} />
          </div>
          <div className="rounded-card border bg-white p-4">
            <p className="text-navy-900 font-semibold">
              ${open.amount_cents / 100} · {categoryLabel(open.category as FundCategory)}
            </p>
            <p className="text-body-sm text-ink-600 mt-1">
              For: {open.next_step} · needed by {open.needed_by}
            </p>
            <FundTimeline status={open.status} submittedAt={open.submitted_at} />
          </div>
          {open.status === "needs_info" ? (
            <>
              <div role="status" className="bg-area-wellness rounded-card p-4">
                <p className="text-navy-900 font-semibold">The review team needs a little more.</p>
                {open.reviewer_notes && (
                  <p className="text-ink-900 mt-1">&ldquo;{open.reviewer_notes}&rdquo;</p>
                )}
              </div>
              <FundRequestForm
                capDollars={capDollars}
                initial={{
                  id: open.id,
                  category: open.category,
                  amount: open.amount_cents / 100,
                  nextStep: open.next_step,
                  justification: open.justification,
                  neededBy: open.needed_by,
                }}
              />
            </>
          ) : (
            <p className="text-body-sm text-ink-600">
              You can have one open request at a time. We&apos;ll update this page as soon as the
              team reviews it.
            </p>
          )}
        </section>
      ) : (
        <section aria-labelledby="new-title">
          <h2 id="new-title" className="text-heading-md text-navy-900 mb-4 font-semibold">
            Request a micro-grant
          </h2>
          <FundRequestForm capDollars={capDollars} />
        </section>
      )}

      {past.length > 0 && (
        <section aria-labelledby="past-title">
          <h2 id="past-title" className="text-heading-md text-navy-900 mb-3 font-semibold">
            Past requests
          </h2>
          <ul className="flex flex-col gap-2">
            {past.map((r) => (
              <li key={r.id} className="rounded-card border bg-white px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-navy-900 font-semibold">
                    ${r.amount_cents / 100} · {categoryLabel(r.category as FundCategory)}
                  </span>
                  <FundStatusChip status={r.status} />
                </div>
                <p className="text-ink-600 mt-1">
                  Sent {dateFormat.format(new Date(r.submitted_at))}
                  {r.reviewer_notes ? ` · “${r.reviewer_notes}”` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function FundPage() {
  return (
    <Suspense fallback={<PlanSkeleton />}>
      <FundContent />
    </Suspense>
  );
}
