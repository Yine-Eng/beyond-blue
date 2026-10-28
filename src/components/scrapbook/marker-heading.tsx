import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Doodle } from "./doodle";

type MarkerHeadingProps = {
  as?: "h1" | "h2" | "h3";
  children: ReactNode;
  /** Gold marker underline drawn under the heading. */
  underline?: boolean;
  animated?: boolean;
  className?: string;
};

/** Marker-caps headline like "VERONICA STARTS HER PATH." */
export function MarkerHeading({
  as: Tag = "h2",
  children,
  underline = false,
  animated = false,
  className,
}: MarkerHeadingProps) {
  return (
    <Tag className={cn("font-marker text-display-md relative inline-block uppercase", className)}>
      <span className="relative z-10">{children}</span>
      {underline && (
        <Doodle
          name="underline"
          animated={animated}
          strokeWidth={10}
          className="text-gold-400 absolute -bottom-2 left-0 z-0 h-5 w-full opacity-90"
        />
      )}
    </Tag>
  );
}
