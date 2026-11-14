## Problem and resulting behavior

Athlete and Coach Manager release paths previously allowed unauthenticated paid AI calls, broad direct-database access, partial/duplicate recording, and training republishing that reset athlete completion. This change authenticates and budgets provider calls, prepares database-enforced permissions and transactional workflows, preserves completion, adds retry-safe recording and editable athlete profiles, and separates preview content from real data.

The design and React/TanStack/Supabase/Gemini stack are retained. The main app intentionally uses client-side protected routing for its browser-persisted Supabase sessions.

## Scope

- Compatible security dependency patches; production app and website audits are clean.
- AI authentication/consent, database-backed quotas, bounded requests/outputs and provider timeouts.
- Prepared profile/friend/coach/plan/note/video authorization and storage changes.
- Atomic publishing, restricted athlete completion, stable recording identity and stale-analysis protection.
- Session/cache reliability, profile editing/privacy/coach connections, timezone-aware dates and dashboard errors.
- Removed unsafe HTML editing and invented training fallback; labeled remaining prototypes.
- Isolated PostgreSQL and mock-browser regressions, CI, and manual release guidance.

## Validation

- TypeScript: passed.
- Unit/regression suite: 28 passed.
- ESLint: zero errors, 10 warnings.
- Release formatting check: passed.
- Main and marketing builds: passed.
- Chromium mock-service suite: 6 passed, with no uncaught page errors. A cold dev-server timeout under concurrent builds passed when rerun separately with a bounded hydration allowance.
- Real isolated PostgreSQL 17 auth/workflow/storage tests: passed; forward migration reapplication passed.
- Main production dependency audit: zero vulnerabilities.
- Marketing dependency audit: zero vulnerabilities.
- Full app audit: seven moderate development-only ESLint/minimatch findings remain.

## Database / release gates — do not deploy yet

Four forward transactional migrations are prepared, not applied to any live project. They were tested with a reconstruction of committed schema evidence and minimal Supabase auth/storage shims, not with a captured live schema.

The original historical migration chain fails locally at 20260818000100 because goal_motivation is missing. Live ledger/schema access is unavailable. A read-only preflight is provided at supabase/preflight-release.sql. Obtain the actual live ledger/schema, review duplicates/type differences and policies, approve a staging baseline/history plan, and test on real Supabase staging before separately approving production SQL.

No live migrations/RLS edits, data deletion, credential rotation, production environment changes, deployment or merge were performed. The previously tracked .env was removed; owners must review/rotate any genuine exposed key themselves.

Live OAuth/password reset, real Supabase/Gemini flows, full authenticated Coach Manager CRUD, hosted behavior, monitoring and privacy/retention/minor-user requirements remain staging/release gates. Prototype pages and unsupported account controls are explicitly documented.

See docs/release/IMPLEMENTATION.md and docs/release/VALIDATION.md.
