import { ArrowLeft, BadgeCheck, LifeBuoy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AREA_META, OUTPUT_LABEL } from "@/components/plan/area-meta";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { StatusChip } from "@/components/plan/status-chip";
import { TaskOutputForm } from "@/components/tasks/task-output-form";
import type { FormId } from "@/content/curriculum";
import { FORMS } from "@/content/curriculum";
import { READINESS_AREAS } from "@/content/readiness-areas";
import { getPlan } from "@/lib/data/plan";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Task" };

const SUPPORT_LABEL: Record<string, string> = {
  career_services: "Career Services",
  student_success: "Student Success",
  alumni: "Alumni mentors",
  employers: "Employer partners",
  financial_pro: "Financial professionals",
  financial_aid: "Financial Aid",
  counseling: "Counseling",
  faculty: "Faculty",
};

async function TaskContent({ taskId }: { taskId: string }) {
  const plan = await getPlan();
  const task = plan.tasks.find((t) => t.id === taskId);
  if (!task) notFound();

  const supabase = await createSupabaseServerClient();
  const [{ data: detail }, { data: completion }] = await Promise.all([
    supabase.from("tasks").select("support").eq("id", task.id).single(),
    supabase
      .from("task_completions")
      .select("output_url, output_path, output_data, completed_at")
      .eq("student_id", plan.user.id)
      .eq("task_id", task.id)
      .maybeSingle(),
  ]);

  let fileUrl: string | null = null;
  if (completion?.output_path) {
    const { data } = await supabase.storage
      .from("task-outputs")
      .createSignedUrl(completion.output_path, 60 * 30);
    fileUrl = data?.signedUrl ?? null;
  }

  const area = READINESS_AREAS.find((a) => a.id === task.areaId)!;
  const meta = AREA_META[area.id];

  return (
    <article className="flex flex-col gap-6">
      <header className={cn("rounded-card p-5", meta.tint)}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-caption font-bold tracking-wide uppercase", meta.ink)}>
            {area.name}
          </span>
          <StatusChip status={task.status} />
          {task.isKeyOutput && (
            <span className="text-caption text-navy-900 inline-flex items-center gap-1 font-semibold">
              <BadgeCheck aria-hidden="true" className="size-4" /> Key output: a mentor or staff
              member can verify it
            </span>
          )}
        </div>
        <h1 className="text-heading-lg text-navy-900 mt-2 font-serif font-bold">{task.title}</h1>
        <p className="text-ink-900 mt-2">{task.whyItMatters}</p>
        <p className="text-body-sm text-ink-600 mt-3">
          Due Day {task.dueDayOffset} ·{" "}
          {task.formId ? FORMS[task.formId as FormId].title : OUTPUT_LABEL[task.outputType]}
        </p>
      </header>

      {detail?.support && detail.support.length > 0 && (
        <p className="text-body-sm text-ink-600 flex items-start gap-2">
          <LifeBuoy aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            Need help? Reach out to {detail.support.map((s) => SUPPORT_LABEL[s] ?? s).join(", ")}.
          </span>
        </p>
      )}

      <section aria-labelledby="output-title">
        <h2 id="output-title" className="text-heading-md text-navy-900 mb-3 font-semibold">
          {completion ? "Your output" : "Complete this step"}
        </h2>
        <TaskOutputForm
          taskId={task.id}
          areaId={area.id}
          outputType={task.outputType}
          formId={(task.formId as FormId | null) ?? null}
          existing={
            completion
              ? {
                  outputUrl: completion.output_url,
                  outputData: (completion.output_data as Record<string, unknown> | null) ?? null,
                  fileUrl,
                  completedAt: completion.completed_at,
                }
              : null
          }
        />
      </section>
    </article>
  );
}

export default async function TaskPage({ params }: PageProps<"/tasks/[taskId]">) {
  const { taskId } = await params;
  return (
    <div>
      <Link
        href="/plan"
        className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-blue-700"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to plan
      </Link>
      <Suspense fallback={<PlanSkeleton />}>
        <TaskContent taskId={decodeURIComponent(taskId)} />
      </Suspense>
    </div>
  );
}
