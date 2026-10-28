/**
 * Transparent mentor matching (docs/architecture.md §5). Pure and deterministic: the same student
 * and mentors always give the same suggestions, and every suggestion explains why.
 */

export const MATCH_WEIGHTS = {
  sameCity: 30,
  sameEmployer: 30,
  sameGradSchool: 30,
  sameIndustry: 20,
  samePathway: 10,
  sharedJourneyTag: 8,
} as const;

/** Every suggestion has at least one substantive reason. */
export const MIN_MATCH_SCORE = 20;
export const MAX_SHARED_TAGS = 3;
export const MAX_REASONS = 3;

export type MatchStudent = {
  pathwayId: string;
  pathwayName: string;
  targetCity: string | null;
  /** Hired: the employer from the student's offer review. */
  employer: string | null;
  /** Higher Education: the school from the student's acceptance review. */
  gradSchool: string | null;
  industry: string | null;
  journeyTags: readonly string[];
};

export type MatchMentor = {
  id: string;
  city: string | null;
  employer: string | null;
  gradSchool: string | null;
  industry: string | null;
  pathways: readonly string[];
  /** Only tags the mentor chose to display. */
  journeyTags: readonly string[];
  activeMentees: number;
  lastActiveAt: string;
};

export type MatchResult = { score: number; reasons: string[] };

const normalize = (value: string | null | undefined) =>
  (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** "Atlanta, GA" and "atlanta" are the same city; compare on the part before the comma. */
const normalizeCity = (value: string | null | undefined) => normalize(value?.split(",")[0]);

const same = (a: string, b: string) => a !== "" && a === b;

/** Short, friendly tag copy for reasons ("Also first-gen"). */
const TAG_COPY: Record<string, string> = {
  "First-Generation": "first-gen",
  "International Student": "an international student",
  "Parent / Caregiver": "a parent or caregiver",
  "Financially Independent": "financially independent",
  Relocating: "relocated",
  "Staying Local": "stayed local",
  Transfer: "a transfer student",
  Veteran: "a veteran",
};

export function scoreMentor(student: MatchStudent, mentor: MatchMentor): MatchResult {
  const matched: { weight: number; reason: string }[] = [];

  if (same(normalizeCity(student.targetCity), normalizeCity(mentor.city)))
    matched.push({ weight: MATCH_WEIGHTS.sameCity, reason: `Also lives in ${mentor.city}` });
  if (same(normalize(student.employer), normalize(mentor.employer)))
    matched.push({ weight: MATCH_WEIGHTS.sameEmployer, reason: `Works at ${mentor.employer}` });
  if (same(normalize(student.gradSchool), normalize(mentor.gradSchool)))
    matched.push({ weight: MATCH_WEIGHTS.sameGradSchool, reason: `Went to ${mentor.gradSchool}` });
  if (same(normalize(student.industry), normalize(mentor.industry)))
    matched.push({ weight: MATCH_WEIGHTS.sameIndustry, reason: `Works in ${mentor.industry}` });
  if (mentor.pathways.includes(student.pathwayId))
    matched.push({
      weight: MATCH_WEIGHTS.samePathway,
      reason: `Mentors ${student.pathwayName} students`,
    });

  const shared = mentor.journeyTags.filter((tag) => student.journeyTags.includes(tag));
  for (const tag of shared.slice(0, MAX_SHARED_TAGS))
    matched.push({
      weight: MATCH_WEIGHTS.sharedJourneyTag,
      reason: `Also ${TAG_COPY[tag] ?? tag.toLowerCase()}`,
    });

  // Stable sort keeps rule order for equal weights, so reasons read the same every time.
  const reasons = [...matched]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_REASONS)
    .map((m) => m.reason);
  return { score: matched.reduce((sum, m) => sum + m.weight, 0), reasons };
}

export type Suggestion<M extends MatchMentor> = MatchResult & { mentor: M };

/**
 * Ranked suggestions: mentors scoring at least MIN_MATCH_SCORE, highest first; ties go to the
 * mentor with fewer active mentees, then the most recently active. `exclude` hides mentors the
 * student already has an open request or connection with.
 */
export function suggestMentors<M extends MatchMentor>(
  student: MatchStudent,
  mentors: readonly M[],
  {
    exclude = new Set<string>(),
    limit = 6,
  }: { exclude?: ReadonlySet<string>; limit?: number } = {},
): Suggestion<M>[] {
  return mentors
    .filter((m) => !exclude.has(m.id))
    .map((mentor) => ({ mentor, ...scoreMentor(student, mentor) }))
    .filter((s) => s.score >= MIN_MATCH_SCORE)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.mentor.activeMentees - b.mentor.activeMentees ||
        b.mentor.lastActiveAt.localeCompare(a.mentor.lastActiveAt),
    )
    .slice(0, limit);
}

/** Industry from a destination role or major, for matching only. */
const INDUSTRY_KEYWORDS: [string, RegExp][] = [
  [
    "Technology",
    /software|computer|developer|engineer(ing)? (manager|software)|data|cyber|it |tech|ux|product/,
  ],
  ["Healthcare", /nurs|health|medical|clinic|pharm|physician|therap/],
  ["Education", /teach|educat|school|admissions|counsel(or|ing) (school|admissions)/],
  ["Engineering", /engineer|mechanical|electrical|civil|manufactur/],
  [
    "Business & Finance",
    /business|account|financ|marketing|sales|hr |human resources|logistics|supply/,
  ],
  ["Public Safety", /criminal|justice|police|law enforcement|sheriff|corrections/],
  ["Social Services", /social work|social services|nonprofit|psycholog|counsel/],
  ["Law", /law|legal|paralegal/],
  ["Science", /chemistry|biology|research|lab|physics/],
];

export function deriveIndustry(...sources: (string | null | undefined)[]): string | null {
  const text = ` ${sources.filter(Boolean).join(" ").toLowerCase()} `;
  for (const [industry, pattern] of INDUSTRY_KEYWORDS) if (pattern.test(text)) return industry;
  return null;
}
