import {
  BarChart3,
  FileText,
  Layers,
  type LucideIcon,
  Share2,
  Sprout,
  UsersRound,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { builtToLast } from "@/content/copy/story-end";
import { NotebookSection } from "./notebook-section";

const ICONS: LucideIcon[] = [Layers, UsersRound, Share2, BarChart3, FileText, Sprout];

export function BuiltToLast() {
  return (
    <NotebookSection id="built-to-last" labelledBy="last-title" variant="torn">
      <h2
        id="last-title"
        className="text-heading-xl text-navy-900 text-center font-serif font-black uppercase"
      >
        {builtToLast.title[0]} <span className="text-blue-700">{builtToLast.title[1]}</span>
      </h2>
      <p className="text-body-lg mx-auto mt-3 max-w-2xl text-center font-serif italic">
        {builtToLast.intro}
      </p>

      <ul className="mx-auto mt-10 flex max-w-4xl flex-col gap-3">
        {builtToLast.points.map(({ title, body }, i) => {
          const Icon = ICONS[i]!;
          const blue = i % 2 === 0;
          return (
            <li key={title}>
              <Reveal tilt={0}>
                <div
                  className={`${blue ? "bg-blue-100" : "bg-area-financial"} rounded-card flex items-start gap-4 p-5`}
                >
                  <span
                    className={`${blue ? "bg-blue-300" : "bg-gold-400"} text-navy-900 grid size-14 shrink-0 place-items-center rounded-full`}
                  >
                    <Icon aria-hidden="true" className="size-7" />
                  </span>
                  <div>
                    <h3 className="text-navy-900 font-serif text-lg font-black tracking-wide uppercase">
                      {title}
                    </h3>
                    <p className="text-body-sm text-ink-900 mt-1">{body}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </NotebookSection>
  );
}
