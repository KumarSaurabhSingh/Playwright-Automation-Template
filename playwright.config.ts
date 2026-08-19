/**
 * @file playwright.config.ts
 * @description Central Playwright configuration. This file is the "engine room" of the
 * framework: it loads the environment file for the selected TEST_ENV, defines browser
 * projects, retries/workers for CI vs local runs, timeouts and the reporting stack
 * (list + HTML + Allure). Almost everything here is overridable from the CLI, e.g.
 * `TEST_ENV=staging npm run test:e2e`.
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
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
