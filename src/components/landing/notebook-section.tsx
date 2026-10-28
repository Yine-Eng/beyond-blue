import type { ReactNode } from "react";
import { PaperCard, Tape } from "@/components/scrapbook";
import { cn } from "@/lib/utils";

type NotebookSectionProps = {
  id: string;
  /** id of the section's heading, for aria-labelledby. */
  labelledBy: string;
  children: ReactNode;
  variant?: "spiral" | "torn";
  className?: string;
};

/** One "slide" of the story: a sheet of notebook paper on the sunburst, like the deck. */
export function NotebookSection({
  id,
  labelledBy,
  children,
  variant = "spiral",
  className,
}: NotebookSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className="defer-render scroll-mt-20 px-4 py-8 sm:px-6 sm:py-12"
    >
      <PaperCard
        variant={variant}
        className={cn("mx-auto max-w-6xl px-5 py-10 sm:px-10 sm:py-14 lg:px-14", className)}
      >
        <Tape position="top-right" />
        {children}
      </PaperCard>
    </section>
  );
}
