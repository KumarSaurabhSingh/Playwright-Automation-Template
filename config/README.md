# config

**Purpose:** Environment-specific configuration files loaded by `playwright.config.ts`.

| File          | What goes here                                                   |
| ------------- | ---------------------------------------------------------------- |
| `dev.env`     | Local development URLs/credentials.                              |
| `staging.env` | Staging environment values.                                      |
| `prod.env`    | Production values (placeholders only — real secrets via CI env). |

**How to use:**

```bash
TEST_ENV=staging npm run test        # runs against staging
npm run test                          # defaults to dev
```

**Guideline:** These files ARE committed but must contain **no real secrets** — only placeholders. Real credentials go in CI secrets or a gitignored local `.env`. To add an environment, copy an existing file and use its name as `TEST_ENV`.
