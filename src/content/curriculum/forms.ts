/**
 * Structured "form" outputs. Each task with a form output names one of these; the task sheet
 * renders the fields and validates answers against them (no SSNs, bank details or exact salaries).
 */

export type FormField =
  | { name: string; label: string; kind: "text"; max?: number; required?: boolean; help?: string }
  | {
      name: string;
      label: string;
      kind: "textarea";
      max?: number;
      required?: boolean;
      help?: string;
    }
  | { name: string; label: string; kind: "money"; required?: boolean; help?: string }
  | { name: string; label: string; kind: "date"; required?: boolean; help?: string }
  | {
      name: string;
      label: string;
      kind: "select";
      options: readonly string[];
      required?: boolean;
      help?: string;
    };

export type FormDef = { title: string; intro: string; fields: readonly FormField[] };

export const FORMS = {
  "goals-90": {
    title: "First 90-day goals",
    intro: "Three goals for your first 90 days after graduation, and how you'll know you hit them.",
    fields: [
      { name: "goal1", label: "Goal 1", kind: "text", max: 160, required: true },
      { name: "goal2", label: "Goal 2", kind: "text", max: 160, required: true },
      { name: "goal3", label: "Goal 3", kind: "text", max: 160 },
      {
        name: "measure",
        label: "How will you measure success?",
        kind: "textarea",
        max: 600,
        required: true,
      },
    ],
  },
  "budget-90": {
    title: "First 90-day budget",
    intro:
      "Monthly estimates in whole dollars. Use ranges or rough numbers; never enter account details.",
    fields: [
      { name: "income", label: "Expected monthly take-home income", kind: "money", required: true },
      { name: "housing", label: "Housing (rent and utilities)", kind: "money", required: true },
      { name: "transport", label: "Transportation", kind: "money", required: true },
      { name: "food", label: "Food", kind: "money", required: true },
      { name: "loans", label: "Student loan or debt payments", kind: "money" },
      { name: "savings", label: "Savings and emergency fund", kind: "money", required: true },
      { name: "other", label: "Everything else", kind: "money" },
      { name: "notes", label: "Notes and assumptions", kind: "textarea", max: 600 },
    ],
  },
  "offer-review": {
    title: "Offer review",
    intro: "The key details of an offer or acceptance, so nothing surprises you on day one.",
    fields: [
      {
        name: "organization",
        label: "Organization or program",
        kind: "text",
        max: 120,
        required: true,
      },
      { name: "role", label: "Role or program name", kind: "text", max: 120, required: true },
      { name: "startDate", label: "Start date", kind: "date", required: true },
      { name: "location", label: "Location", kind: "text", max: 120, required: true },
      {
        name: "benefits",
        label: "Benefits and key terms",
        kind: "textarea",
        max: 800,
        required: true,
      },
      { name: "questions", label: "Questions to ask before you sign", kind: "textarea", max: 600 },
    ],
  },
  "housing-compare": {
    title: "Housing comparison",
    intro: "Compare at least two options side by side.",
    fields: [
      {
        name: "optionA",
        label: "Option A (area and type)",
        kind: "text",
        max: 160,
        required: true,
      },
      { name: "costA", label: "Option A monthly cost", kind: "money", required: true },
      {
        name: "optionB",
        label: "Option B (area and type)",
        kind: "text",
        max: 160,
        required: true,
      },
      { name: "costB", label: "Option B monthly cost", kind: "money", required: true },
      {
        name: "commute",
        label: "Commute and safety notes",
        kind: "textarea",
        max: 600,
        required: true,
      },
      { name: "choice", label: "Your choice and why", kind: "textarea", max: 600, required: true },
    ],
  },
  "action-plan": {
    title: "Action plan",
    intro: "A short plan with concrete next steps and dates.",
    fields: [
      {
        name: "objective",
        label: "What are you trying to achieve?",
        kind: "text",
        max: 200,
        required: true,
      },
      {
        name: "steps",
        label: "Next steps (one per line)",
        kind: "textarea",
        max: 1000,
        required: true,
      },
      { name: "deadline", label: "Target date", kind: "date", required: true },
      { name: "support", label: "Who can help?", kind: "text", max: 200 },
    ],
  },
  "mentor-conversation": {
    title: "Mentor conversation",
    intro: "Log a real conversation with a mentor or alum.",
    fields: [
      {
        name: "who",
        label: "Who did you talk to? (first name and role)",
        kind: "text",
        max: 120,
        required: true,
      },
      { name: "date", label: "Date", kind: "date", required: true },
      {
        name: "learned",
        label: "Three things you learned",
        kind: "textarea",
        max: 800,
        required: true,
      },
      { name: "followUp", label: "Your follow-up step", kind: "text", max: 200, required: true },
    ],
  },
  "detour-plan": {
    title: "Detour plan",
    intro: "Your backup plan if plan A changes. The guided Detour Challenge fills this in.",
    fields: [
      { name: "planA", label: "Plan A", kind: "text", max: 200, required: true },
      {
        name: "detour",
        label: "Most likely detour",
        kind: "select",
        options: [
          "Offer rescinded",
          "Start date delayed",
          "Funding denied",
          "Didn't get in",
          "Relocation falls through",
          "Other",
        ],
        required: true,
      },
      { name: "signs", label: "Early warning signs", kind: "textarea", max: 600, required: true },
      {
        name: "planB",
        label: "Plan B: first step and who you'll call",
        kind: "textarea",
        max: 800,
        required: true,
      },
      {
        name: "minBudget",
        label: "Minimum monthly budget to stay afloat",
        kind: "money",
        required: true,
      },
    ],
  },
  reflection: {
    title: "Reflection",
    intro: "A short written reflection.",
    fields: [
      { name: "reflection", label: "Your reflection", kind: "textarea", max: 1200, required: true },
      { name: "nextStep", label: "One next step", kind: "text", max: 200, required: true },
    ],
  },
} as const satisfies Record<string, FormDef>;

export type FormId = keyof typeof FORMS;
