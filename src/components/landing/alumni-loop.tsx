"use client";

import { Pause, Play } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { useEffect, useState } from "react";
import { Doodle } from "@/components/scrapbook";
import { alumniLoop } from "@/content/copy/story-end";
import { cn } from "@/lib/utils";

// Desktop: steps sit around a circle like the deck (top, right, bottom-right, bottom-left, left).
const POSITIONS = [
  "lg:left-1/2 lg:top-0 lg:-translate-x-1/2",
  "lg:right-0 lg:top-[24%]",
  "lg:right-[12%] lg:bottom-0",
  "lg:left-[12%] lg:bottom-0",
  "lg:left-0 lg:top-[24%]",
] as const;

const STEP_MS = 3500;

/** Senior → Graduate → Day +100 → Alumni → Next Senior, highlighted in turn (pausable). */
export function AlumniLoopCycle() {
  const reduceMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const playing = !paused && !reduceMotion;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setActive((i) => (i + 1) % alumniLoop.steps.length), STEP_MS);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <div>
      {!reduceMotion && (
        <div className="mb-4 flex lg:justify-end">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="text-navy-900 inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-current bg-white px-4 text-sm font-semibold"
          >
            {paused ? (
              <Play aria-hidden="true" className="size-4" />
            ) : (
              <Pause aria-hidden="true" className="size-4" />
            )}
            {paused ? "Play the loop" : "Pause the loop"}
          </button>
        </div>
      )}

      <div className="relative lg:mx-auto lg:h-[44rem] lg:max-w-4xl">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="absolute inset-[12%] hidden h-[76%] w-[76%] text-blue-500 lg:block"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="2 2"
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 hidden w-56 -translate-x-1/2 -translate-y-1/2 text-center lg:block">
          <Doodle name="circle" className="text-gold-500 mx-auto h-12 w-32" />
          <p className="font-hand text-navy-900 text-2xl">
            {alumniLoop.blueprint[0]}{" "}
            <span className="text-blue-700">{alumniLoop.blueprint[1]}</span>{" "}
            {alumniLoop.blueprint[2]}
          </p>
        </div>

        <ol className="flex flex-col gap-4">
          {alumniLoop.steps.map((step, i) => {
            const isActive = i === active;
            return (
              <li
                key={step.title}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "relative rounded-[var(--radius-card)] border-2 p-4 transition-[transform,background-color,border-color] duration-300 lg:absolute lg:w-64",
                  POSITIONS[i],
                  isActive
                    ? "border-navy-900 bg-blue-100 lg:scale-105"
                    : "bg-area-career border-transparent",
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setPaused(true);
                  }}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span className="bg-navy-900 grid size-9 shrink-0 place-items-center rounded-full font-serif font-bold text-white">
                    {i + 1}
                  </span>
                  <span>
                    <span className="text-navy-900 block font-serif text-lg font-black uppercase">
                      {step.title}
                    </span>
                    <span className="text-ink-900 block text-sm font-semibold">{step.summary}</span>
                  </span>
                </button>
                <ul className="text-body-sm text-navy-900 mt-2 list-disc pl-11">
                  {step.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
