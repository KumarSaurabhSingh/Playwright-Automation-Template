# src/api

**Purpose:** Reusable HTTP/REST client for API testing and backend setup used by UI tests.

| File           | What goes here                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `APIClient.ts` | Thin typed wrapper around Playwright's `APIRequestContext`. Provides `get/post/put/patch/delete` + bearer-token handling. |

**Guideline:** Add endpoint-specific request classes here (e.g. `UserApi.ts`, `OrderApi.ts`) that call the generic `APIClient`. Keep specs free of raw request boilerplate.
