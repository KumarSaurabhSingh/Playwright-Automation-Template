# Playwright Automation Framework

A **production-ready, reusable** Playwright test automation framework for **UI (E2E) + API** testing. Built with TypeScript, the Page Object Model, typed custom fixtures, environment-based configuration, Allure/HTML reporting and out-of-the-box CI/CD support. It ships with **working demo tests** against two free public apps — **SauceDemo** (web shop, UI/E2E) and **JSONPlaceholder** (fake REST API) — so the entire suite runs green out of the box.

---

## Features

- **UI + API testing in one framework** — fast API tests plus real browser tests.
- **Desktop + mobile browsers** — Chromium/Firefox/WebKit plus emulated **Pixel 7** and **iPhone 14** (touch, viewport, UA, mobile engines).
- **Login once, reuse everywhere (storage state)** — an auth `setup` project logs in a single time per run and every browser/mobile project reuses the saved session (`cookies` + `localStorage`).
- **Page Object Model** — locators and actions co-located, no drift.
- **Typed custom fixtures** (`loginPage`, `productsPage`, `cartPage`, `checkoutPage`, `api`, `testData`) replace `beforeAll` hacks.
- **Environment-based config** — `dev` / `staging` / `prod` via `TEST_ENV`.
- **Reporting** — Playwright HTML report + Allure, screenshots/video/trace on failure.
- **Email report on suite completion** — a custom summary reporter + nodemailer script send a styled HTML result email (locally or from CI).
- **CI/CD ready** — GitHub Actions pipeline with lint/typecheck gate, 6-project matrix and consolidated email notification.
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
npm run test:mobile            # UI specs on Pixel 7 + iPhone 14
TEST_ENV=staging npm test      # run against another environment

# 4. Email the run report (optional — needs SMTP config, see .env.example)
EMAIL_DRY_RUN=true npm run email:report   # preview without sending
npm run email:report                      # sends reports/test-summary.json as HTML email
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
├── reports/                      # Generated HTML/summary reports (gitignored)
├── scripts/                      # Standalone Node utilities (email report)
├── src/
│   ├── api/                      # API client & endpoint request classes
│   ├── config/                   # Typed env config access (EnvConfig)
│   ├── data/                     # Static test data / data-driven rows
│   ├── fixtures/                 # Custom Playwright fixtures (import from here!)
│   ├── hooks/                    # globalSetup / globalTeardown
│   ├── pages/                    # Page Object Model (Login/Products/Cart/Checkout)
│   ├── utils/reporters/          # Custom reporters (run summary JSON + GH step summary)
│   └── utils/                    # logger, random/date helpers
├── tests/
│   ├── api/                      # API specs, grouped by resource
│   └── e2e/
│       ├── auth/                 # auth.setup.ts — login once, save storage state
│       └── e2e features/         # UI specs, grouped by feature
├── .auth/                        # Stored session from the setup project (gitignored)
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

| Script                                              | Description                          |
| --------------------------------------------------- | ------------------------------------ |
| `npm test`                                          | Run all tests                        |
| `npm run test:e2e` / `test:api`                     | Run UI/E2E / API projects            |
| `npm run test:smoke` / `test:regression`            | Run by tag                           |
| `npm run test:chromium` / `firefox` / `webkit`      | Run a single desktop browser project |
| `npm run test:mobile`                               | Run UI specs on Pixel 7 + iPhone 14  |
| `npm run test:mobile:chrome` / `test:mobile:safari` | Run a single mobile project          |
| `npm run test:headed`                               | Run with visible browser             |
| `npm run test:debug`                                | Run with Playwright inspector        |
| `npm run test:show-report`                          | Open the HTML report                 |
| `npm run email:report`                              | Email the run summary (SMTP via env) |
| `npm run report:allure`                             | Generate + open the Allure report    |
| `npm run lint` / `format`                           | Lint / auto-format code              |
| `npm run typecheck`                                 | TypeScript type-check                |

## Authentication & Storage State

The framework logs in **once per run** and reuses the session everywhere:

1. The `setup` project runs `tests/e2e/auth/auth.setup.ts`, which performs a UI
   login and saves cookies + localStorage to `.auth/user.json`.
2. Every browser/mobile project declares `dependencies: ['setup']` and
   `storageState: AUTH_STORAGE_STATE`, so tests start already authenticated —
   no repeated logins, faster suites, realistic returning-user sessions.
3. Suites like `products` and `checkout` therefore contain no login code. Specs
   that must test the _login page itself_ reset the state explicitly:

```ts
test.use({ storageState: { cookies: [], origins: [] } });
```

`.auth/` is regenerated on every run and gitignored.

## Mobile Testing

Mobile support is device emulation via dedicated Playwright projects — same
page objects, same fixtures, real mobile engines:

| Project     | Device    | Engine                 |
| ----------- | --------- | ---------------------- |
| `pixel-7`   | Pixel 7   | Mobile Chromium        |
| `iphone-14` | iPhone 14 | Mobile WebKit (Safari) |

Run with `npm run test:mobile`, or target one device with
`npm run test:mobile:chrome` / `npm run test:mobile:safari`.

## Email Report

After a run, `SummaryReporter` (`src/utils/reporters/`) writes
`reports/test-summary.json` (totals, flaky/failed breakdown, durations). Then:

```bash
npm run email:report                      # send via SMTP
EMAIL_DRY_RUN=true npm run email:report   # preview HTML in terminal
```

Configuration: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`,
`MAIL_TO` (see `.env.example`). In CI this happens automatically in the `notify`
job using repository secrets — the email contains pass/fail counts, duration,
failed-test details and a link to the CI run, with per-project summaries attached.

## Reports

- **HTML report** at `reports/html-report/` → `npm run test:show-report`
- **Allure report** at `allure-report/` → `npm run report:allure`
- Screenshots, videos and traces are captured automatically **only on failure** (`test-results/`).

## CI / CD

The included GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR:

1. **quality-gate** — ESLint + TypeScript type-check (fails fast, before browsers).
2. **tests** — matrix over 6 projects: `chromium`, `firefox`, `webkit`, `pixel-7`,
   `iphone-14` and `api` (each installs only the browser engine it needs; the auth
   setup project runs automatically per shard). Every job uploads its own HTML
   report, Allure results, traces and run summary as artifacts.
3. **notify** — merges all per-project summaries into a single email report
   (`continue-on-error`, so SMTP problems never fail the pipeline).

The demo suite needs **no secrets** — URLs come from `config/staging.env`. For your own
app or the email feature, add repository **secrets**:

| Secret                                           | Purpose                            |
| ------------------------------------------------ | ---------------------------------- |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO` | Email report (required for notify) |
| `SMTP_PORT`, `MAIL_FROM`                         | Optional email overrides           |
| `BASE_URL`, `USERNAME`, `PASSWORD`               | Override demo app URLs/credentials |

If email secrets are absent, the notify job logs a warning and stays green.
A manual `workflow_dispatch` trigger lets you pick the environment (dev/staging/prod).

## Best Practices Followed

- **Import `test`/`expect` from `src/fixtures/baseFixture.ts`**, never directly from `@playwright/test`.
- **Locators live inside page objects** — never in a separate locators folder.
- **One page object per screen**, semantic actions only.
- **Read config via `EnvConfig`** — never raw `process.env` in specs.
- **Use `logger`** instead of `console.log`.
- **Generate dynamic data** with `RandomUtil`; keep static datasets in `src/data`.
- **Use Playwright's native `expect`** (auto-waiting) instead of manual waits.
