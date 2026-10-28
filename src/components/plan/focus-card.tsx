import { ArrowRight, PartyPopper } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { READINESS_AREAS } from "@/content/readiness-areas";
import type { PlanTaskView } from "@/lib/data/plan";
import { cn } from "@/lib/utils";
import { AREA_META, OUTPUT_LABEL } from "./area-meta";
import { StatusChip } from "./status-chip";

/** "Your 100-Day Curriculum": the single most relevant next step. */
export function FocusCard({ task }: { task: PlanTaskView | undefined }) {
  if (!task) {
    return (
      <div className="bg-success-50 rounded-card flex items-center gap-4 p-5">
        <PartyPopper aria-hidden="true" className="size-8 shrink-0 text-green-700" />
        <div>
          <p className="text-navy-900 font-semibold">Every step is complete.</p>
          <p className="text-ink-600 text-sm">
            Your Launch File is ready. Keep it handy for what comes next.
          </p>
        </div>
      </div>
    );
  }
  const area = READINESS_AREAS.find((a) => a.id === task.areaId)!;
  const meta = AREA_META[area.id];
  return (
    <div className={cn("rounded-card border p-5", meta.tint)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("text-caption font-bold tracking-wide uppercase", meta.ink)}>
          {area.name}
        </span>
        <StatusChip status={task.status} />
      </div>
      <p className="text-ink-600 mt-3 text-xs font-semibold tracking-wide uppercase">
        Current task
      </p>
      <h3 className="text-heading-md text-navy-900 font-semibold">{task.title}</h3>
      <p className="text-body-sm text-ink-600 mt-1">{task.whyItMatters}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-sm text-ink-600">
          Due Day {task.dueDayOffset} · {OUTPUT_LABEL[task.outputType]}
        </p>
        <Button asChild>
          <Link href={`/tasks/${encodeURIComponent(task.id)}`}>
            Start <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
