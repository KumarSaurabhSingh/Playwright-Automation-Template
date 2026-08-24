/**
 * @file globalSetup.ts
 * @description Runs ONCE before the entire test run. Ideal for:
 *  - Validating the environment configuration before wasting workers
 *  - Creating runtime folders (logs, reports, test-results)
 *  - Pre-seeding test data / requesting auth tokens / setting up storage state
 * Any heavy one-time preparation should live here.
 */
import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export default async function globalSetup(_config: FullConfig): Promise<void> {
  logger.info('========== GLOBAL SETUP START ==========');

  const folders = [
    'logs',
    'reports',
    'reports/html-report',
    'reports/summaries',
    'test-results',
    'allure-results',
    '.auth',
  ];
  for (const folder of folders) {
    fs.mkdirSync(path.resolve(__dirname, '../../', folder), { recursive: true });
  }
  logger.info(`Runtime folders ready: ${folders.join(', ')}`);

  if (!process.env.BASE_URL) {
    logger.warn(
      'BASE_URL is not set. Did you load a config file? Run with TEST_ENV=<dev|staging|prod>.'
    );
  } else {
    logger.info(`Target environment: ${process.env.BASE_URL}`);
  }

  if (!process.env.API_BASE_URL) {
    logger.warn('API_BASE_URL is not set. Falling back to BASE_URL for API tests.');
  } else {
    logger.info(`API base URL: ${process.env.API_BASE_URL}`);
  }

  logger.info('========== GLOBAL SETUP END ==========');
}
