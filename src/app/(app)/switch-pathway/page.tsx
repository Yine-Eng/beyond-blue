import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SwitchPathwayForm } from "@/components/pathway/switch-pathway-form";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { type PathwayId, getPathway } from "@/content/pathways";
import { getSwitchPreview } from "@/lib/data/pathway";

export const metadata: Metadata = { title: "Switch pathway" };

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

async function SwitchContent() {
  const { current, previews, history } = await getSwitchPreview();
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-heading-lg text-navy-900 font-serif font-bold">Switch pathway</h1>
        <p className="text-ink-900 mt-2">
          Plans change. You&apos;re on <strong>{getPathway(current).name}</strong> right now. Pick a
          new pathway and your remaining steps re-map to it. Every output you&apos;ve finished stays
          in your Launch File, so there&apos;s no restart.
        </p>
      </header>

      <SwitchPathwayForm current={current} previews={previews} />

      {history.length > 0 && (
        <section aria-labelledby="history-title">
          <h2 id="history-title" className="text-heading-md text-navy-900 mb-3 font-semibold">
            Your pathway history
          </h2>
          <ol className="flex flex-col gap-2">
            {history.map((h) => (
              <li key={h.id} className="rounded-card border bg-white px-4 py-3 text-sm">
                <span className="text-navy-900 font-semibold">
                  {getPathway(h.from_pathway_id as PathwayId).name} →{" "}
                  {getPathway(h.to_pathway_id as PathwayId).name}
                </span>
                <span className="text-ink-600">
                  {" "}
                  · {dateFormat.format(new Date(h.changed_at))} · kept {h.completed_kept} outputs
                </span>
                {h.reason && <p className="text-ink-600 mt-1">“{h.reason}”</p>}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

export default function SwitchPathwayPage() {
  return (
    <div>
      <Link
        href="/profile"
        className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-blue-700"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to profile
      </Link>
      <Suspense fallback={<PlanSkeleton />}>
        <SwitchContent />
      </Suspense>
    </div>
  );
}
