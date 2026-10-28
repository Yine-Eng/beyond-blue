import { cn } from "@/lib/utils";

// One notebook ring: a grey wire loop over a punched hole. Repeated vertically.
const RING = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="34" viewBox="0 0 40 34"><circle cx="30" cy="20" r="5" fill="#1a1a1a"/><path d="M30 20 C 10 22, 2 14, 6 8 C 10 2, 24 4, 30 12" fill="none" stroke="#b9bcc4" stroke-width="4" stroke-linecap="round"/><path d="M30 20 C 12 21, 5 14, 8 9" fill="none" stroke="#e7e9ee" stroke-width="1.5" stroke-linecap="round"/></svg>`,
);

/** Decorative spiral binding down the left edge of a notebook card. The parent must be `relative`. */
export function SpiralEdge({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-y-4 -left-5 w-10", className)}
      style={{
        backgroundImage: `url("data:image/svg+xml,${RING}")`,
        backgroundRepeat: "repeat-y",
        backgroundSize: "40px 34px",
      }}
    />
  );
}
