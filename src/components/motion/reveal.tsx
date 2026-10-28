"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger index for groups of cards. */
  index?: number;
  /** Starting tilt in degrees, like paper being pinned down. */
  tilt?: number;
};

/**
 * Cards "drop in" like pinned paper when they scroll into view.
 * Only transforms animate: content is never hidden, so it stays visible before hydration,
 * without JavaScript, and to crawlers. Reduced motion skips the transform entirely.
 */
export function Reveal({ children, className, index = 0, tilt = -2 }: RevealProps) {
  return (
    <m.div
      className={className}
      initial={{ y: -14, rotate: tilt }}
      whileInView={{ y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: index * 0.06 }}
    >
      {children}
    </m.div>
  );
}
