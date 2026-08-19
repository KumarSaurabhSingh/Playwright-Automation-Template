/**
 * @file prettier.config.js
 * @description Prettier formatting rules — keeps every file in the repo formatted
 * identically. Run `npm run format` to auto-format, `npm run format:check` to verify.
 */
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
  semi: true,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'auto',
};
