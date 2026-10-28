import { Reveal } from "@/components/motion/reveal";
import { principles } from "@/content/copy/landing";
import { NotebookSection } from "./notebook-section";

// Card tint and number-badge colour per principle, following the deck slide.
const TONES = [
  ["bg-area-financial", "bg-gold-400"],
  ["bg-area-career", "bg-blue-300"],
  ["bg-area-wellness", "bg-pink-300"],
  ["bg-success-50", "bg-green-400"],
  ["bg-area-network", "bg-purple-400"],
  ["bg-area-career", "bg-blue-200"],
] as const;

export function HowItWorks() {
  return (
    <NotebookSection id="how-it-works" labelledBy="how-title" variant="torn">
      <h2
        id="how-title"
        className="text-heading-xl text-ink-900 text-center font-serif font-black uppercase"
      >
        How <span className="text-navy-900">Beyond Blue</span> works
      </h2>
      <div aria-hidden="true" className="bg-navy-900 mx-auto mt-3 h-1 w-40 rounded-full" />
      <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {principles.map(({ title, body }, i) => {
          const [card, badge] = TONES[i]!;
          return (
            <li key={title}>
              <Reveal className="h-full">
                <article className={`${card} rounded-card h-full p-6`}>
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={`${badge} text-navy-900 grid size-11 shrink-0 place-items-center rounded-full font-serif text-lg font-black`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-heading-md text-ink-900 font-serif font-black uppercase">
                      <span className="sr-only">Principle {i + 1}: </span>
                      {title}
                    </h3>
                  </div>
                  <p className="text-body-sm text-ink-900 mt-4 font-serif">{body}</p>
                </article>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </NotebookSection>
  );
}
