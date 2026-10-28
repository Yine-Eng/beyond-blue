import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CountdownHero } from "@/components/plan/countdown-hero";
import { FocusCard } from "@/components/plan/focus-card";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { InstallCard } from "@/components/pwa/install-card";
import { CHECK_IN_WINDOW } from "@/content/day-plus-100";
import { Button } from "@/components/ui/button";
import { getPlan } from "@/lib/data/plan";
import { greetingFor } from "@/lib/domain/greeting";

export const metadata: Metadata = { title: "Home" };

async function HomeContent() {
  const plan = await getPlan();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg text-navy-900 font-serif font-bold">
          {greetingFor(plan.cohort?.time_zone ?? "America/New_York")},{" "}
          {plan.profile.preferred_name ?? "there"}.
        </h1>
        <CountdownHero
          daysLeft={plan.daysLeft}
          stage={plan.stage}
          completed={plan.completedCount}
          total={plan.tasks.length}
        />
      </div>
      <section aria-labelledby="next-title">
        <h2 id="next-title" className="text-heading-md text-navy-900 mb-3 font-semibold">
          Up next
        </h2>
        <FocusCard task={plan.focus} />
      </section>
      <Button asChild variant="outline" size="lg" className="self-start bg-white">
        <Link href="/plan">
          See your full plan <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
      {plan.daysLeft <= -CHECK_IN_WINDOW.opens && plan.daysLeft >= -CHECK_IN_WINDOW.closes && (
        <Link
          href="/day-plus-100"
          className="rounded-card bg-area-network text-navy-900 block p-4 font-semibold"
        >
          It&apos;s Day +100: tell us how it&apos;s going (3 minutes) →
        </Link>
      )}
      <InstallCard />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<PlanSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
