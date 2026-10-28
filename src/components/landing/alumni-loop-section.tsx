import { Link2 } from "lucide-react";
import { alumniLoop } from "@/content/copy/story-end";
import { AlumniLoopCycle } from "./alumni-loop";
import { NotebookSection } from "./notebook-section";

export function AlumniLoopSection() {
  return (
    <NotebookSection id="alumni-loop" labelledBy="loop-title">
      <h2 id="loop-title" className="text-heading-xl text-center font-serif font-black uppercase">
        <span className="text-navy-900 block">{alumniLoop.title[0]}</span>
        <span className="block text-blue-700">{alumniLoop.title[1]}</span>
      </h2>
      <p className="text-body-lg mx-auto mt-4 max-w-3xl text-center font-serif">
        {alumniLoop.intro}
      </p>

      <div className="mt-10">
        <AlumniLoopCycle />
      </div>

      <div className="rounded-card mt-12 flex flex-col gap-4 bg-blue-100 p-6 sm:flex-row sm:items-center">
        <span className="bg-navy-900 grid size-14 shrink-0 place-items-center rounded-full text-white">
          <Link2 aria-hidden="true" className="size-7" />
        </span>
        <div>
          <h3 className="text-navy-900 font-serif text-xl font-black tracking-wide uppercase">
            {alumniLoop.matching.title}
          </h3>
          <p className="text-ink-900 mt-1">{alumniLoop.matching.body}</p>
          <ul className="text-navy-900 mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
            {alumniLoop.matching.criteria.map((c) => (
              <li key={c} className="before:mr-2 before:text-blue-700 before:content-['•']">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </NotebookSection>
  );
}
