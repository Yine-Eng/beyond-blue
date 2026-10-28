import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FundStatusChip } from "@/components/fund/fund-status";
import { FundDecisionForm } from "@/components/staff/fund-decision-form";
import { categoryLabel } from "@/content/fund";
import { getFundRequestForReview } from "@/lib/data/fund";

export const metadata: Metadata = { title: "Review request" };

const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;

export default async function FundReviewPage({ params }: PageProps<"/staff/fund/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const review = await getFundRequestForReview(id);
  if (!review) notFound();
  const { request: r, documentUrl, balance } = review;
  const open = r.status !== "approved" && r.status !== "declined";
  const student = r.student;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/staff/fund"
        className="inline-flex min-h-11 items-center gap-1 font-semibold text-blue-700"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to the queue
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-heading-lg text-navy-900 font-serif font-bold">
            {money(r.amount_cents)} · {categoryLabel(r.category)}
          </h1>
          <p className="text-ink-600 mt-1">
            {student?.full_name || student?.preferred_name || "Student"}
            {student?.class_year ? ` · Class of ${student.class_year}` : ""}
            {student?.major ? ` · ${student.major}` : ""}
            {student?.target_city ? ` · headed to ${student.target_city}` : ""}
          </p>
        </div>
        <FundStatusChip status={r.status} />
      </header>

      <dl className="rounded-card grid gap-4 border bg-white p-5 sm:grid-cols-2">
        <div>
          <dt className="text-caption text-ink-600 font-semibold uppercase">
            Next step it unlocks
          </dt>
          <dd className="text-navy-900 mt-1 font-semibold">{r.next_step}</dd>
        </div>
        <div>
          <dt className="text-caption text-ink-600 font-semibold uppercase">Needed by</dt>
          <dd className="text-navy-900 mt-1 font-semibold">{r.needed_by}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-caption text-ink-600 font-semibold uppercase">Why</dt>
          <dd className="text-ink-900 mt-1 whitespace-pre-line">{r.justification}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-caption text-ink-600 font-semibold uppercase">Document</dt>
          <dd className="mt-1">
            {documentUrl ? (
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-blue-700 underline underline-offset-4"
              >
                Open the supporting document <ExternalLink aria-hidden="true" className="size-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <span className="text-ink-600">None attached</span>
            )}
          </dd>
        </div>
        {r.reviewer_notes && (
          <div className="sm:col-span-2">
            <dt className="text-caption text-ink-600 font-semibold uppercase">Last note</dt>
            <dd className="text-ink-900 mt-1">{r.reviewer_notes}</dd>
          </div>
        )}
      </dl>

      <p className="text-body-sm text-ink-600">
        Fund balance: <strong className="text-navy-900">{money(balance.remaining_cents)}</strong>{" "}
        remaining of {money(balance.total_cents)}.
      </p>

      {open ? (
        <FundDecisionForm
          id={r.id}
          initialRubric={(r.rubric as Record<string, boolean> | null) ?? null}
        />
      ) : (
        <p className="rounded-card bg-cream-50 px-4 py-3 text-sm">
          This request has been decided. Every decision is recorded in the audit log.
        </p>
      )}
    </div>
  );
}
