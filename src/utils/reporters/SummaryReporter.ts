/**
 * @file SummaryReporter.ts
 * @description Custom Playwright reporter that produces a machine-readable run
 * summary consumed by `scripts/send-report-email.js` (email notifications) and
 * appends a human-readable markdown table to the GitHub Actions step summary.
 *
 * Output:
 *  - reports/test-summary.json   -> totals, flaky/failed breakdown, durations
 *  - $GITHUB_STEP_SUMMARY        -> rendered table on every CI job page
 */
import fs from 'fs';
import path from 'path';
import type { FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { logger } from '../logger';
import { EnvConfig } from '../../config/envConfig';

/** One recorded attempt; retries overwrite earlier entries (last attempt wins). */
interface RecordedTest {
  title: string;
  project: string;
  status: string;
  durationMs: number;
  retriesUsed: number;
  error?: string;
}

export interface RunSummary {
  generatedAt: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  env: string;
  overallStatus: string;
  totals: {
    total: number;
    passed: number;
    failed: number;
    flaky: number;
    skipped: number;
  };
  failedTests: Array<{ title: string; project: string; error?: string }>;
}

const FAILURE_STATUSES = new Set(['failed', 'timedOut', 'interrupted']);

class SummaryReporter implements Reporter {
  private readonly entries = new Map<string, RecordedTest>();
  private startedAt = new Date();

  onBegin(): void {
    this.startedAt = new Date();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.entries.set(test.id, {
      title: test.title,
      project: SummaryReporter.projectName(test),
      status: result.status,
      durationMs: result.duration,
      retriesUsed: result.retry,
      error: result.error?.message?.split('\n')[0]?.slice(0, 300),
    });
  }

  onEnd(result: FullResult): void {
    const endedAt = new Date();
    const tests = [...this.entries.values()];

    const failedTests = tests.filter((t) => FAILURE_STATUSES.has(t.status));
    const flakyCount = tests.filter((t) => t.status === 'passed' && t.retriesUsed > 0).length;

    const summary: RunSummary = {
      generatedAt: endedAt.toISOString(),
      startedAt: this.startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationMs: Math.max(0, endedAt.getTime() - this.startedAt.getTime()),
      env: EnvConfig.testEnv,
      overallStatus: result.status,
      totals: {
        total: tests.length,
        passed: tests.filter((t) => t.status === 'passed').length,
        failed: failedTests.length,
        flaky: flakyCount,
        skipped: tests.filter((t) => t.status === 'skipped').length,
      },
      failedTests: failedTests.map(({ title, project, error }) => ({
        title,
        project,
        error,
      })),
    };

    this.writeJson(summary);
    this.appendGithubStepSummary(summary);

    logger.info(
      `Run summary: ${summary.totals.passed}/${summary.totals.total} passed, ` +
        `${summary.totals.failed} failed (${summary.overallStatus}) -> reports/test-summary.json`
    );
  }

  /** Resolve the project name by walking up the suite tree. */
  private static projectName(test: TestCase): string {
    let parent: Suite | undefined = test.parent;
    while (parent) {
      if (parent.type === 'project') return parent.title || '';
      parent = parent.parent;
    }
    return '';
  }

  private writeJson(summary: RunSummary): void {
    const reportDir = path.resolve(__dirname, '..', '..', '..', 'reports');
    try {
      fs.mkdirSync(reportDir, { recursive: true });
      fs.writeFileSync(path.join(reportDir, 'test-summary.json'), JSON.stringify(summary, null, 2));
    } catch (error) {
      logger.warn(`Failed to write test summary JSON: ${String(error)}`);
    }
  }

  private appendGithubStepSummary(summary: RunSummary): void {
    const stepSummaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (!stepSummaryFile) return;

    const { totals, env, overallStatus } = summary;
    const lines = [
      '## Playwright run summary',
      '',
      '| Environment | Status | Total | Passed | Failed | Flaky | Skipped | Duration |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      `| ${env} | \`${overallStatus}\` | ${totals.total} | ${totals.passed} | ` +
        `${totals.failed} | ${totals.flaky} | ${totals.skipped} | ` +
        `${SummaryReporter.formatDuration(summary.durationMs)} |`,
      '',
    ];

    if (summary.failedTests.length > 0) {
      lines.push('### Failed tests', '');
      for (const failure of summary.failedTests) {
        lines.push(`- **${failure.title}** (${failure.project})`);
        if (failure.error) lines.push(`  - ${failure.error}`);
      }
      lines.push('');
    }

    try {
      fs.appendFileSync(stepSummaryFile, lines.join('\n'));
    } catch (error) {
      logger.warn(`Failed to append GitHub step summary: ${String(error)}`);
    }
  }

  private static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  }
}

export default SummaryReporter;
