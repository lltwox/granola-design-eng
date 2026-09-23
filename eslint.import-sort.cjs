const simpleImportSort = require("eslint-plugin-simple-import-sort");

const IMPORT_SORT_GROUPS = [
  ["\\u0000$"],
  ["^\\u0000"],
  ["^node:"],
  [
    "^react$",
    "^react",
    "^expo",
    "^@expo",
    "^@react-navigation",
    "^react-native",
  ],
  ["^@?\\w"],
  ["^@"],
  ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
  ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
  ["^.+\\.s?css$"],
];

const IMPORT_SORT_CONFIG = {
  files: ["**/*.{js,jsx,ts,tsx}"],
  plugins: {
    "simple-import-sort": simpleImportSort,
  },
  rules: {
    "simple-import-sort/exports": "warn",
    "simple-import-sort/imports": [
      "warn",
      {
        groups: IMPORT_SORT_GROUPS,
      },
    ],
  },
};

module.exports = {
  IMPORT_SORT_CONFIG,
};
