# src/data

**Purpose:** Static test data and dataset-driven rows for specs.

| File           | What goes here                                                     |
| -------------- | ------------------------------------------------------------------ |
| `loginData.ts` | Typed login test data (`validLoginData`, `invalidLoginScenarios`). |

**Guideline:** One file per feature/module. Use this folder for fixed datasets used in data-driven tests; generate dynamic values (emails, names) at runtime with `src/utils/randomUtil.ts`.
