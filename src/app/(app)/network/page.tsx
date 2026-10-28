import { CheckCircle2, Clock, MapPin, MinusCircle, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectDialog } from "@/components/network/connect-dialog";
import { WithdrawButton } from "@/components/network/withdraw-button";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { type ConnectionStatus, getNetwork } from "@/lib/data/network";
import { initials } from "@/lib/initials";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Network" };

const MAX_PENDING = 3;

const STATUS: Record<
  Exclude<ConnectionStatus, "withdrawn">,
  { label: string; icon: typeof Clock; className: string }
> = {
  pending: { label: "Pending", icon: Clock, className: "bg-area-financial text-navy-900" },
  accepted: { label: "Connected", icon: CheckCircle2, className: "bg-success-50 text-green-700" },
  declined: {
    label: "Not available right now",
    icon: MinusCircle,
    className: "bg-cream-50 text-ink-600",
  },
};

const AVATAR_TINTS = ["bg-blue-100", "bg-area-career", "bg-area-financial", "bg-area-relocation"];

function Avatar({ name, index }: { name: string; index: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "text-navy-900 grid size-12 shrink-0 place-items-center rounded-full font-serif text-lg font-bold",
        AVATAR_TINTS[index % AVATAR_TINTS.length],
      )}
    >
      {initials(name)}
    </span>
  );
}

async function NetworkContent() {
  const { stats, connections, pendingCount, suggestions } = await getNetwork();
  const atLimit = pendingCount >= MAX_PENDING;

  return (
    <div className="flex flex-col gap-8">
      <dl className="grid grid-cols-3 gap-3">
        {[
          { label: "Mentors", value: stats.mentors },
          { label: "Alumni", value: stats.alumni },
          { label: "Students on your path", value: stats.students_on_path },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-card flex flex-col-reverse items-center border bg-white px-2 py-4 text-center"
          >
            <dt className="text-caption text-ink-600 font-semibold">{stat.label}</dt>
            <dd className="text-heading-lg text-navy-900 font-serif font-bold">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {connections.length > 0 && (
        <section aria-labelledby="connections-title">
          <h2
            id="connections-title"
            className="text-heading-md text-navy-900 mb-3 font-serif font-bold"
          >
            Your connections
          </h2>
          <ul className="flex flex-col gap-3">
            {connections.map((c, i) => {
              if (!c.mentor || c.status === "withdrawn") return null;
              const status = STATUS[c.status];
              return (
                <li
                  key={c.id}
                  className="rounded-card flex flex-wrap items-center gap-3 border bg-white p-4"
                >
                  <Avatar name={c.mentor.display_name} index={i} />
                  <div className="min-w-0 flex-1">
                    <p className="text-navy-900 font-semibold">{c.mentor.display_name}</p>
                    <p className="text-body-sm text-ink-600">
                      {c.mentor.role_title}
                      {c.mentor.employer ? ` · ${c.mentor.employer}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-caption inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
                      status.className,
                    )}
                  >
                    <status.icon aria-hidden="true" className="size-3.5" />
                    {status.label}
                  </span>
                  {c.status === "pending" && (
                    <WithdrawButton
                      connectionId={c.id}
                      label={`Withdraw request to ${c.mentor.display_name}`}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="suggestions-title">
        <h2
          id="suggestions-title"
          className="text-heading-md text-navy-900 mb-1 font-serif font-bold"
        >
          Alumni You May Want to Meet
        </h2>
        <p className="text-body-sm text-ink-600 mb-4">
          Matched on city, employer, industry, school and shared experience.
          {atLimit && " You have 3 pending requests: withdraw one to send another."}
        </p>
        {suggestions.length === 0 ? (
          <div className="rounded-card bg-cream-50 p-6 text-center">
            <p className="text-navy-900 font-semibold">No new matches right now.</p>
            <p className="text-body-sm text-ink-600 mt-1">
              Add a target city and destination role on your profile to find alumni near your next
              step.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {suggestions.map(({ mentor, reasons }, i) => (
              <li key={mentor.id} className="rounded-card flex flex-col gap-3 border bg-white p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={mentor.displayName} index={i + 1} />
                  <div className="min-w-0">
                    <p className="text-navy-900 font-semibold">{mentor.displayName}</p>
                    <p className="text-body-sm text-ink-600">
                      {mentor.roleTitle}
                      {mentor.employer ? ` · ${mentor.employer}` : ""}
                    </p>
                    {mentor.city && (
                      <p className="text-caption text-ink-600 mt-0.5 flex items-center gap-1">
                        <MapPin aria-hidden="true" className="size-3" />
                        {mentor.city}
                        {mentor.gradYear ? ` · BSU ’${String(mentor.gradYear).slice(2)}` : ""}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-body-sm text-navy-900 flex items-start gap-2 rounded-lg bg-blue-100 px-3 py-2">
                  <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-700" />
                  <span>
                    <span className="sr-only">Why matched: </span>
                    {reasons.join(" · ")}
                  </span>
                </p>
                <div className="mt-auto">
                  <ConnectDialog
                    mentorId={mentor.id}
                    mentorName={mentor.displayName}
                    reason={reasons.join(" · ")}
                    disabled={atLimit}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function NetworkPage() {
  return (
    <>
      <h1 className="text-heading-lg text-navy-900 mb-6 font-serif font-bold">
        Your Beyond Blue Network
      </h1>
      <Suspense fallback={<PlanSkeleton />}>
        <NetworkContent />
      </Suspense>
    </>
  );
}
