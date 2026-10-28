import { RotateCcw, Sparkles } from "lucide-react";
import { leaveDemo, resetDemo } from "@/lib/actions/demo";
import { getStudentContext } from "@/lib/auth/session";

/** Shown on every app screen while exploring as Veronica. */
export async function DemoBanner() {
  const { profile } = await getStudentContext();
  if (!profile.is_demo) return null;
  return (
    <aside
      aria-label="Demo mode"
      className="bg-gold-400 text-navy-900 rounded-card mb-6 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
    >
      <p className="flex flex-1 items-start gap-2 text-sm">
        <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          <strong>Demo mode.</strong> You&apos;re exploring Veronica&apos;s sample plan. Changes are
          private to you and deleted after 24 hours.
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        <form action={resetDemo}>
          <button
            type="submit"
            className="border-navy-900 rounded-button inline-flex min-h-11 items-center gap-1.5 border-2 px-3 text-sm font-semibold"
          >
            <RotateCcw aria-hidden="true" className="size-4" /> Reset demo
          </button>
        </form>
        <form action={leaveDemo}>
          <button
            type="submit"
            className="bg-navy-900 rounded-button inline-flex min-h-11 items-center px-3 text-sm font-semibold text-white"
          >
            Create your own plan
          </button>
        </form>
      </div>
    </aside>
  );
}
