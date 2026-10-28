import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Starting tilt in degrees, like paper being pinned down. */
  tilt?: number;
};

/**
 * Cards "drop in" like pinned paper as they scroll into view.
 * Pure CSS scroll-driven animation (see `.reveal` in globals.css): no JavaScript, content is
 * always visible, browsers without `animation-timeline` show it static, and reduced motion
 * turns it off.
 */
export function Reveal({ children, className, tilt = -2 }: RevealProps) {
  return (
    <div
      className={cn("reveal", className)}
      style={{ "--reveal-tilt": `${tilt}deg` } as CSSProperties}
    >
      {children}
    </div>
  );
}
