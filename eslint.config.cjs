const { defineConfig } = require("eslint/config");
const tsParser = require("@typescript-eslint/parser");
const eslintConfigPrettier = require("eslint-config-prettier");
const betterTailwindcssPlugin = require("eslint-plugin-better-tailwindcss");
const reactPlugin = require("eslint-plugin-react");
const { IMPORT_SORT_CONFIG } = require("./eslint.import-sort.cjs");

module.exports = defineConfig([
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
  IMPORT_SORT_CONFIG,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "better-tailwindcss": betterTailwindcssPlugin,
      react: reactPlugin,
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat["jsx-runtime"].rules,
      "better-tailwindcss/enforce-canonical-classes": "error",
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": [
        "error",
        {
          children: "never",
          propElementValues: "always",
          props: "never",
        },
      ],
      "react/jsx-fragments": ["error", "syntax"],
      "react/jsx-no-useless-fragment": "error",
      "react/prop-types": "off",
      "react/self-closing-comp": "error",
      "react/void-dom-elements-no-children": "error",
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles.css",
      },
      react: {
        version: "detect",
      },
    },
  },
  eslintConfigPrettier,
]);
