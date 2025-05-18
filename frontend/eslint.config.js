import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: ["dist"], // Ignore the 'dist' folder
  },
  {
    extends: [
      js.configs.recommended,
      "plugin:@typescript-eslint/recommended", // Extend TypeScript ESLint recommended rules
    ],
    files: ["**/*.{ts,tsx}"], // Apply to TypeScript and TSX files
    languageOptions: {
      ecmaVersion: 2020, // Set ECMA Script version
      globals: globals.browser, // Include browser globals
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...reactHooks.configs.recommended.rules, // Use react-hooks recommended rules
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true }, // Allow constant exports in React Refresh
      ],
      "@typescript-eslint/no-unused-vars": "off", // Disable 'no-unused-vars' for TypeScript
      "@typescript-eslint/no-explicit-any": "error", // Disallow 'any' in TypeScript
    },
  },
];
