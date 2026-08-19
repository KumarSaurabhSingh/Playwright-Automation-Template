/**
 * @file globalTeardown.ts
 * @description Runs ONCE after the entire test run finishes. Ideal for:
 *  - Cleaning up test data created during the run
 *  - Deleting temporary auth states / files
 *  - Sending a summary notification (Slack, email, test-management tool)
 */
import { FullConfig } from '@playwright/test';
import { logger } from '../utils/logger';

export default async function globalTeardown(_config: FullConfig): Promise<void> {
  logger.info('========== GLOBAL TEARDOWN START ==========');
  logger.info('Cleaning up temporary test artifacts...');

  // Example: remove any temporary storage states created during the run.
  // Add project-specific cleanup (delete created users, orders, etc.) here.

  logger.info('========== GLOBAL TEARDOWN END ==========');
}
