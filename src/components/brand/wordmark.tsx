import { cn } from "@/lib/utils";

type WordmarkProps = {
  className?: string;
  /** Script logo on a torn navy strip (deck title slide) or the serif header used in the app mockups. */
  variant?: "script" | "serif";
};

export function Wordmark({ className, variant = "script" }: WordmarkProps) {
  if (variant === "serif") {
    return (
      <span className={cn("block leading-tight", className)}>
        <span className="text-navy-900 block font-serif text-lg font-bold tracking-wide uppercase">
          Beyond Blue
        </span>
        <span className="text-caption text-ink-600 block font-normal">
          Bluefield State University
        </span>
      </span>
    );
  }
  return (
    <span className={cn("font-script text-cream-100 inline-block text-3xl", className)}>
      Beyond <span className="text-blue-300">Blue</span>
    </span>
  );
}
