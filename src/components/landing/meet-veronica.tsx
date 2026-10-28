import { Reveal } from "@/components/motion/reveal";
import { Doodle } from "@/components/scrapbook";
import { veronica } from "@/content/copy/landing";
import { NotebookSection } from "./notebook-section";

const BUBBLES = [
  "border-blue-500 -rotate-3 sm:-left-6 sm:top-0",
  "border-orange-500 rotate-2 sm:left-24 sm:top-28",
  "border-navy-900 rotate-3 sm:right-0 sm:top-6",
] as const;

export function MeetVeronica() {
  return (
    <NotebookSection id="meet-veronica" labelledBy="veronica-title">
      <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 id="veronica-title" className="text-heading-xl font-serif font-black uppercase">
            <span className="text-ink-900 block">{veronica.eyebrow}</span>
            <span className="text-navy-900 block text-[1.4em]">{veronica.name}</span>
          </h2>
          <p className="text-heading-md mt-3 font-bold text-orange-700">{veronica.countdown}</p>
          <p className="text-body-lg mt-5 font-serif first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-6xl first-letter:leading-none">
            {veronica.story}
          </p>
          <p className="text-body-lg mt-5 font-serif font-semibold">{veronica.prepared}</p>
          <p className="text-body-lg mt-3 font-bold text-orange-700">{veronica.question}</p>
          <p className="text-heading-xl text-navy-900 mt-8 font-serif font-black uppercase">
            {veronica.welcome[0]} <span className="block sm:ml-24">{veronica.welcome[1]}</span>
          </p>
        </div>

        <Reveal tilt={3} className="relative mx-auto w-full max-w-sm">
          <ul
            aria-label="Questions on Veronica's mind"
            className="mb-6 flex flex-wrap justify-center gap-3 sm:absolute sm:inset-x-0 sm:-top-6 sm:mb-0 sm:block sm:h-40"
          >
            {veronica.thoughts.map((thought, i) => (
              <li
                key={thought}
                className={`font-hand text-navy-900 rounded-[50%] border-2 bg-white px-5 py-3 text-xl sm:absolute ${BUBBLES[i]}`}
              >
                {thought}
              </li>
            ))}
          </ul>
          <figure className="shadow-paper-lg relative mx-auto w-64 rotate-2 bg-white p-3 pb-12 sm:mt-40">
            <div
              aria-hidden="true"
              className="relative grid aspect-square place-items-center overflow-hidden bg-blue-100"
            >
              <span className="font-marker text-navy-900 text-[7rem] leading-none">V</span>
              <Doodle name="sparkle" className="text-gold-500 absolute top-3 right-3 size-10" />
            </div>
            <figcaption className="font-hand text-navy-900 absolute inset-x-0 bottom-3 text-center text-xl">
              Veronica · Class of 2027
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </NotebookSection>
  );
}
