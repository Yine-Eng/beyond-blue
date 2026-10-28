import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { PlanData } from "@/lib/data/plan";
import { cn } from "@/lib/utils";
import { AREA_META } from "./area-meta";
import { StatusChip } from "./status-chip";

type Area = PlanData["areas"][number];

export function AreaCard({ area }: { area: Area }) {
  const meta = AREA_META[area.id];
  const Icon = meta.icon;
  const { completed, total, status } = area.progress;
  return (
    <Link
      href={`/plan/${area.id}`}
      className={cn(
        "group rounded-card hover:shadow-paper flex items-center gap-4 border p-4 transition-shadow",
        meta.tint,
      )}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full bg-white/80",
          meta.ink,
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-navy-900 font-semibold">{area.name}</span>
          <StatusChip status={status} />
        </span>
        <span className="text-body-sm text-ink-600 block">
          Day {area.milestoneDay} · {meta.blurb}
        </span>
        <span className="mt-2 flex items-center gap-2" aria-hidden="true">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/80">
            <span
              className="bg-navy-900 block h-full rounded-full"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </span>
        </span>
      </span>
      <span className="text-body-sm text-navy-900 shrink-0 font-semibold">
        {completed}/{total}
        <span className="sr-only"> steps complete</span>
      </span>
      <ChevronRight
        aria-hidden="true"
        className="text-ink-600 size-5 shrink-0 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
