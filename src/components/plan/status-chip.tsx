import { CheckCircle2, CircleDashed, Clock, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "complete" | "active" | "behind" | "upcoming";

const STYLES: Record<Status, { label: string; icon: typeof Clock; className: string }> = {
  complete: { label: "Done", icon: CheckCircle2, className: "bg-success-50 text-green-700" },
  active: { label: "Active", icon: Clock, className: "bg-blue-100 text-navy-900" },
  behind: { label: "Behind", icon: TriangleAlert, className: "bg-area-wellness text-pink-700" },
  upcoming: { label: "Upcoming", icon: CircleDashed, className: "bg-cream-50 text-ink-600" },
};

/** Status with text and icon, never colour alone. */
export function StatusChip({ status, className }: { status: Status; className?: string }) {
  const { label, icon: Icon, className: tone } = STYLES[status];
  return (
    <span
      className={cn(
        "text-caption inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
        tone,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {label}
    </span>
  );
}
