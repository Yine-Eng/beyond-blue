import { cn } from "@/lib/utils";

// A long, irregular edge, stretched horizontally to fit any width.
const EDGE =
  "M0 10 L18 6 L31 11 L47 4 L62 9 L80 3 L96 10 L113 5 L128 12 L146 4 L160 9 L177 2 L193 10 L210 6 L224 12 L241 3 L258 9 L272 5 L290 11 L305 4 L322 10 L338 6 L355 12 L370 3 L388 9 L400 6 L400 16 L0 16 Z";

type TornEdgeProps = {
  side: "top" | "bottom";
  /** Text colour class matching the paper it extends, e.g. "text-cream-50". */
  className?: string;
};

/** Decorative torn-paper edge, drawn in `currentColor`. The parent must be `relative`. */
export function TornEdge({ side, className }: TornEdgeProps) {
  return (
    <svg
      viewBox="0 0 400 16"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "pointer-events-none absolute inset-x-0 h-3 w-full fill-current",
        side === "top" ? "bottom-full" : "top-full rotate-180",
        className,
      )}
    >
      <path d={EDGE} />
    </svg>
  );
}
