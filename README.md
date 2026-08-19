# Playwright Automation Framework

A **production-ready, reusable** Playwright test automation framework for **UI (E2E) + API** testing. Built with TypeScript, the Page Object Model, typed custom fixtures, environment-based configuration, Allure/HTML reporting and out-of-the-box CI/CD support. It ships with **working demo tests** against two free public apps — **SauceDemo** (web shop, UI/E2E) and **JSONPlaceholder** (fake REST API) — so the entire suite runs green out of the box.

---

## Features

- **UI + API testing in one framework** — fast API tests plus real browser tests.
- **Page Object Model** — locators and actions co-located, no drift.
- **Typed custom fixtures** (`loginPage`, `productsPage`, `cartPage`, `checkoutPage`, `api`, `testData`) replace `beforeAll` hacks.
- **Environment-based config** — `dev` / `staging` / `prod` via `TEST_ENV`.
- **Reporting** — Playwright HTML report + Allure, screenshots/video/trace on failure.
- **CI/CD ready** — GitHub Actions workflow included (green on first push).
- **Quality tooling** — ESLint, Prettier, TypeScript strict mode.
- **Logging** — winston console + rotating file logs.
- **Data-driven testing** — dataset rows, faker-generated unique data.
- **Tags** — `@smoke` / `@regression` for targeted test runs.

---

## Prerequisites

- **Node.js >= 18** (LTS recommended) and npm
- git (optional but recommended)
- Allure CLI (optional — only needed for Allure reports; HTML report works without it)

## Quick Start

```bash
# 1. One-click setup (installs deps, browsers, Allure, .env, folders)
./setup.sh            # or: bash setup.sh (Windows)

# 2. (or) Manual install
npm install
npx playwright install chromium firefox webkit

# 3. Run the demo suite (no extra config needed — demo apps are public)
npm test                       # full suite, all browsers
npm run test:e2e               # UI/E2E specs only
npm run test:api               # API specs only
npm run test:smoke             # only tests tagged @smoke
TEST_ENV=staging npm test      # run against another environment
```

> The demo tests hit **SauceDemo** (`https://www.saucedemo.com`, login `standard_user` /
> `secret_sauce`) and **JSONPlaceholder** (`https://jsonplaceholder.typicode.com`).
> To run against your own application, edit the URLs in `config/<env>.env` and update
> the page objects / endpoints.

## What the Demo Suite Covers

| Layer | File                                  | Coverage                                              |
| ----- | ------------------------------------- | ----------------------------------------------------- |
| E2E   | `tests/e2e/login/login.spec.ts`       | Valid login, invalid login, data-driven validation    |
| E2E   | `tests/e2e/products/products.spec.ts` | Catalog contents, add-to-cart badge, price sorting    |
| E2E   | `tests/e2e/checkout/checkout.spec.ts` | Full purchase: login → cart → checkout → confirmation |
| API   | `tests/api/users/users.spec.ts`       | `GET /users` list + single user assertions            |
| API   | `tests/api/posts/posts.spec.ts`       | Full CRUD cycle: GET / POST / PUT / DELETE            |

## Folder Structure

```
.
├── .github/workflows/ci.yml      # CI pipeline (GitHub Actions)
├── config/                       # Environment files (dev/staging/prod) — one README inside
├── logs/                         # Runtime log files (gitignored)
├── reports/                      # Generated HTML reports (gitignored)
├── src/
│   ├── api/                      # API client & endpoint request classes
│   ├── config/                   # Typed env config access (EnvConfig)
│   ├── data/                     # Static test data / data-driven rows
│   ├── fixtures/                 # Custom Playwright fixtures (import from here!)
│   ├── hooks/                    # globalSetup / globalTeardown
│   ├── pages/                    # Page Object Model (Login/Products/Cart/Checkout)
│   └── utils/                    # logger, random/date helpers
├── tests/
│   ├── api/                      # API specs, grouped by resource
│   └── e2e/                      # UI (browser) E2E specs, grouped by feature
├── .env.example                  # Template for local .env
├── package.json                  # Dependencies + npm scripts
├── playwright.config.ts          # Central Playwright configuration
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.js              # ESLint rules
├── prettier.config.js            # Formatting rules
└── setup.sh                      # One-click environment setup
```

> **Every folder contains its own short `README.md`** describing what lives there, so new team members can understand the framework quickly.

## How to Write a Test

**UI/E2E test** — import `test`/`expect` from the fixtures, use a page object:

```ts
import { test, expect } from '../../src/fixtures/baseFixture';

test('Login with valid credentials', { tag: '@smoke' }, async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.login('standard_user', 'secret_sauce');
  await loginPage.expectLoginSuccess();
});
```

**API test** — use the `api` fixture:

```ts
import { test, expect } from '../../src/fixtures/baseFixture';

test('Login endpoint returns a token', async ({ api }) => {
  const response = await api.get('/users');
  expect(response.status()).toBe(200);
  expect(await response.json()).toHaveLength(10);
});
```

## Configuration & Environments

- Default environment is **dev**. Switch with `TEST_ENV=staging` or `TEST_ENV=prod`.
- Environment variables are read from `config/<env>.env` first, then `.env`.
- **Never commit real secrets.** `config/*.env` hold placeholders; real values go in CI secrets or a gitignored local `.env`.

## npm Scripts

| Script                                         | Description                       |
| ---------------------------------------------- | --------------------------------- |
| `npm test`                                     | Run all tests                     |
| `npm run test:e2e` / `test:api`                | Run UI/E2E / API specs            |
| `npm run test:smoke` / `test:regression`       | Run by tag                        |
| `npm run test:chromium` / `firefox` / `webkit` | Run a single browser project      |
| `npm run test:headed`                          | Run with visible browser          |
| `npm run test:debug`                           | Run with Playwright inspector     |
| `npm run test:show-report`                     | Open the HTML report              |
| `npm run report:allure`                        | Generate + open the Allure report |
| `npm run lint` / `format`                      | Lint / auto-format code           |
| `npm run typecheck`                            | TypeScript type-check             |

## Reports

- **HTML report** at `reports/html-report/` → `npm run test:show-report`
- **Allure report** at `allure-report/` → `npm run report:allure`
- Screenshots, videos and traces are captured automatically **only on failure** (`test-results/`).

## CI / CD

The included GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR:

1. Checks out code and installs dependencies.
2. Installs Chromium with system deps.
3. Runs the test suite against `staging`.
4. Uploads HTML report, Allure results, and failure artifacts.

The demo suite needs **no secrets** — URLs come from `config/staging.env`. For your own
app, override them with GitHub Actions secrets (`BASE_URL`, `USERNAME`, `PASSWORD`, …).

## Best Practices Followed

- **Import `test`/`expect` from `src/fixtures/baseFixture.ts`**, never directly from `@playwright/test`.
- **Locators live inside page objects** — never in a separate locators folder.
- **One page object per screen**, semantic actions only.
- **Read config via `EnvConfig`** — never raw `process.env` in specs.
- **Use `logger`** instead of `console.log`.
- **Generate dynamic data** with `RandomUtil`; keep static datasets in `src/data`.
- **Use Playwright's native `expect`** (auto-waiting) instead of manual waits.
