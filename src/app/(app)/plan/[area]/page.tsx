import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AREA_META } from "@/components/plan/area-meta";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { StatusChip } from "@/components/plan/status-chip";
import { TaskRow } from "@/components/plan/task-row";
import { READINESS_AREAS } from "@/content/readiness-areas";
import { getPlan } from "@/lib/data/plan";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return READINESS_AREAS.map((area) => ({ area: area.id }));
}

export async function generateMetadata({ params }: PageProps<"/plan/[area]">): Promise<Metadata> {
  const { area } = await params;
  return { title: READINESS_AREAS.find((a) => a.id === area)?.name ?? "Readiness area" };
}

async function AreaContent({ areaId }: { areaId: string }) {
  const plan = await getPlan();
  const area = plan.areas.find((a) => a.id === areaId);
  if (!area) notFound();
  const meta = AREA_META[area.id];
  const Icon = meta.icon;
  return (
    <>
      <header className={cn("rounded-card p-5", meta.tint)}>
        <div className="flex items-center gap-3">
          <Icon aria-hidden="true" className={cn("size-7", meta.ink)} />
          <h1 className="text-heading-lg text-navy-900 font-serif font-bold">{area.name}</h1>
        </div>
        <p className="text-ink-600 mt-2">
          Day {area.milestoneDay} milestone · {meta.blurb}
        </p>
        <p className="text-body-sm text-navy-900 mt-3 flex items-center gap-2 font-semibold">
          {area.progress.completed} of {area.progress.total} complete{" "}
          <StatusChip status={area.progress.status} />
        </p>
      </header>
      <ul className="mt-5 flex flex-col gap-3">
        {area.tasks.map((task) => (
          <li key={task.id}>
            <TaskRow task={task} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default async function AreaPage({ params }: PageProps<"/plan/[area]">) {
  const { area } = await params;
  if (!READINESS_AREAS.some((a) => a.id === area)) notFound();
  return (
    <div>
      <Link
        href="/plan"
        className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-blue-700"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to plan
      </Link>
      <Suspense fallback={<PlanSkeleton />}>
        <AreaContent areaId={area} />
      </Suspense>
    </div>
  );
}
