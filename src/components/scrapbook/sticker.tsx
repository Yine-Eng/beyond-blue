import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  gold: "bg-gold-400 text-navy-900",
  blue: "bg-blue-200 text-navy-900",
  pink: "bg-pink-300 text-navy-900",
  cream: "bg-cream-50 text-navy-900",
  navy: "bg-navy-900 text-white",
} as const;

type StickerProps = ComponentProps<"span"> & {
  tone?: keyof typeof TONES;
  /** Tilt in degrees. Flattened under reduced motion. */
  tilt?: number;
};

/** A tilted handwritten label, like "Selected Pathway:" or "68%". */
export function Sticker({ tone = "gold", tilt = -3, className, style, ...props }: StickerProps) {
  return (
    <span
      className={cn(
        "font-hand shadow-paper inline-block rounded-sm px-3 py-1 text-lg leading-tight motion-safe:rotate-(--tilt)",
        TONES[tone],
        className,
      )}
      style={{ ...style, ["--tilt" as string]: `${tilt}deg` }}
      {...props}
    />
  );
}
