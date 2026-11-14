# Validation results

All checks are local unless explicitly stated. Production services were not modified.

| Check                                        | Result                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| Main app TypeScript                          | Passed                                                                 |
| Unit/regression tests                        | 28 passed across 6 files                                               |
| ESLint                                       | Passed, zero errors; 10 warnings remain                                |
| Formatting check for release/security files  | Passed                                                                 |
| Main app production build                    | Passed; existing chunk-size/adapter warnings remain                    |
| Marketing production build                   | Passed                                                                 |
| Production npm dependency audit              | Zero vulnerabilities                                                   |
| Full app dependency audit                    | Seven moderate development-only findings remain after compatible fixes |
| Marketing dependency audit                   | Zero vulnerabilities after compatible fixes                            |
| Chromium release flows                       | 7 passed with local mock Supabase; no provider calls                   |
| PostgreSQL authorization/workflow tests      | Passed in disposable PostgreSQL 17 with synthetic auth/storage         |
| Forward migration reapplication              | Passed on the migrated isolated schema                                 |
| Original historical migration replay         | **Failed**: missing goal_motivation at 20260818000100                  |
| Live Supabase ledger/schema comparison       | **Blocked**: no management/database credentials                        |
| Live authenticated Supabase and Gemini flows | **Untested**                                                           |
| Production deployment and hosted behavior    | **Untested; not deployed**                                             |
| Remote CI                                    | Check draft PR; not implied by local success                           |

The SQL suite covers cross-account profile/workout isolation; safe friend projections; role-edit/direct-friendship denial; linked/unlinked coach access; consent revocation; AI consent and hourly limits; durable workout idempotency and mismatched-key rejection; check-in retry/discipline changes; stale analysis rejection; rest-day retention; draft-plan visibility; athlete completion restrictions; repeat publishing and preserved completion; video consent/storage access; and all-or-nothing publication rollback on injected failure.

Browser regressions cover unauthenticated page/API access, profile edit/save/reload, ignoring old HTML snapshots while preserving scanner interaction, genuinely empty training, coach direct navigation/refresh, and athlete rejection from Coach Manager. The mock auth accepts synthetic tokens only on a loopback test service. It must never be used as a production auth implementation.

## Reproduce

Node 22+, npm and Docker are needed. Only scripts named here touch the fixed local disposable container; they do not accept a remote database URL.

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
npm audit --omit=dev --audit-level=high
npm --prefix website ci
npm --prefix website run build
npm --prefix website audit

docker run -d --name aether-release-test -e POSTGRES_PASSWORD=isolated-test-only postgres:17-alpine
# Wait for: docker exec aether-release-test pg_isready -U postgres
npm run test:database
# This diagnostic is EXPECTED to fail on the unmodified legacy history:
bash scripts/inspect-historical-migrations.sh

# On the Cloud workspace /usr/bin/chromium is used.
npm run test:release:browser
# Elsewhere:
npx playwright install --with-deps chromium
PLAYWRIGHT_USE_BUNDLED_CHROMIUM=1 npm run test:release:browser
```

Use the standard `test:coach-manager:browser` suite only with a reviewed staging account and staging environment. It has live CRUD scenarios and is not part of these isolated checks. No production credentials are required by the new CI workflow.

One browser run under concurrent build load timed out during development-server hydration. The isolated rerun passed all seven tests with a 10-second assertion timeout and no retries. This does not establish production performance.
