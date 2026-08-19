# src/utils

**Purpose:** Stateless helper utilities reused across the framework.

| File            | What goes here                                                        |
| --------------- | --------------------------------------------------------------------- |
| `logger.ts`     | Winston logger — console + file output. Use instead of `console.log`. |
| `randomUtil.ts` | Faker-based random data generators (email, names, phone, strings).    |
| `dateUtil.ts`   | Date helpers (today, offsets, formatting).                            |

**Guideline:** Utilities must be pure and have no Playwright/test dependencies. New helpers (CSV readers, encoders, etc.) go here.
