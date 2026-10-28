import { BadgeCheck, ExternalLink, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ConversationForm, RespondButtons, VerifyButton } from "@/components/mentor/mentor-actions";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { type PathwayId, getPathway } from "@/content/pathways";
import { getMentorInbox } from "@/lib/data/mentor";

export const metadata: Metadata = { title: "Mentor inbox" };

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function pathwayName(plan: { pathway_id: string } | null | undefined) {
  return plan ? getPathway(plan.pathway_id as PathwayId).name : "No pathway yet";
}

async function Inbox() {
  const { mentor, requests, mentees } = await getMentorInbox();
  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-heading-lg text-navy-900 font-serif font-bold">
          Welcome, {mentor.display_name.split(" ")[0]}
        </h1>
        <p className="text-ink-600">
          {mentees.length} of {mentor.capacity} mentee spots filled ·{" "}
          {mentor.is_available ? "Accepting requests" : "Paused"}
        </p>
      </header>

      <section aria-labelledby="requests-title">
        <h2 id="requests-title" className="text-heading-md text-navy-900 mb-3 font-serif font-bold">
          Requests
        </h2>
        {requests.length === 0 ? (
          <p className="rounded-card bg-cream-50 text-ink-600 p-5">No new requests right now.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {requests.map((r) => {
              const name = r.student?.preferred_name ?? "A student";
              return (
                <li key={r.id} className="rounded-card flex flex-col gap-2 border bg-white p-4">
                  <p className="text-navy-900 font-semibold">
                    {name} · {pathwayName(r.student?.plan)}
                  </p>
                  {r.student?.target_city && (
                    <p className="text-body-sm text-ink-600 flex items-center gap-1">
                      <MapPin aria-hidden="true" className="size-3.5" /> Heading to{" "}
                      {r.student.target_city}
                      {r.student.destination_role ? ` · ${r.student.destination_role}` : ""}
                    </p>
                  )}
                  {r.match_reason && (
                    <p className="text-body-sm text-ink-900">Why matched: {r.match_reason}</p>
                  )}
                  {r.note && (
                    <blockquote className="text-body-sm border-l-4 border-blue-200 pl-3 italic">
                      {r.note}
                    </blockquote>
                  )}
                  <RespondButtons connectionId={r.id} name={name} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="mentees-title">
        <h2 id="mentees-title" className="text-heading-md text-navy-900 mb-3 font-serif font-bold">
          Your mentees
        </h2>
        {mentees.length === 0 ? (
          <p className="rounded-card bg-cream-50 text-ink-600 p-5">
            Accepted requests appear here with the goals and outputs your mentees share.
          </p>
        ) : (
          <ul className="flex flex-col gap-6">
            {mentees.map((m) => (
              <li key={m.id} className="rounded-card flex flex-col gap-4 border bg-white p-5">
                <div>
                  <p className="text-heading-md text-navy-900 font-semibold">
                    {m.student?.preferred_name ?? "Student"}
                  </p>
                  <p className="text-body-sm text-ink-600">
                    {pathwayName(m.student?.plan)}
                    {m.student?.target_city ? ` · ${m.student.target_city}` : ""}
                  </p>
                </div>

                <div>
                  <h3 className="text-navy-900 mb-2 font-semibold">Shared outputs</h3>
                  {m.outputs.length === 0 ? (
                    <p className="text-body-sm text-ink-600">Nothing shared yet.</p>
                  ) : (
                    <ul className="flex flex-col divide-y">
                      {m.outputs.map((o) => (
                        <li key={o.id} className="flex flex-wrap items-center gap-2 py-2">
                          <span className="min-w-0 flex-1">
                            <span className="text-navy-900 font-medium">{o.task?.title}</span>
                            <span className="text-caption text-ink-600 block">
                              Completed {dateFormat.format(new Date(o.completed_at))}
                            </span>
                          </span>
                          {o.output_url && (
                            <a
                              href={o.output_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-body-sm inline-flex items-center gap-1 font-semibold text-blue-700"
                            >
                              Open <ExternalLink aria-hidden="true" className="size-3.5" />
                              <span className="sr-only">(opens in a new tab)</span>
                            </a>
                          )}
                          {o.verified_at ? (
                            <span className="text-caption bg-success-50 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-green-700">
                              <BadgeCheck aria-hidden="true" className="size-3.5" /> Verified
                            </span>
                          ) : (
                            <VerifyButton completionId={o.id} title={o.task?.title ?? "output"} />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="text-navy-900 mb-2 font-semibold">Conversations</h3>
                  {m.notes.length > 0 && (
                    <ul className="text-body-sm mb-3 flex flex-col gap-1">
                      {m.notes.map((n) => (
                        <li key={n.id}>
                          <strong>{dateFormat.format(new Date(`${n.met_on}T12:00:00`))}</strong> ·{" "}
                          {n.topic}
                          {n.notes ? `: ${n.notes}` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  <ConversationForm connectionId={m.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function MentorPage() {
  return (
    <Suspense fallback={<PlanSkeleton />}>
      <Inbox />
    </Suspense>
  );
}
