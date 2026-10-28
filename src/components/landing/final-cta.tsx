import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Doodle, PaperCard, Tape } from "@/components/scrapbook";
import { Button } from "@/components/ui/button";
import { DemoButton, StaffDemoButton } from "@/components/demo/demo-button";
import { GET_STARTED_HREF, hero } from "@/content/copy/landing";
import { finalCta, footer } from "@/content/copy/story-end";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="px-4 py-12 sm:px-6">
      <PaperCard
        variant="pinned"
        tilt={-1}
        className="relative mx-auto max-w-3xl px-6 py-10 text-center sm:px-12"
      >
        <Tape position="top-center" tone="gold" />
        <Doodle
          name="arrow"
          className="absolute -top-8 -left-4 hidden h-12 w-24 rotate-12 text-blue-500 sm:block"
        />
        <h2 id="cta-title" className="font-marker text-display-md text-navy-900 uppercase">
          {finalCta.title}
        </h2>
        <p className="text-body-lg text-ink-600 mx-auto mt-3 max-w-xl">{finalCta.body}</p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <DemoButton label={`${hero.demoCta} →`} className="w-full sm:w-auto" />
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={GET_STARTED_HREF}>{hero.startCta}</Link>
          </Button>
        </div>
        <p className="text-body-sm text-ink-600 mt-4 flex flex-wrap items-center justify-center gap-x-1">
          See the staff side: <StaffDemoButton label="cohort dashboard and fund review (demo) →" />
        </p>
      </PaperCard>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-cream-50 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Wordmark className="text-3xl" />
          <p className="mt-2 font-semibold">{footer.team}</p>
          <p className="text-sm">{footer.event}</p>
          <p className="text-sm">{footer.school}</p>
        </div>
        <div className="text-sm sm:text-right">
          <p>{footer.builtBy}</p>
          <p className="mt-2">
            <a href={footer.repo} className="text-cream-50 underline underline-offset-4">
              Source on GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
