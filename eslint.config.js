import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      ".next",
      "node_modules",
      "src/components/ui/**/*",
      "src/components/NavLink.tsx",
      "src/hooks/**/*",
      "src/test/**/*",
      "playwright*.ts",
      "vitest.config.ts",
      "tailwind.config.ts",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/app/**/*.{ts,tsx}", "src/components/poll/**/*.{ts,tsx}", "src/lib/**/*.ts", "prisma/seed.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
