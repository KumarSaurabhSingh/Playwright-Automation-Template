# tests/e2e

**Purpose:** UI (browser) E2E test specs, organised by feature area. The example
tests run against **SauceDemo** (`https://www.saucedemo.com`), a free public demo
shop. Replace the page objects / selectors for your own app.

| Path                        | What goes here                                                  |
| --------------------------- | --------------------------------------------------------------- |
| `login/login.spec.ts`       | Login success, error and data-driven validation.                |
| `products/products.spec.ts` | Catalog, add-to-cart badge and price sorting.                   |
| `checkout/checkout.spec.ts` | Full purchase flow (login -> cart -> checkout -> confirmation). |

**Guideline:** Mirror the application's feature structure:
`tests/e2e/<feature>/<feature>.spec.ts`. Add tags (`@smoke`, `@regression`) and use
data-driven loops for multiple scenarios.

Run with: `npm run test:e2e`
