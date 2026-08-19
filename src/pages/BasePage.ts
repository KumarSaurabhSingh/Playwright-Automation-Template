/**
 * @file BasePage.ts
 * @description Base class that every Page Object extends. Contains the shared,
 * reusable actions all pages need: navigation, waiting, screenshots, URL checks,
 * and common input/click helpers. Customize here and every page inherits it.
 */
import { expect, Page } from '@playwright/test';

export class BasePage {
  /** The Playwright page instance this page object operates on. */
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to a relative path, e.g. navigate('/login'). */
  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /** Get the current page title. */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Get the current full URL. */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /** Wait until the page has finished loading (more reliable than networkidle). */
  async waitForLoadState(): Promise<void> {
    await this.page.waitForLoadState('load');
  }

  /** Assert the current URL matches an exact value or pattern. */
  async expectUrl(expected: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expected);
  }

  /** Take a screenshot; filename is relative to test-results/screenshots. */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  /** Fill an input field only if the selector exists — avoids flaky empty fills. */
  async fillIfVisible(locator: string, value: string): Promise<void> {
    const el = this.page.locator(locator);
    if (await el.isVisible()) {
      await el.fill(value);
    }
  }
}
