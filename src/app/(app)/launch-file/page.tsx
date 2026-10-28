import { ArrowRight, BadgeCheck, ExternalLink, FileText, Link2, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DownloadPdfButton } from "@/components/launch-file/download-pdf-button";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { MarkerHeading, PaperCard, Tape } from "@/components/scrapbook";
import { getLaunchFile } from "@/lib/data/launch-file";
import type { LaunchFileItem, LaunchFileSection } from "@/lib/domain/launch-file";

export const metadata: Metadata = { title: "Launch File" };

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

async function LaunchFileContent() {
  const data = await getLaunchFile();
  const { file, student } = data;

  return (
    <div className="flex flex-col gap-8">
      <PaperCard variant="pinned" tilt={-1} className="rounded-card">
        <Tape position="top-right" />
        <p className="text-caption text-ink-600 font-semibold tracking-wide uppercase">
          {student.school}
          {student.classYear ? ` · Class of ${student.classYear}` : ""}
        </p>
        <MarkerHeading as="h1" underline className="text-navy-900 mt-2 text-3xl sm:text-4xl">
          My Launch File
        </MarkerHeading>
        <p className="text-navy-900 mt-4 font-serif text-xl font-bold">{student.name}</p>
        <p className="text-ink-900">
          {student.pathway}
          {student.destination ? ` · ${student.destination}` : ""}
          {student.targetCity ? ` · ${student.targetCity}` : ""}
        </p>
        <p className="text-body-sm text-ink-600 mt-3">
          {file.total} {file.total === 1 ? "output" : "outputs"} saved · {data.stepsComplete} of{" "}
          {data.stepsTotal} steps complete · {data.daysLeft} days to graduation
        </p>
        <div className="mt-5">
          <DownloadPdfButton data={data} disabled={file.total === 0} />
        </div>
      </PaperCard>

      {file.sections.map((section) => (
        <Section key={section.id} section={section} mentors={file.mentors} />
      ))}
    </div>
  );
}

function Section({
  section,
  mentors,
}: {
  section: LaunchFileSection;
  mentors: { name: string; role: string; city: string | null }[];
}) {
  const id = `lf-${section.id}`;
  const showMentors = section.id === "network" && mentors.length > 0;
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-heading-lg text-navy-900 mb-3 font-serif font-bold">
        {section.title}
      </h2>
      {showMentors && (
        <ul className="mb-3 flex flex-col gap-2">
          {mentors.map((m) => (
            <li
              key={m.name}
              className="rounded-card bg-area-network flex items-center gap-3 px-4 py-3 text-sm"
            >
              <Users aria-hidden="true" className="size-5 shrink-0 text-purple-700" />
              <span>
                <span className="text-navy-900 font-semibold">{m.name}</span>
                <span className="text-ink-600">
                  {" "}
                  · Mentor · {m.role}
                  {m.city ? ` · ${m.city}` : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {section.items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {section.items.map((item) => (
            <li key={item.taskId}>
              <Item item={item} />
            </li>
          ))}
        </ul>
      ) : (
        !showMentors && (
          <div className="rounded-card border border-dashed bg-white px-4 py-5 text-sm">
            <p className="text-ink-900">Nothing here yet. Every step you finish lands here.</p>
            {section.nextTask && (
              <Link
                href={`/tasks/${section.nextTask.id}`}
                className="mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-blue-700 underline underline-offset-4"
              >
                Start: {section.nextTask.title} <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            )}
          </div>
        )
      )}
    </section>
  );
}

function Item({ item }: { item: LaunchFileItem }) {
  return (
    <article className="rounded-card border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-navy-900 font-semibold">
          <Link href={`/tasks/${item.taskId}`} className="hover:underline">
            {item.title}
          </Link>
        </h3>
        {item.verified && (
          <span className="bg-success-50 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-green-700">
            <BadgeCheck aria-hidden="true" className="size-4" /> Verified
          </span>
        )}
      </div>
      <p className="text-caption text-ink-600 mt-1">
        {dateFormat.format(new Date(item.completedAt))} · {item.pathwayName} pathway
      </p>
      {item.kind === "form" && item.rows.length > 0 && (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {item.rows.map((row) => (
            <div key={row.label}>
              <dt className="text-ink-600 font-semibold">{row.label}</dt>
              <dd className="text-ink-900 break-words whitespace-pre-line">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {item.kind !== "form" && item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold break-all text-blue-700 underline underline-offset-4"
        >
          {item.kind === "file" ? (
            <FileText aria-hidden="true" className="size-4 shrink-0" />
          ) : (
            <Link2 aria-hidden="true" className="size-4 shrink-0" />
          )}
          {item.kind === "file" ? "Open the uploaded file" : item.url}
          <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
    </article>
  );
}

export default function LaunchFilePage() {
  return (
    <Suspense fallback={<PlanSkeleton />}>
      <LaunchFileContent />
    </Suspense>
  );
}
