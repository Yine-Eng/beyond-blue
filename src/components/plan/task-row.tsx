import { BadgeCheck, ChevronRight, FileUp, Link2, ListChecks, Repeat } from "lucide-react";
import Link from "next/link";
import type { PlanTaskView } from "@/lib/data/plan";
import { OUTPUT_LABEL } from "./area-meta";
import { StatusChip } from "./status-chip";

const OUTPUT_ICON = { file: FileUp, link: Link2, form: ListChecks } as const;

export function TaskRow({ task }: { task: PlanTaskView }) {
  const Icon = OUTPUT_ICON[task.outputType];
  return (
    <Link
      href={`/tasks/${encodeURIComponent(task.id)}`}
      className="group rounded-card hover:shadow-paper flex items-start gap-3 border bg-white p-4 transition-shadow"
    >
      <Icon aria-hidden="true" className="text-navy-900 mt-0.5 size-5 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="text-navy-900 block font-semibold">{task.title}</span>
        <span className="text-body-sm text-ink-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusChip status={task.status} />
          <span>Due Day {task.dueDayOffset}</span>
          <span>{OUTPUT_LABEL[task.outputType]}</span>
          {task.isKeyOutput && (
            <span className="inline-flex items-center gap-1">
              <BadgeCheck aria-hidden="true" className="size-4" /> Key output
            </span>
          )}
          {task.carriedOver && (
            <span className="inline-flex items-center gap-1">
              <Repeat aria-hidden="true" className="size-4" /> Carried over
            </span>
          )}
        </span>
      </span>
      <ChevronRight aria-hidden="true" className="text-ink-600 mt-0.5 size-5 shrink-0" />
    </Link>
  );
}
