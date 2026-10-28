import { Reveal } from "@/components/motion/reveal";
import { Doodle, Sticker } from "@/components/scrapbook";
import { notAlone } from "@/content/copy/landing";
import { NotebookSection } from "./notebook-section";

const POLAROIDS = [
  { label: "Still Deciding", tilt: -4, tone: "bg-area-network" },
  { label: "Graduate School", tilt: 3, tone: "bg-area-relocation" },
  { label: "Job Search", tilt: -2, tone: "bg-area-financial" },
] as const;

export function NotAlone() {
  return (
    <NotebookSection id="not-alone" labelledBy="not-alone-title">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 id="not-alone-title" className="font-marker text-display-md leading-tight uppercase">
            <span className="text-ink-900 block">{notAlone.title[0]}</span>
            <span className="text-navy-900 relative inline-block text-[1.5em]">
              {notAlone.title[1]}
              <Doodle
                name="underline"
                strokeWidth={10}
                className="text-gold-400 absolute -bottom-3 left-0 -z-0 h-5 w-full"
              />
            </span>
          </h2>

          <figure className="mt-8 flex items-center gap-4">
            <span className="bg-navy-900 font-marker text-display-lg -rotate-2 px-4 py-2 text-white">
              {notAlone.stat}
            </span>
            <figcaption className="text-body-lg font-serif">{notAlone.statText}</figcaption>
          </figure>
          <p className="text-body-lg mt-6 font-serif text-orange-700">{notAlone.paths}</p>
        </div>

        <ul
          aria-label="Where seniors are headed"
          className="grid grid-cols-3 items-end gap-3 self-center"
        >
          {POLAROIDS.map(({ label, tilt, tone }, i) => (
            <li key={label}>
              <Reveal index={i} tilt={tilt * 2}>
                <div style={{ rotate: `${tilt}deg` }} className="shadow-paper bg-white p-2 pb-1">
                  <div aria-hidden="true" className={`${tone} aspect-[4/5]`} />
                  <p className="font-hand text-navy-900 py-1 text-center text-base leading-tight sm:text-lg">
                    {label}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12">
        <p className="bg-navy-900 font-marker text-display-md inline-block -rotate-1 px-6 py-2 text-white uppercase">
          {notAlone.banner}
        </p>
        <p className="text-heading-md mt-5 font-bold text-orange-700">{notAlone.subtitle}</p>
        <p className="text-body-lg mt-3 max-w-4xl font-serif">{notAlone.description}</p>
        <Sticker tone="cream" tilt={0} className="mt-6 text-base">
          {notAlone.source}
        </Sticker>
      </div>
    </NotebookSection>
  );
}
