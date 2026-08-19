# src/fixtures

**Purpose:** Custom Playwright fixtures — the recommended way to share setup across tests.

| File             | What goes here                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| `baseFixture.ts` | Extends Playwright's `test` with `loginPage`, `api` and `testData` fixtures; re-exports `expect`. |

**Guideline:** All specs must import `test`/`expect` from `baseFixture.ts`, never from `@playwright/test`. Add new fixtures (auth session, DB connection, etc.) here.
