import { Check } from "lucide-react";
import { FUND_STATUS, type FundStatus } from "@/content/fund";
import { cn } from "@/lib/utils";

export function FundStatusChip({ status }: { status: FundStatus }) {
  const { label, tone } = FUND_STATUS[status];
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", tone)}>{label}</span>;
}

/** Submitted → In review → Decision, with "Needs info" shown at the review step. */
export function FundTimeline({ status, submittedAt }: { status: FundStatus; submittedAt: string }) {
  const decided = status === "approved" || status === "declined";
  const steps = [
    {
      label: `Submitted ${new Date(submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      done: true,
    },
    {
      label: status === "needs_info" ? "Needs info from you" : "In review",
      done: status !== "submitted",
    },
    { label: decided ? FUND_STATUS[status].label : "Decision", done: decided },
  ];
  return (
    <ol className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-4" aria-label="Request progress">
      {steps.map((step) => (
        <li key={step.label} className="flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className={cn(
              "grid size-6 place-items-center rounded-full border-2",
              step.done ? "border-navy-900 bg-navy-900 text-cream-50" : "border-cream-200",
            )}
          >
            {step.done && <Check className="size-3.5" />}
          </span>
          <span className={step.done ? "text-navy-900 font-semibold" : "text-ink-600"}>
            {step.label}
            <span className="sr-only">{step.done ? " (done)" : " (not yet)"}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
