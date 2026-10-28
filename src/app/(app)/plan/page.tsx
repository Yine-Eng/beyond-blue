import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AreaCard } from "@/components/plan/area-card";
import { CountdownHero } from "@/components/plan/countdown-hero";
import { FocusCard } from "@/components/plan/focus-card";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { getPathway } from "@/content/pathways";
import type { PathwayId } from "@/content/pathways";
import { getPlan } from "@/lib/data/plan";
import { greetingFor } from "@/lib/domain/greeting";

export const metadata: Metadata = { title: "Your plan" };

async function PlanContent({ switched }: { switched: Promise<boolean> }) {
  const plan = await getPlan();
  const name = plan.profile.preferred_name ?? "there";
  const pathway = getPathway(plan.plan.pathway_id as PathwayId);
  const carried = plan.tasks.filter((t) => t.carriedOver).length;
  return (
    <div className="flex flex-col gap-8">
      {(await switched) && (
        <p
          role="status"
          className="bg-success-50 rounded-lg px-4 py-3 text-sm font-semibold text-green-700"
        >
          You&apos;re now on the {pathway.name} pathway. Your finished work is still in your Launch
          File{carried > 0 ? `, and ${carried} steps here already count as done` : ""}.
        </p>
      )}
      <section aria-labelledby="countdown-title">
        <p className="text-ink-600">
          {greetingFor(plan.cohort?.time_zone ?? "America/New_York")}, {name}.
        </p>
        <h1 id="countdown-title" className="sr-only">
          Your 100-day plan
        </h1>
        <CountdownHero
          daysLeft={plan.daysLeft}
          stage={plan.stage}
          completed={plan.completedCount}
          total={plan.tasks.length}
        />
        <p className="text-body-sm text-ink-600 mt-3">
          Pathway: <strong className="text-navy-900">{pathway.name}</strong> ·{" "}
          {pathway.selfDescription} ·{" "}
          <Link href="/switch-pathway" className="font-semibold text-blue-700 underline">
            Switch
          </Link>
        </p>
      </section>

      <section aria-labelledby="focus-title">
        <h2 id="focus-title" className="text-heading-lg text-navy-900 mb-3 font-serif font-bold">
          Your 100-Day Curriculum
        </h2>
        <FocusCard task={plan.focus} />
      </section>

      <section aria-labelledby="areas-title">
        <h2 id="areas-title" className="text-heading-lg text-navy-900 mb-3 font-serif font-bold">
          Readiness areas
        </h2>
        <ul className="flex flex-col gap-3">
          {plan.areas.map((area) => (
            <li key={area.id}>
              <AreaCard area={area} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function PlanPage({ searchParams }: PageProps<"/plan">) {
  const switched = searchParams.then((p) => typeof p.switched === "string");
  return (
    <Suspense fallback={<PlanSkeleton />}>
      <PlanContent switched={switched} />
    </Suspense>
  );
}
