# src/hooks

**Purpose:** One-time lifecycle hooks that run around the whole test run.

| File                | What goes here                                                                 |
| ------------------- | ------------------------------------------------------------------------------ |
| `globalSetup.ts`    | Runs once before all tests — folder creation, config validation, data seeding. |
| `globalTeardown.ts` | Runs once after all tests — cleanup, summary notifications.                    |

**Guideline:** Wired in `playwright.config.ts` via `globalSetup`/`globalTeardown`. Keep them fast — they block the entire run.
