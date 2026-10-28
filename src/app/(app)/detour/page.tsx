import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DetourBuilder } from "@/components/detour/detour-builder";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { DETOUR_PROMPTS } from "@/content/detour";
import { type PathwayId, getPathway } from "@/content/pathways";
import { requirePlan } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Detour Challenge" };

const asAnswers = (value: unknown): Record<string, string> =>
  Object.fromEntries(
    Object.entries((value as Record<string, unknown> | null) ?? {}).map(([k, v]) => [k, String(v)]),
  );

async function DetourContent() {
  const { user, plan } = await requirePlan();
  const pathwayId = plan.pathway_id as PathwayId;
  const supabase = await createSupabaseServerClient();
  const { data: draft, error } = await supabase
    .from("detour_plans")
    .select("answers, current_step, completed_at")
    .eq("student_id", user.id)
    .maybeSingle();
  if (error) throw error;

  return (
    <div className="flex flex-col gap-6">
      <header className="bg-area-wellness rounded-card p-5">
        <p className="text-caption font-bold tracking-wide text-pink-700 uppercase">
          Wellness &amp; Detour Planning
        </p>
        <h1 className="text-heading-lg text-navy-900 mt-1 font-serif font-bold">
          The Detour Challenge
        </h1>
        <p className="text-ink-900 mt-2">
          What if plan A changes? Five quick steps to a backup plan for your{" "}
          {getPathway(pathwayId).name} path. Progress saves after every step.
        </p>
      </header>
      <DetourBuilder
        prompts={DETOUR_PROMPTS[pathwayId]}
        initialAnswers={asAnswers(draft?.answers)}
        initialStep={draft?.current_step ?? 1}
        initiallyDone={Boolean(draft?.completed_at)}
      />
    </div>
  );
}

export default function DetourPage() {
  return (
    <div>
      <Link
        href="/plan/wellness"
        className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-blue-700"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to Wellness &amp; Detour
      </Link>
      <Suspense fallback={<PlanSkeleton />}>
        <DetourContent />
      </Suspense>
    </div>
  );
}
