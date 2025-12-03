import eslint from "eslint/config";
import tseslint from "typescript-eslint";

export default eslint.defineConfig(
  ...tseslint.configs.recommended,

  {
    // extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
      globals: {
        node: true,
        es2021: true,
      },
    },

    rules: {
      "no-unused-vars": "off",
      "no-fallthrough": "off",

      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  {
    files: [".eslintrc.js", ".eslintrc.cjs", "eslint.config.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        node: true,
      },
    },
  },

  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.test.js", "**/*.test.jsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    ignores: ["**/dist/*", "src/parser/antlr", "coverage"],
  },
);
