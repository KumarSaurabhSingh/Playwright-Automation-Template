/**
 * @file send-report-email.js
 * @description Sends the Playwright run summary by email using nodemailer.
 *
 * Reads one or more summary JSON files produced by SummaryReporter:
 *   - reports/test-summary.json            (single local run)
 *   - reports/summaries/*.json             (CI: consolidated per-project artifacts)
 *
 * Configuration (env vars / config/<env>.env / .env):
 *   SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASS,
 *   MAIL_FROM (default SMTP_USER), MAIL_TO (comma-separated recipients)
 *   EMAIL_DRY_RUN=true  -> print the email instead of sending it
 *   EMAIL_STRICT=true   -> exit non-zero when SMTP config is missing
 *
 * Usage: node scripts/send-report-email.js   (or `npm run email:report`)
 * Missing SMTP config exits 0 with a warning so CI pipelines stay green.
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Mirror playwright.config.ts priority: config/<TEST_ENV>.env wins, .env is fallback.
const TEST_ENV = process.env.TEST_ENV || 'dev';
dotenv.config({ path: path.resolve(__dirname, '..', 'config', `${TEST_ENV}.env`) });
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: false });

const nodemailer = require('nodemailer');

const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');
const SINGLE_SUMMARY = path.join(REPORTS_DIR, 'test-summary.json');
const SUMMARIES_DIR = path.join(REPORTS_DIR, 'summaries');

/* ---------------------------------- helpers ---------------------------------- */

function loadSummaries() {
  const files = [];
  if (fs.existsSync(SUMMARIES_DIR)) {
    files.push(
      ...fs
        .readdirSync(SUMMARIES_DIR)
        .filter((f) => f.endsWith('.json'))
        .map((f) => path.join(SUMMARIES_DIR, f))
    );
  }
  if (files.length === 0 && fs.existsSync(SINGLE_SUMMARY)) {
    files.push(SINGLE_SUMMARY);
  }
  return files.map((file) => ({
    file,
    summary: JSON.parse(fs.readFileSync(file, 'utf8')),
  }));
}

/** Merge per-shard/per-project summaries into a single aggregate view. */
function mergeSummaries(loaded) {
  const totals = { total: 0, passed: 0, failed: 0, flaky: 0, skipped: 0 };
  const failedTests = [];
  const projects = new Map();
  let overallStatus = 'passed';
  let latestEndedAt = '';
  let durationMs = 0;

  const severity = { failed: 3, timedout: 3, interrupted: 2, didnotrun: 1, passed: 0 };
  for (const { summary } of loaded) {
    for (const key of Object.keys(totals)) totals[key] += summary.totals?.[key] ?? 0;
    failedTests.push(...(summary.failedTests ?? []));
    durationMs += summary.durationMs ?? 0;
    if ((summary.endedAt ?? '') > latestEndedAt) latestEndedAt = summary.endedAt ?? '';
    if ((severity[summary.overallStatus] ?? 0) > (severity[overallStatus] ?? 0)) {
      overallStatus = summary.overallStatus;
    }
    const label = summary.env || TEST_ENV;
    projects.set(label, (projects.get(label) ?? 0) + (summary.totals?.total ?? 0));
  }

  return {
    overallStatus,
    env: [...projects.keys()].join(', ') || TEST_ENV,
    totals,
    failedTests,
    durationMs,
    endedAt: latestEndedAt || new Date().toISOString(),
    shards: loaded.length,
    sources: loaded.map((l) => path.basename(l.file)),
  };
}

function formatDuration(ms) {
  if (!ms || ms < 1000) return `${Math.round(ms ?? 0)}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ciRunUrl() {
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
  if (GITHUB_SERVER_URL && GITHUB_REPOSITORY && GITHUB_RUN_ID) {
    return `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
  }
  return null;
}

/* --------------------------------- rendering ---------------------------------- */

function buildSubject(view) {
  const status = view.overallStatus.toUpperCase();
  return (
    `[Playwright] ${status} - ${view.totals.passed}/${view.totals.total} passed` +
    `, ${view.totals.failed} failed - ${view.env}`
  );
}

