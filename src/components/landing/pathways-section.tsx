import { pathwaysSection } from "@/content/copy/landing";
import { NotebookSection } from "./notebook-section";
import { PathwaysExplorer } from "./pathways-explorer";

export function PathwaysSection() {
  return (
    <NotebookSection id="pathways" labelledBy="pathways-title">
      <h2
        id="pathways-title"
        className="text-heading-xl text-ink-900 font-serif font-black uppercase"
      >
        {pathwaysSection.title}
      </h2>
      <p className="text-heading-md mt-2 font-serif font-black uppercase sm:text-2xl">
        <span className="text-blue-700">{pathwaysSection.subtitle[0]}</span>{" "}
        <span className="text-ink-900">{pathwaysSection.subtitle[1]}</span>
      </p>
      <div className="mt-8">
        <PathwaysExplorer />
      </div>
    </NotebookSection>
  );
}
