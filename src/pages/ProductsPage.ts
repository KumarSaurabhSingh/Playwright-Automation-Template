/**
 * @file ProductsPage.ts
 * @description Page Object for the SauceDemo inventory (products) screen.
 * Demonstrates add-to-cart, sort and cart-badge interactions.
 */
import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly productCards: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.productCards = page.locator('.inventory_item');
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.sortDropdown = page.locator('.product_sort_container');
  }

  /** 'Sauce Labs Backpack' -> 'sauce-labs-backpack' (used by data-test ids). */
  private static toTestId(productName: string): string {
    return productName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  async open(): Promise<void> {
    await this.navigate('/inventory.html');
  }

  async addToCart(productName: string): Promise<void> {
    await this.page.getByTestId(`add-to-cart-${ProductsPage.toTestId(productName)}`).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.page.getByTestId(`remove-${ProductsPage.toTestId(productName)}`).click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async sortBy(option: string): Promise<void> {
    await this.sortDropdown.selectOption({ label: option });
  }

  async expectProductCount(count: number): Promise<void> {
    await expect(this.productCards).toHaveCount(count);
  }

  async expectProductVisible(productName: string): Promise<void> {
    await expect(this.productCards.filter({ hasText: productName }).first()).toBeVisible();
  }

  /** Read all displayed prices and return them as numbers. */
  async productPrices(): Promise<number[]> {
    const raw = await this.page.locator('.inventory_item_price').allTextContents();
    return raw.map((text) => parseFloat(text.replace('$', '')));
  }
}
