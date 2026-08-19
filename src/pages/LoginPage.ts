/**
 * @file LoginPage.ts
 * @description Page Object for the SauceDemo login screen. Locators and actions
 * live together so they can never drift. Replace the selectors with your own
 * application's login page when adopting this framework.
 */
import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { EnvConfig } from '../config/envConfig';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('#login-button');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /** Open the login screen (SauceDemo serves it at the root path). */
  async open(): Promise<void> {
    await this.navigate('/');
    await this.waitForLoadState();
  }

  /** Fill username + password and click Sign In. */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Convenience: log in with the credentials from the environment config. */
  async loginWithEnvConfig(): Promise<void> {
    const { username, password } = EnvConfig.credentials;
    await this.login(username, password);
  }

  /** Assert the login succeeded (we landed on the inventory page). */
  async expectLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  /** Assert the invalid-credentials error is visible. */
  async expectLoginError(expectedText: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedText);
  }
}
