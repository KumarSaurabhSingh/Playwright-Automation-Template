/**
 * @file checkout.spec.ts
 * @description Full purchase journey on SauceDemo: add to cart -> cart ->
 * shipping info -> overview -> order confirmation.
 *
 * Login is handled once by the `setup` project (storage state), so this journey
 * starts directly on the inventory page as an already-authenticated user.
 */
import { test } from '../../../src/fixtures/baseFixture';

test.describe('Checkout', () => {
  test(
    'TC08 - Complete a purchase from login to confirmation',
    { tag: '@smoke' },
    async ({ productsPage, cartPage, checkoutPage }) => {
      await productsPage.open();

      await productsPage.addToCart('Sauce Labs Backpack');
      await productsPage.openCart();

      await cartPage.expectItemCount(1);
      await cartPage.proceedToCheckout();

      await checkoutPage.fillShippingInfo('John', 'Doe', '94103');
      await checkoutPage.continueToOverview();
      await checkoutPage.finishOrder();

      await checkoutPage.expectOrderComplete();
    }
  );
});
