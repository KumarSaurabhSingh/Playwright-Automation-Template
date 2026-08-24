/**
 * @file auth.setup.ts
 * @description Authentication setup project. Runs ONCE per test invocation (before
 * every dependent browser/mobile project) and persists the logged-in session —
 * cookies + localStorage — to `.auth/user.json` via Playwright storage state.
 *
 * Every other project declares `storageState: AUTH_STORAGE_STATE`, so products,
 * checkout, etc. start already signed in: no repeated UI logins, faster suites and
 * a session that behaves exactly like a real returning user.
 */
import { test as setup } from '../../../src/fixtures/baseFixture';
// Official Playwright pattern: reuse the path exported from playwright.config.ts.
import { AUTH_STORAGE_STATE } from '../../../playwright.config';

setup('authenticate - create reusable session', { tag: '@smoke' }, async ({ loginPage, page }) => {
  await loginPage.open();
  await loginPage.loginWithEnvConfig();
  await loginPage.expectLoginSuccess();

  // Persist the authenticated context for all dependent projects.
  await page.context().storageState({ path: AUTH_STORAGE_STATE });
});
