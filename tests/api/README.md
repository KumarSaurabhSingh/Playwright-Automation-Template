# tests/api

**Purpose:** API test specs (no browser required — fast and stable). The example
tests run against **JSONPlaceholder** (`https://jsonplaceholder.typicode.com`), a
free public fake REST API. Point `API_BASE_URL` at your own backend to reuse them.

| File                  | What goes here                                           |
| --------------------- | -------------------------------------------------------- |
| `users/users.spec.ts` | GET assertions against the `/users` resource.            |
| `posts/posts.spec.ts` | Full CRUD cycle (GET / POST / PUT / DELETE) on `/posts`. |

**Guideline:** Name files after the endpoint/resource (e.g. `users.spec.ts`,
`orders.spec.ts`). Use the `api` fixture from `src/fixtures/baseFixture.ts`.

Run with: `npm run test:api`
