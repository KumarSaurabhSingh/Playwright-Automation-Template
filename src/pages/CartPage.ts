/**
 * @file CartPage.ts
 * @description Page Object for the SauceDemo shopping-cart screen.
 */
import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('#checkout');
    this.continueShoppingButton = page.locator('#continue-shopping');
  }

  async open(): Promise<void> {
    await this.navigate('/cart.html');
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async removeItem(productName: string): Promise<void> {
    await this.cartItems
      .filter({ hasText: productName })
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }
}
