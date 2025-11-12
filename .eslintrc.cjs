/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["node_modules/", ".next/", "dist/"],
  rules: {
    "no-console": ["warn", { allow: ["info", "error"] }],
  },
};
