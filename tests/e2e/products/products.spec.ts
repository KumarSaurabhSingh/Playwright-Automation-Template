/**
 * @file products.spec.ts
 * @description E2E products (inventory) tests against SauceDemo: catalog contents,
 * add-to-cart badge updates and price sorting.
 *
 * No UI login needed here: the `setup` project already stored an authenticated
 * session and this suite runs with it (see `storageState` in playwright.config).
 */
import { test, expect } from '../../../src/fixtures/baseFixture';

test.describe('Products', () => {
  test(
    'TC05 - Inventory page lists the default catalog',
    { tag: '@smoke' },
    async ({ productsPage }) => {
      await productsPage.open();
      await productsPage.expectProductCount(6);
      await productsPage.expectProductVisible('Sauce Labs Backpack');
    }
  );

  test(
    'TC06 - Adding products updates the cart badge',
    { tag: '@smoke' },
    async ({ productsPage }) => {
      await productsPage.open();

      await productsPage.addToCart('Sauce Labs Backpack');
      await expect(productsPage.cartBadge).toHaveText('1');

      await productsPage.addToCart('Sauce Labs Bike Light');
      await expect(productsPage.cartBadge).toHaveText('2');
    }
  );

  test(
    'TC07 - Sort products by price (low to high)',
    { tag: '@regression' },
    async ({ productsPage }) => {
      await productsPage.open();

      await productsPage.sortBy('Price (low to high)');
      const prices = await productsPage.productPrices();
      const sorted = [...prices].sort((a, b) => a - b);

      expect(prices).toEqual(sorted);
    }
  );
});
