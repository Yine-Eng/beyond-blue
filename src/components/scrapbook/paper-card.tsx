import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { SpiralEdge } from "./spiral-edge";
import { TornEdge } from "./torn-edge";

const SURFACES = {
  cream: { card: "bg-cream-50 text-ink-900", edge: "text-cream-50" },
  kraft: { card: "bg-cream-200 text-ink-900", edge: "text-cream-200" },
  white: { card: "bg-white text-ink-900", edge: "text-white" },
  navy: { card: "bg-navy-800 text-cream-50", edge: "text-navy-800" },
} as const;

type PaperCardProps = ComponentProps<"div"> & {
  /** clean: app-screen card · torn: ripped top and bottom · spiral: notebook binding · pinned: slight tilt */
  variant?: "clean" | "torn" | "spiral" | "pinned";
  surface?: keyof typeof SURFACES;
  /** Tilt in degrees for the pinned variant (-3..3). Flattened under reduced motion. */
  tilt?: number;
};

/** A sheet of paper from the deck. Content is fully readable without the decorations. */
export function PaperCard({
  variant = "clean",
  surface = "cream",
  tilt = -1.5,
  className,
  style,
  children,
  ...props
}: PaperCardProps) {
  const { card, edge } = SURFACES[surface];
  const torn = variant === "torn";

  return (
    <div
      data-slot="paper-card"
      data-variant={variant}
      className={cn(
        "relative p-5 sm:p-6",
        card,
        torn ? "shadow-none" : "shadow-paper rounded-card",
        variant === "spiral" && "pl-10 sm:pl-12",
        variant === "pinned" && "motion-safe:rotate-(--tilt)",
        className,
      )}
      style={variant === "pinned" ? { ...style, ["--tilt" as string]: `${tilt}deg` } : style}
      {...props}
    >
      {torn && <TornEdge side="top" className={edge} />}
      {variant === "spiral" && <SpiralEdge />}
      {children}
      {torn && <TornEdge side="bottom" className={edge} />}
    </div>
  );
}
