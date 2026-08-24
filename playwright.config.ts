/**
 * @file playwright.config.ts
 * @description Central Playwright configuration. This file is the "engine room" of the
 * framework: it loads the environment file for the selected TEST_ENV, defines browser
 * AND mobile device projects, wires storage-state based authentication (login once,
 * reuse everywhere), retries/workers for CI vs local runs, timeouts and the reporting
 * stack (list + HTML + Allure + JSON summary). Almost everything here is overridable
 * from the CLI, e.g. `TEST_ENV=staging npm run test:e2e`.
 */
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Environment selection: `TEST_ENV=staging` reads config/staging.env. Defaults to dev.
const ENV = process.env.TEST_ENV || 'dev';
const ENV_FILE = path.resolve(__dirname, 'config', `${ENV}.env`);

// Load the environment-specific file first (highest priority), then .env as a fallback.
// Variables already set are never overwritten, so config/<env>.env wins.
dotenv.config({ path: ENV_FILE });
dotenv.config({ path: path.resolve(__dirname, '.env'), override: false });

/**
 * Where the `setup` project persists the logged-in session (cookies + localStorage).
 * Every browser/mobile project declares this as `storageState`, so tests start
 * already authenticated instead of repeating a UI login. The file is regenerated on
 * every run and gitignored under `.auth/`.
 */
export const AUTH_STORAGE_STATE = path.join(__dirname, '.auth', 'user.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  globalSetup: './src/hooks/globalSetup.ts',
  globalTeardown: './src/hooks/globalTeardown.ts',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results', detail: true }],
    // Writes reports/test-summary.json (consumed by scripts/send-report-email.js)
    // and appends a markdown table to the GitHub Actions step summary when in CI.
    ['./src/utils/reporters/SummaryReporter.ts', {}],
  ],
  outputDir: 'test-results',
  use: {
    baseURL: process.env.BASE_URL,
    headless: process.env.HEADLESS !== 'false',
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  projects: [
    // ------------------------------------------------------------------
    // 1. AUTH SETUP — runs once per invocation, logs in via the UI and
    //    saves the session to AUTH_STORAGE_STATE. Every project below that
    //    needs an authenticated user declares `dependencies: ['setup']`.
    // ------------------------------------------------------------------
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // ------------------------------------------------------------------
    // 2. DESKTOP BROWSERS — reuse the saved session; no per-test UI login.
    //    API specs are excluded so they run exactly once (see `api` below).
    // ------------------------------------------------------------------
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_STORAGE_STATE },
      dependencies: ['setup'],
      testIgnore: /tests\/api\//,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: AUTH_STORAGE_STATE },
      dependencies: ['setup'],
      testIgnore: /tests\/api\//,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: AUTH_STORAGE_STATE },
      dependencies: ['setup'],
      testIgnore: /tests\/api\//,
    },

    // ------------------------------------------------------------------
    // 3. MOBILE DEVICES — real device emulation (viewport, UA, touch,
    //    DPR, mobile Chromium/WebKit engines). Same session reuse applies.
    // ------------------------------------------------------------------
    {
      name: 'pixel-7',
      use: { ...devices['Pixel 7'], storageState: AUTH_STORAGE_STATE },
      dependencies: ['setup'],
      testIgnore: /tests\/api\//,
    },
    {
      name: 'iphone-14',
      use: { ...devices['iPhone 14'], storageState: AUTH_STORAGE_STATE },
      dependencies: ['setup'],
      testIgnore: /tests\/api\//,
    },

    // ------------------------------------------------------------------
    // 4. API TESTS — browser-independent, so they run in a single dedicated
    //    project instead of being duplicated across every browser project.
    // ------------------------------------------------------------------
    {
      name: 'api',
      testMatch: /tests\/api\//,
    },
  ],
});
