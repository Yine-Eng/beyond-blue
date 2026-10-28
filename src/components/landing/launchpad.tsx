import { Briefcase, Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Doodle, Sticker } from "@/components/scrapbook";
import { launchpad } from "@/content/copy/story-end";
import { READINESS_AREAS } from "@/content/readiness-areas";
import { NotebookSection } from "./notebook-section";

// Milestone circle and label tape colours from the deck timeline.
const CIRCLES = ["bg-navy-800 text-white", "bg-gold-400 text-navy-900"] as const;
const TAPES = ["bg-pink-300", "bg-blue-200", "bg-gold-400", "bg-pink-300", "bg-blue-200"] as const;

export function Launchpad() {
  return (
    <NotebookSection id="launchpad" labelledBy="launchpad-title" className="pb-0 sm:pb-0">
      {/* Veronica starts her path: the 100-day timeline */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-hand text-ink-900 text-lg">{launchpad.selectedPathway}</p>
          <p className="bg-navy-800 font-marker mt-1 inline-flex -rotate-2 items-center gap-3 px-4 py-2 text-2xl text-white uppercase">
            <Briefcase aria-hidden="true" className="size-6" /> Hired
          </p>
        </div>
        <div className="lg:max-w-xl">
          <h2 id="launchpad-title" className="font-marker text-display-md text-ink-900 uppercase">
            {launchpad.timelineTitle[0]}{" "}
            <span className="relative inline-block">
              {launchpad.timelineTitle[1]}
              <Doodle
                name="underline"
                strokeWidth={10}
                className="text-gold-400 absolute -bottom-2 left-0 h-4 w-full"
              />
            </span>
          </h2>
          <p className="text-body-lg mt-4">{launchpad.timelineIntro}</p>
        </div>
      </div>

      <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
        <span
          aria-hidden="true"
          className="bg-navy-900/20 absolute top-10 right-[10%] left-[10%] hidden h-0.5 lg:block"
        />
        {READINESS_AREAS.map((area, i) => (
          <li key={area.id} className="relative flex flex-col items-center text-center">
            <Reveal index={i} tilt={0} className="flex flex-col items-center">
              <span
                className={`${CIRCLES[i % 2]} font-hand relative grid size-20 place-items-center rounded-full leading-none`}
              >
                <span className="text-sm uppercase">Day</span>
                <span className="text-3xl">{area.milestoneDay}</span>
              </span>
              <h3
                className={`${TAPES[i]} font-hand text-navy-900 mt-4 -rotate-1 px-3 py-1 text-xl`}
              >
                {area.name}
              </h3>
              <ul className="text-body-sm text-ink-900 mt-3 list-disc space-y-1 pl-5 text-left">
                {area.hiredExamples.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ol>

      {/* 100 days later: the five Day 0 outcomes */}
      <div className="mt-16 border-t-2 border-dashed pt-12">
        <Sticker tilt={-3} className="font-marker text-xl uppercase">
          {launchpad.later}
        </Sticker>
        <p className="font-marker text-heading-lg text-ink-900 mt-6 uppercase">
          {launchpad.answer}
        </p>
        <p className="font-marker text-display-md text-navy-900 mt-2 inline bg-[linear-gradient(transparent_55%,var(--color-gold-400)_55%)] uppercase">
          {launchpad.ready}
        </p>
        <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {launchpad.outcomes.map(({ title, body }, i) => (
            <li key={title} className="flex flex-col items-center text-center">
              <span
                className={`${i % 2 ? "bg-gold-400" : "bg-blue-200"} text-navy-900 grid size-16 place-items-center rounded-full`}
              >
                <Check aria-hidden="true" strokeWidth={3} className="size-9" />
              </span>
              <span className="font-marker text-navy-900 mt-3 text-lg uppercase">{title}</span>
              <span className="text-body-sm text-ink-900 font-serif">{body}</span>
            </li>
          ))}
        </ul>
        <p className="text-body-lg mx-auto mt-10 max-w-3xl text-center font-serif">
          {launchpad.closing}
        </p>
      </div>

      <div className="bg-navy-800 -mx-5 mt-12 px-6 py-10 text-center sm:-mx-10 lg:-mx-14">
        <p className="font-marker text-display-lg text-white uppercase">
          {launchpad.banner[0]} <span className="text-gold-400">{launchpad.banner[1]}</span>
        </p>
        <p className="text-body-lg text-cream-50 mx-auto mt-4 max-w-2xl font-serif">
          {launchpad.bannerBody}
        </p>
      </div>
    </NotebookSection>
  );
}
