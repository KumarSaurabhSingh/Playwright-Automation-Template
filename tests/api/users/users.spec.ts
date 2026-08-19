/**
 * @file users.spec.ts
 * @description API tests for the JSONPlaceholder /users resource. Demonstrates
 * GET assertions against a public fake REST API. Point APIClient at your own
 * backend when adopting this framework.
 */
import { test, expect } from '../../../src/fixtures/baseFixture';

test.describe('Users API', () => {
  test('TC10 - GET /users returns a non-empty list', { tag: '@smoke' }, async ({ api }) => {
    const response = await api.get('/users');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('name');
  });

  test('TC11 - GET /users/1 returns the expected user', { tag: '@regression' }, async ({ api }) => {
    const response = await api.get('/users/1');

    expect(response.status()).toBe(200);

    const user = await response.json();
    expect(user.id).toBe(1);
    expect(typeof user.name).toBe('string');
    expect(user.email).toContain('@');
  });
});
