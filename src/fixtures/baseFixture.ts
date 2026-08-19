/**
 * @file baseFixture.ts
 * @description Custom Playwright fixtures. Fixtures are the modern, recommended
 * way to share setup between tests (replaces beforeAll/afterAll hacks).
 *
 * Available fixtures after this file:
 *  - `page`         (built-in browser page)
 *  - `loginPage`    (typed LoginPage object)
 *  - `productsPage` (typed ProductsPage object)
 *  - `cartPage`     (typed CartPage object)
 *  - `checkoutPage` (typed CheckoutPage object)
 *  - `api`          (APIClient backed by Playwright's APIRequestContext)
 *  - `testData`     (injected faker-generated data per test)
 *
 * Import `test`/`expect` from THIS file (not @playwright/test) in all specs.
 */
import { test as base, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { APIClient } from '../api/APIClient';
import { logger } from '../utils/logger';

// Declare the shape of the extra fixtures we are adding.
type Fixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  api: APIClient;
  testData: { uniqueEmail: string; randomName: string };
};

// Extend the base test with our fixtures.
export const test = base.extend<Fixtures>({
  /** Typed LoginPage bound to the test's page. */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  /** Typed ProductsPage bound to the test's page. */
  productsPage: async ({ page }, use) => {
    const productsPage = new ProductsPage(page);
    await use(productsPage);
  },

  /** Typed CartPage bound to the test's page. */
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  /** Typed CheckoutPage bound to the test's page. */
  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  /** API client wired to Playwright's request context (shareable, no browser needed). */
  api: async ({ request }, use) => {
    const client = new APIClient(request);
    await use(client);
  },

  /** Unique per-test data, generated fresh for every test. */
  testData: async ({}, use) => {
    await use({
      uniqueEmail: faker.internet.email(),
      randomName: faker.person.fullName(),
    });
  },
});

/** Re-export expect so specs only import from this file. */
export { expect };

/** Per-fixture logging hook — handy for debugging which fixture is running. */
test.afterEach(async ({}, testInfo) => {
  logger.debug(`Finished: ${testInfo.title} [${testInfo.status}]`);
});
