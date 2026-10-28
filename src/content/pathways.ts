import type { PathwayId } from "@/lib/design/tokens";

export type { PathwayId };

export type Pathway = {
  id: PathwayId;
  name: string;
  /** First-person line students pick from ("I already have a job."). */
  selfDescription: string;
  /** Pathway focus areas from the deck. */
  focus: readonly [string, string, string];
};

/** The five Beyond Blue pathways (deck slide "Beyond Blue has 5 pathways"). Shared by the site and app. */
export const PATHWAYS: readonly Pathway[] = [
  {
    id: "hired",
    name: "Hired",
    selfDescription: "I already have a job.",
    focus: ["Relocation planning", "Benefits and onboarding", "First paycheck prep"],
  },
  {
    id: "job_search",
    name: "Job Search",
    selfDescription: "I'm looking for work.",
    focus: ["Applications and resumes", "Interview preparation", "Networking"],
  },
  {
    id: "higher_ed",
    name: "Higher Education",
    selfDescription: "I'm continuing my education.",
    focus: ["Graduate school", "Funding and scholarships", "Transition planning"],
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship",
    selfDescription: "I'm building my own path.",
    focus: ["Business setup", "Pricing and customers", "Financial planning"],
  },
  {
    id: "still_deciding",
    name: "Still Deciding",
    selfDescription: "I'm figuring out what comes next.",
    focus: ["Career test-drives", "Alumni conversations", "Next-step planning"],
  },
];

export function getPathway(id: PathwayId): Pathway {
  const pathway = PATHWAYS.find((p) => p.id === id);
  if (!pathway) throw new Error(`Unknown pathway: ${id}`);
  return pathway;
}
