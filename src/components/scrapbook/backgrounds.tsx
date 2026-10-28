import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** The deck's royal-blue sunburst. Text on it should use cream-50, white or gold-400. */
export function BurstBackground({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("bg-burst text-cream-50", className)} {...props} />;
}

/** Ruled notebook paper for empty states and the Detour builder. */
export function NotebookLines({ className, style, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-cream-50", className)}
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgb(61 133 211 / 0.22) 31px, rgb(61 133 211 / 0.22) 32px)",
        backgroundPosition: "0 12px",
        ...style,
      }}
      {...props}
    />
  );
}
