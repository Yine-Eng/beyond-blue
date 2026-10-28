import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  kraft: "bg-cream-200/85",
  blue: "bg-blue-200/85",
  pink: "bg-pink-300/85",
  gold: "bg-gold-400/85",
} as const;

const POSITIONS = {
  "top-left": "-top-3 -left-4 -rotate-[24deg]",
  "top-right": "-top-3 -right-4 rotate-[24deg]",
  "top-center": "-top-3 left-1/2 -translate-x-1/2 -rotate-2",
  "bottom-left": "-bottom-3 -left-4 rotate-[24deg]",
  "bottom-right": "-bottom-3 -right-4 -rotate-[24deg]",
} as const;

// Jagged, torn ends like real masking tape.
const TORN_ENDS: CSSProperties = {
  clipPath:
    "polygon(3% 0, 97% 0, 100% 18%, 96% 36%, 100% 55%, 97% 74%, 100% 100%, 3% 100%, 0 82%, 4% 63%, 0 45%, 4% 27%, 0 9%)",
};

type TapeProps = {
  tone?: keyof typeof TONES;
  position?: keyof typeof POSITIONS;
  className?: string;
};

/** Decorative masking tape for a card corner. The parent must be `relative`. */
export function Tape({ tone = "kraft", position = "top-left", className }: TapeProps) {
  return (
    <span
      aria-hidden="true"
      style={TORN_ENDS}
      className={cn(
        "pointer-events-none absolute z-10 block h-7 w-24 shadow-sm",
        TONES[tone],
        POSITIONS[position],
        className,
      )}
    />
  );
}
