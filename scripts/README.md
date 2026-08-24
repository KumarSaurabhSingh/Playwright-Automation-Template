# scripts/

Standalone Node.js utilities that support the framework but do not run inside Playwright's test process.

| File                   | Purpose                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `send-report-email.js` | Emails the run summary produced by `src/utils/reporters/SummaryReporter`. |

## Email report usage

```bash
npm test                      # SummaryReporter writes reports/test-summary.json
npm run email:report          # sends the styled HTML report via SMTP
EMAIL_DRY_RUN=true npm run email:report   # preview in terminal without sending
```

Configuration comes from env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASS`, `MAIL_FROM`, `MAIL_TO`) resolved with the same priority as tests:
`config/<TEST_ENV>.env` > `.env` > shell. See `.env.example`.

In CI (`.github/workflows/ci.yml`) the `notify` job merges all per-project
summaries from artifacts and runs this script automatically — just add the SMTP
values as repository secrets.
