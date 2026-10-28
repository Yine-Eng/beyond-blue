/** Conventional Commits with the scopes from docs/git-workflow.md §3. */
const scopes = [
  "landing",
  "auth",
  "onboarding",
  "plan",
  "tasks",
  "profile",
  "network",
  "pathways",
  "detour",
  "launch-file",
  "fund",
  "staff",
  "day-plus-100",
  "demo",
  "pwa",
  "a11y",
  "ui",
  "db",
  "content",
  "deps",
  "ci",
  "release",
  "adr",
  "repo",
  "main",
];

const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", scopes],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "body-max-line-length": [1, "always", 100],
  },
};

export default config;
