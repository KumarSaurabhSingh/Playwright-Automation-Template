/**
 * @file posts.spec.ts
 * @description API tests for the JSONPlaceholder /posts resource. Demonstrates
 * the full CRUD cycle (GET / POST / PUT / DELETE) with status-code assertions.
 */
import { test, expect } from '../../../src/fixtures/baseFixture';
import { RandomUtil } from '../../../src/utils/randomUtil';

test.describe('Posts API', () => {
  test('TC12 - POST /posts creates a new post', { tag: '@smoke' }, async ({ api }) => {
    const response = await api.post('/posts', {
      title: RandomUtil.alphanumeric(8),
      body: 'Created by the API test suite',
      userId: 1,
    });

    expect(response.status()).toBe(201);

    const post = await response.json();
    expect(post).toHaveProperty('id');
    expect(post.title).toBeTruthy();
  });

  test('TC13 - PUT /posts/1 updates a post', { tag: '@regression' }, async ({ api }) => {
    const response = await api.put('/posts/1', {
      id: 1,
      title: 'Updated title',
      body: 'Updated body',
      userId: 1,
    });

    expect(response.status()).toBe(200);

    const post = await response.json();
    expect(post.title).toBe('Updated title');
  });

  test('TC14 - DELETE /posts/1 removes a post', { tag: '@regression' }, async ({ api }) => {
    const response = await api.delete('/posts/1');

    expect(response.status()).toBe(200);
  });

  test('TC15 - GET /posts returns a list of posts', { tag: '@smoke' }, async ({ api }) => {
    const response = await api.get('/posts');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });
});
