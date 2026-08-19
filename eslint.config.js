/**
 * @file eslint.config.js
 * @description ESLint flat config (ESLint 9). Enforces code quality rules across the
 * project. Runs with `npm run lint`. Extend rules here as the team agrees on style.
 */
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');

module.exports = tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'reports/**',
      'allure-results/**',
      'test-results/**',
      'logs/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      // Empty {} is idiomatic for dependency-free Playwright fixtures.
      'no-empty-pattern': 'off',
    },
  },
  {
    // ESLint config files are plain CommonJS by design.
    files: ['*.config.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  }
);
