/** Day +100 check-in wording (PRD US-D100-1). The window matches submit_day_plus_100(). */

export const CHECK_IN_WINDOW = { opens: 90, closes: 130 } as const;

export const OUTCOMES = [
  { id: "employed", label: "Working" },
  { id: "enrolled", label: "In school or a program" },
  { id: "self_employed", label: "Running my own business" },
  { id: "searching", label: "Still searching" },
  { id: "other", label: "Something else" },
] as const;

export type OutcomeId = (typeof OUTCOMES)[number]["id"];

export const USEFULNESS = [
  "Not useful",
  "A little useful",
  "Somewhat useful",
  "Very useful",
  "Extremely useful",
] as const;

export const STRESS = [
  "Much less stressed",
  "A bit less stressed",
  "About the same",
  "A bit more stressed",
  "Much more stressed",
] as const;

export const OPT_INS = [
  { id: "optInMentor", label: "Mentor a future senior (we'll start a mentor profile for you)" },
  { id: "optInSession", label: "Help lead one of the Five Core Sessions" },
  { id: "optInGive", label: "Hear how to give to the Last Mile Fund" },
] as const;
