// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  MATCH_WEIGHTS,
  type MatchMentor,
  type MatchStudent,
  deriveIndustry,
  scoreMentor,
  suggestMentors,
} from "./matching";

const student: MatchStudent = {
  pathwayId: "hired",
  pathwayName: "Hired",
  targetCity: "Atlanta, GA",
  employer: "Peachtree Digital",
  gradSchool: null,
  industry: "Technology",
  journeyTags: ["First-Generation", "Relocating", "Financially Independent"],
};

const mentor = (overrides: Partial<MatchMentor> = {}): MatchMentor => ({
  id: "m",
  city: null,
  employer: null,
  gradSchool: null,
  industry: null,
  pathways: [],
  journeyTags: [],
  activeMentees: 0,
  lastActiveAt: "2026-10-01T00:00:00Z",
  ...overrides,
});

describe("scoreMentor", () => {
  it("scores each rule with its weight and explains it", () => {
    expect(scoreMentor(student, mentor({ city: "atlanta" }))).toEqual({
      score: MATCH_WEIGHTS.sameCity,
      reasons: ["Also lives in atlanta"],
    });
    expect(scoreMentor(student, mentor({ employer: "peachtree digital" })).score).toBe(30);
    expect(scoreMentor(student, mentor({ industry: "Technology" })).reasons).toEqual([
      "Works in Technology",
    ]);
    expect(scoreMentor(student, mentor({ pathways: ["hired"] })).reasons).toEqual([
      "Mentors Hired students",
    ]);
    expect(
      scoreMentor(
        { ...student, gradSchool: "Georgia State University" },
        mentor({ gradSchool: "Georgia State University" }),
      ).reasons,
    ).toEqual(["Went to Georgia State University"]);
  });

  it("matches cities on the part before the comma", () => {
    expect(scoreMentor(student, mentor({ city: "Atlanta, Georgia" })).score).toBe(30);
    expect(scoreMentor(student, mentor({ city: "Atlantic City, NJ" })).score).toBe(0);
  });

  it("never matches on missing values", () => {
    expect(scoreMentor({ ...student, employer: null }, mentor({ employer: null })).score).toBe(0);
    expect(scoreMentor({ ...student, targetCity: "" }, mentor({ city: "" })).score).toBe(0);
  });

  it("caps shared journey tags at three", () => {
    const result = scoreMentor(
      { ...student, journeyTags: ["First-Generation", "Relocating", "Veteran", "Transfer"] },
      mentor({ journeyTags: ["First-Generation", "Relocating", "Veteran", "Transfer"] }),
    );
    expect(result.score).toBe(3 * MATCH_WEIGHTS.sharedJourneyTag);
    expect(result.reasons).toEqual(["Also first-gen", "Also relocated", "Also a veteran"]);
  });

  it("returns the top three reasons in weight order", () => {
    const result = scoreMentor(
      student,
      mentor({
        city: "Atlanta, GA",
        employer: "Peachtree Digital",
        industry: "Technology",
        pathways: ["hired"],
        journeyTags: ["First-Generation"],
      }),
    );
    expect(result.score).toBe(30 + 30 + 20 + 10 + 8);
    expect(result.reasons).toEqual([
      "Also lives in Atlanta, GA",
      "Works at Peachtree Digital",
      "Works in Technology",
    ]);
  });
});

describe("suggestMentors", () => {
  const mentors = [
    mentor({ id: "weak", pathways: ["hired"] }), // 10: below the minimum
    mentor({ id: "city", city: "Atlanta, GA" }),
    mentor({ id: "busy-city", city: "Atlanta, GA", activeMentees: 2 }),
    mentor({ id: "old-city", city: "Atlanta, GA", lastActiveAt: "2026-01-01T00:00:00Z" }),
    mentor({ id: "best", city: "Atlanta, GA", employer: "Peachtree Digital" }),
  ];

  it("drops mentors below the minimum score and ranks by score", () => {
    const ids = suggestMentors(student, mentors).map((s) => s.mentor.id);
    expect(ids[0]).toBe("best");
    expect(ids).not.toContain("weak");
  });

  it("breaks ties by fewest active mentees, then most recent activity", () => {
    const ids = suggestMentors(student, mentors).map((s) => s.mentor.id);
    expect(ids.slice(1)).toEqual(["city", "old-city", "busy-city"]);
  });

  it("excludes mentors the student already asked and respects the limit", () => {
    const ids = suggestMentors(student, mentors, { exclude: new Set(["best"]), limit: 2 }).map(
      (s) => s.mentor.id,
    );
    expect(ids).toEqual(["city", "old-city"]);
  });
});

describe("deriveIndustry", () => {
  it.each([
    ["Program Manager → Software Engineer", "Computer Science", "Technology"],
    ["Registered Nurse", null, "Healthcare"],
    [null, "Criminal Justice", "Public Safety"],
    [null, "Accounting", "Business & Finance"],
    [null, null, null],
  ] as const)("%s / %s → %s", (role, major, industry) => {
    expect(deriveIndustry(role, major)).toBe(industry);
  });
});
