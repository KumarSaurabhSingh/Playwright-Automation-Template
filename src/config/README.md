# src/config

**Purpose:** Centralised, type-safe access to environment configuration.

| File           | What goes here                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------- |
| `envConfig.ts` | Reads values from `process.env` (loaded from `config/<env>.env`) and exposes them as typed getters. |

**Guideline:** Always read config via `EnvConfig` in code — never touch `process.env` directly. Add a getter here whenever you add a new environment variable.
