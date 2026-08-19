/**
 * @file login.spec.ts
 * @description E2E login tests against SauceDemo. Demonstrates the recommended
 * structure: import from the custom fixture, use typed page objects, add tags
 * (@smoke/@regression) and data-driven scenarios.
 */
import { test } from '../../../src/fixtures/baseFixture';
import { invalidLoginScenarios, validLoginData } from '../../../src/data/loginData';
import { logger } from '../../../src/utils/logger';

test.describe('Login', () => {
  test(
    'TC01 - Successful login with valid credentials',
    { tag: '@smoke' },
    async ({ loginPage }) => {
      await loginPage.open();
      await loginPage.login(validLoginData.username, validLoginData.password);

      await loginPage.expectLoginSuccess();
      logger.info('Login success path verified.');
    }
  );

  test(
    'TC02 - Unsuccessful login with invalid credentials',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.open();
      await loginPage.login('invalid@example.com', 'wrongpass');

      await loginPage.expectLoginError(invalidLoginScenarios[0].expectedError!);
    }
  );

  // Data-driven test: the same flow runs for every row in invalidLoginScenarios.
  test.describe('Data-driven login validation', () => {
    for (const scenario of invalidLoginScenarios) {
      test(`Reject ${scenario.testCase}`, { tag: '@regression' }, async ({ loginPage }) => {
        await loginPage.open();
        await loginPage.login(scenario.username, scenario.password);

        await loginPage.expectLoginError(scenario.expectedError!);
      });
    }
  });
});
