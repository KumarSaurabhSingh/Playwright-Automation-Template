/**
 * @file APIClient.ts
 * @description Thin wrapper around Playwright's native request context (APIRequestContext).
 * Provides typed helpers for REST calls (GET/POST/PUT/PATCH/DELETE) plus auth-token
 * management, so API tests stay clean and don't repeat request boilerplate.
 *
 * Why Playwright's own request instead of axios? It shares cookies/headers with the
 * browser context (great for UI+API mixed flows) and is installed with @playwright/test.
 */
import { APIRequestContext, APIResponse } from '@playwright/test';
import { EnvConfig } from '../config/envConfig';
import { logger } from '../utils/logger';

export class APIClient {
  readonly request: APIRequestContext;
  private baseURL: string;
  private authToken = '';

  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseURL = EnvConfig.apiBaseURL;
  }

  /** Set a bearer token (e.g. from a login response) for authenticated calls. */
  setToken(token: string): void {
    this.authToken = token;
  }

  private buildOptions(body?: unknown, extraHeaders: Record<string, string> = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...extraHeaders,
    };
    return body !== undefined ? { headers, data: body } : { headers };
  }

  async get(endpoint: string, extraHeaders?: Record<string, string>): Promise<APIResponse> {
    logger.debug(`GET ${endpoint}`);
    return this.request.get(
      `${this.baseURL}${endpoint}`,
      this.buildOptions(undefined, extraHeaders)
    );
  }

  async post(
    endpoint: string,
    body: unknown,
    extraHeaders?: Record<string, string>
  ): Promise<APIResponse> {
    logger.debug(`POST ${endpoint}`);
    return this.request.post(`${this.baseURL}${endpoint}`, this.buildOptions(body, extraHeaders));
  }

  async put(
    endpoint: string,
    body: unknown,
    extraHeaders?: Record<string, string>
  ): Promise<APIResponse> {
    logger.debug(`PUT ${endpoint}`);
    return this.request.put(`${this.baseURL}${endpoint}`, this.buildOptions(body, extraHeaders));
  }

  async patch(
    endpoint: string,
    body: unknown,
    extraHeaders?: Record<string, string>
  ): Promise<APIResponse> {
    logger.debug(`PATCH ${endpoint}`);
    return this.request.patch(`${this.baseURL}${endpoint}`, this.buildOptions(body, extraHeaders));
  }

  async delete(endpoint: string, extraHeaders?: Record<string, string>): Promise<APIResponse> {
    logger.debug(`DELETE ${endpoint}`);
    return this.request.delete(
      `${this.baseURL}${endpoint}`,
      this.buildOptions(undefined, extraHeaders)
    );
  }

  /** Return the parsed JSON body and assert the expected status code in one step. */
  async getJson<T>(endpoint: string, expectedStatus = 200): Promise<T> {
    const response = await this.get(endpoint);
    return this.parseJson<T>(response, expectedStatus);
  }

  /** Small helper to assert status and parse JSON safely. */
  private async parseJson<T>(response: APIResponse, expectedStatus: number): Promise<T> {
    if (response.status() !== expectedStatus) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `Expected status ${expectedStatus} but got ${response.status()} for ${response.url()} — ${body}`
      );
    }
    return (await response.json()) as T;
  }
}
