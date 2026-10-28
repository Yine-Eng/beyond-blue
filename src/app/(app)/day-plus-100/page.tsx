import { CalendarHeart, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CheckInForm } from "@/components/day-plus-100/check-in-form";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { CHECK_IN_WINDOW } from "@/content/day-plus-100";
import { requirePlan } from "@/lib/auth/session";
import { addDays, daysToGraduation } from "@/lib/domain/countdown";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Day +100 check-in" };

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

async function CheckInContent() {
  await connection();
  const { user, cohort } = await requirePlan();
  const supabase = await createSupabaseServerClient();
  const { data: done } = await supabase
    .from("day_plus_100_surveys")
    .select("submitted_at")
    .eq("student_id", user.id)
    .maybeSingle();
  const daysSince = cohort ? -daysToGraduation(cohort.graduation_date, cohort.time_zone) : null;
  const open =
    daysSince !== null && daysSince >= CHECK_IN_WINDOW.opens && daysSince <= CHECK_IN_WINDOW.closes;

  return (
    <div className="flex flex-col gap-6">
      <header className="bg-area-network rounded-card p-5">
        <p className="text-caption flex items-center gap-2 font-bold tracking-wide text-purple-700 uppercase">
          <CalendarHeart aria-hidden="true" className="size-4" /> Day +100
        </p>
        <h1 className="text-heading-lg text-navy-900 mt-1 font-serif font-bold">
          Your Day +100 check-in
        </h1>
        <p className="text-ink-900 mt-2">
          A hundred days after graduation, tell us what worked. It takes about three minutes, and it
          shapes the program for the seniors who come after you.
        </p>
      </header>

      {done ? (
        <div role="status" className="bg-success-50 rounded-card p-5">
          <p className="text-navy-900 flex items-center gap-2 font-semibold">
            <Check aria-hidden="true" className="size-5 text-green-700" /> Thank you, your check-in
            is in.
          </p>
          <p className="text-body-sm text-ink-900 mt-1">
            Bluefield State is still here for you. Your plan and Launch File stay in your account.
          </p>
          <Link
            href="/launch-file"
            className="mt-3 inline-flex min-h-11 items-center font-semibold text-blue-700 underline underline-offset-4"
          >
            Open your Launch File
          </Link>
        </div>
      ) : open ? (
        <CheckInForm />
      ) : (
        <p className="rounded-card border border-dashed bg-white px-4 py-5">
          {cohort
            ? `Your check-in opens on Day +${CHECK_IN_WINDOW.opens}, ${longDate(addDays(cohort.graduation_date, CHECK_IN_WINDOW.opens))}, and stays open for about six weeks.`
            : "Your check-in opens 90 days after graduation."}
        </p>
      )}
    </div>
  );
}

export default function DayPlus100Page() {
  return (
    <Suspense fallback={<PlanSkeleton />}>
      <CheckInContent />
    </Suspense>
  );
}
