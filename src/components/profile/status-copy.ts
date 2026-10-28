import type { PathwayId } from "@/content/pathways";

/** Status card copy per pathway (slide 7: "You did it! Now prepare for a strong start."). */
export const STATUS_COPY: Record<PathwayId, { headline: string; body: string }> = {
  hired: {
    headline: "You did it! Now prepare for a strong start.",
    body: "Your plan now focuses on the transition into your new role.",
  },
  job_search: {
    headline: "Keep going. Every step gets you closer.",
    body: "Your plan focuses on applications, interviews and the people who can open doors.",
  },
  higher_ed: {
    headline: "Your next classroom awaits. Arrive ready.",
    body: "Your plan focuses on funding, logistics and a smooth start to your program.",
  },
  entrepreneurship: {
    headline: "Build it step by step. The path is yours.",
    body: "Your plan focuses on customers, pricing and a stable personal budget.",
  },
  still_deciding: {
    headline: "Not knowing yet is okay. Let's explore.",
    body: "Your plan focuses on testing options and talking to people who've been there.",
  },
};
