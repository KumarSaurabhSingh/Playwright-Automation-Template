/**
 * @file checkout.spec.ts
 * @description Full purchase journey on SauceDemo: login -> add to cart ->
 * cart -> shipping info -> overview -> order confirmation.
 */
import { test } from '../../../src/fixtures/baseFixture';
import { validLoginData } from '../../../src/data/loginData';

test.describe('Checkout', () => {
  test(
    'TC08 - Complete a purchase from login to confirmation',
    { tag: '@smoke' },
    async ({ loginPage, productsPage, cartPage, checkoutPage }) => {
      await loginPage.open();
      await loginPage.login(validLoginData.username, validLoginData.password);
      await loginPage.expectLoginSuccess();

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