function buildHtml(view) {
  const color =
    view.overallStatus === 'passed'
      ? '#15803d'
      : view.overallStatus === 'flaky'
        ? '#b45309'
        : '#b91c1c';
  const rows = [
    ['Total', view.totals.total],
    ['Passed', view.totals.passed],
    ['Failed', view.totals.failed],
    ['Flaky', view.totals.flaky],
    ['Skipped', view.totals.skipped],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 16px;border-bottom:1px solid #e5e7eb;color:#374151;">${label}</td>` +
        `<td style="padding:8px 16px;border-bottom:1px solid #e5e7eb;font-weight:600;text-align:right;">${value}</td></tr>`
    )
    .join('');

  const failedSection = view.failedTests.length
    ? `<h3 style="margin:24px 0 8px;font-size:15px;color:#111827;">Failed tests (${view.failedTests.length})</h3>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${view.failedTests
         .map(
           (t) =>
             `<tr><td style="padding:8px;border-left:3px solid #dc2626;background:#fef2f2;margin-bottom:6px;">` +
             `<strong>${escapeHtml(t.title)}</strong> <span style="color:#6b7280;">(${escapeHtml(t.project)})</span><br/>` +
             `<span style="color:#991b1b;font-size:12px;">${escapeHtml((t.error || '').slice(0, 240))}</span></td></tr>`
         )
         .join('')}</table>`
    : '<p style="color:#15803d;margin-top:20px;">All tests green.</p>';

  const runUrl = ciRunUrl();
  const footer = runUrl
    ? `Full details: <a href="${runUrl}" style="color:#2563eb;">CI run #${process.env.GITHUB_RUN_ID}</a>` +
      ` (HTML report + traces attached as artifacts).`
    : 'Full details: open <code>reports/html-report/index.html</code> or run <code>npm run report:allure:generate</code>.';

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:${color};padding:20px 24px;color:#ffffff;">
      <div style="font-size:13px;opacity:.85;letter-spacing:.08em;text-transform:uppercase;">Playwright test report</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px;">${escapeHtml(view.overallStatus.toUpperCase())}</div>
      <div style="font-size:13px;margin-top:6px;opacity:.9;">${view.totals.passed}/${view.totals.total} passed &middot; ${view.env}</div>
    </div>
    <div style="padding:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">${rows}</table>
      <p style="font-size:13px;color:#6b7280;margin:16px 0 0;">
        Duration: <strong>${formatDuration(view.durationMs)}</strong> &middot;
        Finished: ${new Date(view.endedAt).toUTCString()}
        ${view.shards > 1 ? ` &middot; Merged from ${view.shards} project summaries` : ''}
      </p>
      ${failedSection}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 12px;" />
      <p style="font-size:12px;color:#6b7280;margin:0;">${footer}</p>
    </div>
  </div>
</body></html>`;
}

/* ----------------------------------- main ------------------------------------- */

function main() {
  const loaded = loadSummaries();
  if (loaded.length === 0) {
    console.warn('[email] No test summaries found under reports/. Run tests first.');
    process.exit(process.env.EMAIL_STRICT === 'true' ? 1 : 0);
  }

  const view = mergeSummaries(loaded);
  const subject = buildSubject(view);
  const html = buildHtml(view);

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailFrom = process.env.MAIL_FROM || smtpUser;
  const mailTo = process.env.MAIL_TO;

  if (!smtpHost || !smtpUser || !smtpPass || !mailTo) {
    console.warn(
      '[email] SMTP not fully configured (need SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_TO). Skipping send.'
    );
    console.info(`[email] Would have sent -> subject: "${subject}" to: ${mailTo || '(unset)'}`);
    process.exit(process.env.EMAIL_STRICT === 'true' ? 1 : 0);
  }

  const attachments = loaded.map(({ file }) => ({ filename: path.basename(file), path: file }));

  if (process.env.EMAIL_DRY_RUN === 'true') {
    console.info(`[email][dry-run] Subject: ${subject}`);
    console.info(`[email][dry-run] To: ${mailTo} | Attachments: ${attachments.length}`);
    console.info(html);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  transporter
    .sendMail({
      from: mailFrom,
      to: mailTo,
      subject,
      html,
      attachments,
    })
    .then((info) => console.info(`[email] Sent report to ${mailTo}: ${info.messageId}`))
    .catch((error) => {
      console.error(`[email] Failed to send email: ${error.message}`);
      process.exit(1);
    });
}

main();
