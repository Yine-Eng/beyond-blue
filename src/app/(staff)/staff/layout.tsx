import { LogOut } from "lucide-react";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { Toaster } from "@/components/ui/sonner";
import { signOut } from "@/lib/actions/auth";
import { leaveDemo } from "@/lib/actions/demo";
import { getStaffAccess } from "@/lib/data/fund";

/** Non-staff stay signed in and see a short explanation; the staff page itself never renders. */
async function StaffGate({ children }: { children: ReactNode }) {
  const { isStaff, isDemo } = await getStaffAccess();
  if (!isStaff)
    return (
      <section aria-labelledby="staff-only" className="rounded-card bg-cream-50 p-6">
        <h1 id="staff-only" className="text-heading-lg text-navy-900 font-serif font-bold">
          Staff only
        </h1>
        <p className="text-ink-900 mt-2">
          This area is for Career Services and Student Success staff. If you should have access, ask
          the program team to add the staff role to your account. You&apos;ll see it on your next
          visit, with no need to sign in again.
        </p>
        <Link
          href="/home"
          className="mt-4 inline-flex min-h-11 items-center font-semibold text-blue-700 underline underline-offset-4"
        >
          Go to your Beyond Blue home
        </Link>
      </section>
    );
  if (isDemo)
    return (
      <>
        <aside
          aria-label="Staff demo"
          className="bg-gold-400 text-navy-900 rounded-card mb-6 flex flex-wrap items-center gap-3 px-4 py-3"
        >
          <p className="flex-1 text-sm">
            <strong>Staff demo.</strong> A fictional pilot cohort, generated for this session only.
            No real students, and decisions aren&apos;t saved. Deleted after 24 hours.
          </p>
          <form action={leaveDemo}>
            <button
              type="submit"
              className="border-navy-900 min-h-11 rounded-lg border-2 px-3 text-sm font-semibold"
            >
              Leave the demo
            </button>
          </form>
        </aside>
        {children}
      </>
    );
  return children;
}

/** Staff area (Career Services and Student Success): the cohort dashboard and the Last Mile Fund review queue. */
export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="bg-navy-900 sr-only z-50 rounded px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header className="bg-burst flex flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/staff" className="bg-navy-800 -rotate-1 rounded-sm px-3 py-1.5">
          <Wordmark />
        </Link>
        <nav aria-label="Staff" className="text-cream-50 flex gap-1 font-semibold">
          <Link href="/staff" className="rounded-button px-3 py-2 hover:bg-white/10">
            Dashboard
          </Link>
          <Link href="/staff/fund" className="rounded-button px-3 py-2 hover:bg-white/10">
            Fund review
          </Link>
        </nav>
        <form action={signOut} className="ml-auto">
          <button
            type="submit"
            className="text-cream-50 rounded-button flex min-h-11 items-center gap-2 px-3 hover:bg-white/10"
          >
            <LogOut aria-hidden="true" className="size-4" /> Sign out
          </button>
        </form>
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Suspense fallback={<PlanSkeleton />}>
          <StaffGate>{children}</StaffGate>
        </Suspense>
      </main>
      <Toaster />
    </div>
  );
}
