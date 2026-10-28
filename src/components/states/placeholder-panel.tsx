import type { ReactNode } from "react";
import { Doodle, NotebookLines } from "@/components/scrapbook";

type PlaceholderPanelProps = {
  title: string;
  children: ReactNode;
};

/** Notebook-paper empty state used for screens that aren't built yet. */
export function PlaceholderPanel({ title, children }: PlaceholderPanelProps) {
  return (
    <NotebookLines className="shadow-paper relative rounded-[var(--radius-card)] px-6 py-8">
      <Doodle name="star" className="text-gold-500 absolute top-4 right-4 size-8" />
      <p className="font-hand text-navy-900 text-2xl">{title}</p>
      <div className="text-ink-600 mt-2 max-w-prose">{children}</div>
    </NotebookLines>
  );
}
