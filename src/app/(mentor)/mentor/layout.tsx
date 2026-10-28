import { LogOut } from "lucide-react";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { Toaster } from "@/components/ui/sonner";
import { signOut } from "@/lib/actions/auth";
import { requireMentor } from "@/lib/data/mentor";

async function MentorGate({ children }: { children: ReactNode }) {
  await requireMentor();
  return children;
}

/** Mentor area: a simple frame with Inbox and Profile; mentors don't have a 100-day plan. */
export default function MentorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="bg-navy-900 sr-only z-50 rounded px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header className="bg-burst flex flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/mentor" className="bg-navy-800 -rotate-1 rounded-sm px-3 py-1.5">
          <Wordmark />
        </Link>
        <nav aria-label="Mentor" className="text-cream-50 flex gap-1 font-semibold">
          <Link href="/mentor" className="rounded-button px-3 py-2 hover:bg-white/10">
            Inbox
          </Link>
          <Link href="/mentor/profile" className="rounded-button px-3 py-2 hover:bg-white/10">
            Profile
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
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Suspense fallback={<PlanSkeleton />}>
          <MentorGate>{children}</MentorGate>
        </Suspense>
      </main>
      <Toaster />
    </div>
  );
}
