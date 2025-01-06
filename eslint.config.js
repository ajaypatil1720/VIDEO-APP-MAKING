import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"], // Only for JS-related files
    rules: {
      "prefer-const": "warn", // Warn about let used instead of const
      "no-constant-binary-expression": "error", // Error for constant binary expressions
      "no-unused-vars": "warn",
      "no-undef": "warn",

      semi: ["error", "always"], // Enforce semicolons at the end of statements
      quotes: ["error", "double"], // Enforce double quotes for strings
      eqeqeq: "error", // Enforce strict equality (===)
      "no-console": "off", // Allow console.log statements (disable this rule)
    },
  },
];
