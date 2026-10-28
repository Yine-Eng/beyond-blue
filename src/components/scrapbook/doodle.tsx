import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/** Hand-drawn strokes from the deck. Paths use pathLength=1 so the draw-on animation is size-independent. */
const DOODLES = {
  arrow: {
    viewBox: "0 0 120 60",
    paths: ["M6 44 C 30 52, 62 50, 92 26", "M78 22 C 84 24, 90 25, 96 24 C 95 30, 94 36, 95 42"],
  },
  star: {
    viewBox: "0 0 60 60",
    paths: ["M30 5 L36 23 L55 24 L40 36 L46 55 L30 44 L14 55 L20 36 L5 24 L24 23 Z"],
  },
  circle: {
    viewBox: "0 0 200 80",
    paths: [
      "M150 12 C 110 2, 30 6, 12 34 C -2 58, 70 76, 130 70 C 196 64, 204 30, 160 14 C 140 8, 110 8, 96 10",
    ],
  },
  underline: {
    viewBox: "0 0 300 24",
    paths: [
      "M4 16 C 60 8, 120 6, 180 10 C 220 12, 260 14, 296 8",
      "M40 20 C 110 14, 190 14, 270 16",
    ],
  },
  squiggle: {
    viewBox: "0 0 120 24",
    paths: ["M4 12 C 14 2, 24 2, 34 12 S 54 22, 64 12 S 84 2, 94 12 S 112 22, 116 12"],
  },
  sparkle: {
    viewBox: "0 0 60 60",
    paths: ["M14 22 L4 14", "M30 14 L30 2", "M46 22 L56 14"],
  },
} as const;

export type DoodleName = keyof typeof DOODLES;

type DoodleProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: DoodleName;
  /** Animate the stroke drawing on (disabled automatically under prefers-reduced-motion). */
  animated?: boolean;
  strokeWidth?: number;
};

/** Decorative only: always hidden from assistive technology. */
export function Doodle({
  name,
  animated = false,
  strokeWidth = 4,
  className,
  ...props
}: DoodleProps) {
  const { viewBox, paths } = DOODLES[name];
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("overflow-visible", className)}
      {...props}
    >
      {paths.map((d, i) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          className={animated ? "animate-draw" : undefined}
          style={animated ? { animationDelay: `${i * 180}ms` } : undefined}
        />
      ))}
    </svg>
  );
}
