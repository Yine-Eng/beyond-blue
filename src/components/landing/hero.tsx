import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { Doodle, PaperCard, Sticker, Tape } from "@/components/scrapbook";
import { Button } from "@/components/ui/button";
import { DEMO_HREF, GET_STARTED_HREF, hero } from "@/content/copy/landing";

const STACK_TONES = ["bg-blue-200", "bg-cream-100", "bg-gold-400", "bg-blue-300"] as const;

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate px-4 pt-10 pb-8 sm:px-6 sm:pt-16"
    >
      <div aria-hidden="true" className="bg-burst absolute inset-0 -z-10" />
      <PaperCard
        variant="torn"
        className="relative mx-auto max-w-5xl px-5 pt-12 pb-10 sm:px-12 sm:pt-16"
      >
        <Tape position="top-left" />
        <Tape position="top-right" tone="blue" />
        <Doodle
          name="star"
          className="text-gold-500 absolute top-6 left-6 hidden size-12 sm:block"
        />
        <GraduationCap
          aria-hidden="true"
          className="text-navy-900 absolute top-4 right-6 hidden size-14 rotate-12 sm:block"
        />

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div className="text-center lg:text-left">
            <div className="bg-navy-800 inline-block -rotate-1 px-5 py-3 sm:px-8">
              <h1 id="hero-title" className="font-script text-display-xl text-cream-100">
                Beyond <span className="text-blue-300">Blue</span>
              </h1>
            </div>
            <Doodle
              name="underline"
              strokeWidth={8}
              className="text-gold-500 mx-auto mt-2 h-4 w-64 lg:mx-0"
            />
            <p className="font-hand text-navy-900 mt-4 text-3xl sm:text-4xl">{hero.question}</p>
            <p className="text-body-lg text-ink-600 mt-3">{hero.tagline}</p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild variant="accent" size="lg" className="w-full sm:w-auto">
                <Link href={DEMO_HREF}>{hero.demoCta} →</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full bg-white sm:w-auto">
                <Link href={GET_STARTED_HREF}>{hero.startCta}</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-col items-center gap-1 lg:items-start">
              <Sticker tilt={-2}>{hero.presentedBy}</Sticker>
              <p className="text-body-sm text-ink-600 mt-2">{hero.event}</p>
              <p className="text-body-sm text-ink-600">{hero.school}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="bg-cream-100 shadow-paper relative rotate-2 px-6 py-5">
              <Tape position="top-center" tone="blue" />
              <ul className="font-hand text-navy-900 flex flex-col gap-2 text-2xl">
                {hero.checklist.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="border-navy-900 grid size-6 place-items-center border-2 text-base"
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <ul aria-label="What Beyond Blue builds" className="flex flex-col items-center">
              {hero.stack.map((label, i) => (
                <li
                  key={label}
                  style={{ rotate: `${(i % 2 ? 1 : -1) * (2 + i)}deg` }}
                  className={`${STACK_TONES[i]} text-navy-900 shadow-paper w-56 border-l-8 border-white/60 px-4 py-2 text-center font-bold tracking-wide uppercase`}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PaperCard>
    </section>
  );
}
