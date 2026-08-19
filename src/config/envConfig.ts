/**
 * @file envConfig.ts
 * @description Single source of truth for reading environment variables.
 * Everything that needs a config value (URLs, credentials, flags) should read it
 * from this module, never directly from `process.env`. Add a typed getter for any
 * new variable so mistakes are caught at compile time.
 */
import { logger } from '../utils/logger';

export class EnvConfig {
  /** Base URL of the web application. */
  static get baseURL(): string {
    return this.required('BASE_URL');
  }

  /** Base URL of the API (falls back to the web BASE_URL). */
  static get apiBaseURL(): string {
    return process.env.API_BASE_URL || this.baseURL;
  }

  /** Active environment name: dev | staging | prod. */
  static get testEnv(): string {
    return process.env.TEST_ENV || 'dev';
  }

  /** Run headed/headless — controlled by HEADLESS env var. */
  static get headless(): boolean {
    return process.env.HEADLESS !== 'false';
  }

  /** Login credentials used by the example tests. */
  static get credentials(): { username: string; password: string } {
    return {
      username: this.required('USERNAME'),
      password: this.required('PASSWORD'),
    };
  }

  /** Log level passed to the logger. */
  static get logLevel(): string {
    return process.env.LOG_LEVEL || 'info';
  }

  /**
   * Reads a required variable or logs a warning and returns ''.
   * Required so the framework fails loudly when config is missing.
   */
  private static required(name: string): string {
    const value = process.env[name];
    if (value === undefined || value === '') {
      logger.warn(`Environment variable "${name}" is not set.`);
    }
    return value ?? '';
  }
}
