import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-config-next already registers the jsx-a11y plugin; enable its full recommended set.
    files: ["**/*.{jsx,tsx}"],
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "cn",
              message: 'Import cn from "@/lib/utils" (it knows the custom type scale).',
            },
          ],
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // The configured merger itself is the only place allowed to use the cn package.
    files: ["src/lib/utils.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "deck/**",
    "playwright-report/**",
    "test-results/**",
    "src/lib/supabase/database.types.ts",
  ]),
]);

export default eslintConfig;
