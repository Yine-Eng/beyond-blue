import type { PathwayId } from "./pathways";

/**
 * Detour Challenge prompts (PRD US-DETOUR-1). The five steps fill the "detour-plan" form, and the
 * wording adapts to the student's pathway.
 */
export type DetourPrompts = {
  planA: { prompt: string; placeholder: string };
  /** The detour most students on this pathway should plan for first. */
  likelyDetour: string;
  signs: { prompt: string; placeholder: string };
  planB: { prompt: string; placeholder: string };
  budget: { prompt: string };
};

export const DETOUR_STEPS = [
  { field: "planA", title: "Name your plan A" },
  { field: "detour", title: "Pick your most likely detour" },
  { field: "signs", title: "Spot the early warning signs" },
  { field: "planB", title: "Write your plan B" },
  { field: "minBudget", title: "Set your stay-afloat budget" },
] as const;

export type DetourField = (typeof DETOUR_STEPS)[number]["field"];

export const DETOUR_PROMPTS: Record<PathwayId, DetourPrompts> = {
  hired: {
    planA: {
      prompt: "What's the job you're counting on?",
      placeholder: "Start as an Associate Program Manager in Atlanta on June 14.",
    },
    likelyDetour: "Start date delayed",
    signs: {
      prompt: "What would tell you early that the offer or start date is wobbling?",
      placeholder: "Onboarding paperwork goes quiet, my manager changes, the start date slips.",
    },
    planB: {
      prompt: "If your start date moves or the offer falls through, what's your first step?",
      placeholder: "Restart applications to my top 10 list and call my Career Services advisor.",
    },
    budget: { prompt: "What's the least you need each month if your first paycheck is late?" },
  },
  job_search: {
    planA: {
      prompt: "What role and kind of employer are you aiming for?",
      placeholder: "An entry-level data analyst role in Charlotte or Raleigh by August.",
    },
    likelyDetour: "Other",
    signs: {
      prompt: "What would tell you the search is taking longer than planned?",
      placeholder: "Fewer than 3 interviews by graduation, or no callbacks from 30 applications.",
    },
    planB: {
      prompt: "If the search runs long, how will you keep going and who will you call?",
      placeholder: "Take a bridge job, widen my cities and book a resume review with an alum.",
    },
    budget: { prompt: "What's the least you need each month while you keep searching?" },
  },
  higher_ed: {
    planA: {
      prompt: "Which program are you counting on, and how is it funded?",
      placeholder: "MPH at WVU this fall with a graduate assistantship.",
    },
    likelyDetour: "Funding denied",
    signs: {
      prompt: "What would tell you early that admission or funding might not come through?",
      placeholder: "No assistantship offer by April 15, or my aid package comes in short.",
    },
    planB: {
      prompt: "If funding doesn't come through, what's your first step and who do you call?",
      placeholder:
        "Ask Financial Aid about deferral, and apply to two research jobs for a gap year.",
    },
    budget: { prompt: "What's the least you need each month if you start school without aid?" },
  },
  entrepreneurship: {
    planA: {
      prompt: "What are you launching, and what does success look like by fall?",
      placeholder: "A mobile detailing business with 20 regular customers by September.",
    },
    likelyDetour: "Other",
    signs: {
      prompt: "What numbers would tell you the business needs a rethink?",
      placeholder: "Fewer than 5 paying customers by July, or costs above revenue for 2 months.",
    },
    planB: {
      prompt: "If revenue is slower than planned, how will you keep the lights on?",
      placeholder: "Take part-time work 20 hours a week and meet my small-business mentor monthly.",
    },
    budget: { prompt: "What's the least you need each month before the business pays you?" },
  },
  still_deciding: {
    planA: {
      prompt: "What's your best current guess for your next step?",
      placeholder: "A year in a paid fellowship while I test teaching and nonprofit work.",
    },
    likelyDetour: "Didn't get in",
    signs: {
      prompt: "What would tell you this path isn't the right fit?",
      placeholder: "Two career test-drives in a row that leave me drained, not curious.",
    },
    planB: {
      prompt: "If your first guess doesn't work out, what will you try next and who will you ask?",
      placeholder: "Book three alumni conversations in different fields and revisit my shortlist.",
    },
    budget: { prompt: "What's the least you need each month while you figure it out?" },
  },
};
