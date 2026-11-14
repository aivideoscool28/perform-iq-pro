# Release hardening implementation

Base: `week2-architecture-refactor` at `9d7980b47c64f9c551e14a45be230e5433aab5a0`.
Implementation branch: `fix/release-readiness-athlete-coach`.
No live SQL, live RLS edits, credential rotation, production environment changes, deployment, or merge is authorized/performed by this implementation.

## Implemented

- Patched TanStack Start to 1.168.60, with one matching router instance and patched start-server-core 1.169.39. Retained React, TanStack, Vite 7, Supabase, Gemini and the existing Lovable/Nitro adapter. Compatible npm audit fixes remove production advisories. npm/package-lock.json is authoritative; removed the stale Bun lockfile.
- Central paid-call authentication, explicit AI-processing consent, shared PostgreSQL quotas (20 AI operations/hour and 100/day per account), provider timeouts, one retry, and output-token caps. Missing quota infrastructure fails closed. Food/video server functions also require auth middleware. Chat accepts bounded text-only user/assistant messages. Request-level streaming size cap is 9 MB, video frame data is capped at 8 MB total, each image at 1.4 MB, and chat bodies at 64 KB. AI outputs are runtime validated.
- Browser-session persistence uses explicit local or tab-scoped storage, never a remote sign-out on new-tab opening. One auth provider clears account-specific caches on account changes. Protected pages require login. The web app deliberately uses client-side protected routing (`ssr: false`), compatible with browser-stored Supabase sessions; the separate marketing site remains independent.
- Server-saved profile form supports name, age, dimensions, disciplines, goals, focus, motivation, experience, training setup, injuries, favourite athlete, timezone and privacy settings. Signup onboarding records the browser timezone; existing profiles default to UTC until reviewed. Role, ownership, invite code and streak fields cannot be changed directly by authenticated users.
- Athlete-controlled coach linking through private coach invite codes, relationship revocation, global coach-data consent and per-video sharing. Friend invitations use private invite codes; direct friendship insertion is denied. Friends receive a limited profile projection, never full health/injury profiles.
- Database permissions cover direct PostgREST access, not just UI checks: own data, linked consenting coach access, unpublished plan privacy, coach ownership/assignment, safe note recipients, competition entries, chat conversation ownership, video folder ownership and private video storage.
- Training publication is one serialized transaction with a unique session/athlete key. Republishing updates plan content without overwriting completion status/time. Athletes can change completion through a dedicated RPC and training-detail controls, without gaining permission to alter coach plan content.
- Workout logging reserves a durable record before AI processing. Stable request IDs survive retries and tab reloads; conflicting payloads cannot reuse an ID. Provider failure returns saved-record success and separate analysis failure. Check-in/workout synchronization is atomic, retains identity across discipline changes and rejects stale analysis results. Rest-day corrections hide superseded generated records while preserving raw history and manually logged workouts.
- Dashboard query failures are visible and retryable. Server day boundaries and athlete calendar/dashboard dates use the stored athlete timezone.
- Removed raw-HTML content editing. Old local HTML snapshots are ignored, preserving React controls. Removed invented training fallback plans and static HRV advice. Nutrition, diagnostics, competition, devices and gear prototype pages have explicit example-data notices. Unsupported settings controls no longer imply working privacy/security/notification behavior.
- Moved route/source snapshots outside active source discovery. Converted the UTF-16 generated database type file to UTF-8 and added explicit new schema/RPC types. Removed unsafe `any` boundaries in affected services.
- Added separate Vitest/Playwright configuration, isolated database and mock-browser harnesses, and CI checks without production secrets.

## Changed areas

The draft PR diff is the authoritative complete file list. Main groups:

- `src/lib/security/`, AI gateway and `src/routes/api/chat.ts`
- Supabase auth clients/middleware/types, shared auth/session hooks and protected route root
- `src/lib/features/{profile,friends,daily-checkin,workout,dashboard,regeneration}.functions.ts`
- Coach training, individual-plan, calendar and template server functions
- Profile editor/connections, athlete training calendar/details, dashboard, settings and preview pages
- Coach athlete-list focus rendering and shared-video URL lifetime (five minutes)
- Dependency manifests/locks, CI, test/configuration scripts, archived snapshots and release documentation
- Marketing contact link and website dependency lock

### Prepared forward migrations

1. `20261114090000_reconcile_release_schema.sql`: additive reconciliation against committed generated schema evidence; required unique keys, recording identities and relationship metadata. New foreign keys use NOT VALID to preserve legacy orphans for deliberate staging review; new writes are still constrained.
2. `20261114091000_authorization_and_atomic_workflows.sql`: database authorization, safe friendship/coach projections and relationships, transactional publishing/completion, persisted AI quotas.
3. `20261114092000_retry_safe_recording.sql`: idempotent workout/check-in RPCs, revision-safe analyses, non-destructive rest-day corrections.
4. `20261114093000_shared_data_integrity.sql`: note assignment, video folder ownership and private shared-video storage.

Each migration is transactional. Existing duplicate groups cause unique-index creation to fail; they are not deleted or silently deduplicated. Policies on the specifically affected public tables are replaced because permissive PostgreSQL policies combine with OR. This is intentionally a substantial authorization change that requires live-schema review and explicit approval before application.

## Migration evidence and limits

Git history, all committed root/nested SQL and the generated schema snapshot were inspected. A separate local historical replay fails at `20260818000100_convert_onboarding_fields_to_arrays.sql`: `goal_motivation` does not yet exist. Several original identifiers have inconsistent date widths and video files are nested outside normal discovery. These historical files were preserved.

No Supabase management token, direct database credentials, or live migration ledger is available. The new migrations have been tested on an isolated PostgreSQL 17 reconstruction using the committed schema evidence, synthetic auth/storage schemas, authenticated roles and fake account records. This proves the tested SQL/permissions under those conditions, not equivalence to your live project or a successful standard replay of the broken old migration chain.

The standard clean Supabase history replay therefore remains blocked. An owner must compare the live ledger/schema and approve a reviewed baseline/history-repair plan before either a fresh real Supabase environment or production application. Do not run all migrations blindly or move/renumber previously applied migrations without that evidence.

## Verification

See `VALIDATION.md` for final results, test scope and commands. Browser tests run against local mocks only. SQL authorization tests run against actual disposable PostgreSQL, with a minimal Supabase auth/storage shim. Neither is a live Supabase end-to-end test.

## Manual actions and remaining release gates

1. Inspect `supabase/preflight-release.sql` and run it manually with appropriate read-only access against the intended project. It reads the migration ledger, schema, policies, indexes, bucket settings and duplicate counts, without exporting athlete records.
2. Review the captured ledger and schema against these forward migrations. Back up the live database. Resolve any duplicates/type differences deliberately. Approve a staging baseline/history plan; test on a real isolated Supabase staging project before separately approving live migrations.
3. Review the previously committed `.env`. The tracked file is removed and `.env.example` is safe. A local ignored copy was retained for workspace continuity. If its old Gemini value is genuine, revoke/replace it manually and consider controlled Git-history cleanup. No credential was rotated or tested against Google.
4. Configure backend Supabase URL/publishable key and Gemini key, and frontend VITE Supabase URL/publishable key, in the eventual hosting environment yourself. Never put a Gemini/server secret in VITE variables. New AI checks require the reviewed quota/consent migration.
5. Test real athlete/coach login, Google OAuth, password reset, invitation delivery, CRUD, video uploads, signed URLs, Gemini responses and quota behavior in staging. No live credentials/provider requests were used here. Already issued video signed URLs remain usable until expiry; newly created coach URLs last five minutes.
6. Seven moderate development-only npm advisories remain in the TypeScript ESLint/minimatch chain. No forced major override was introduced. Keep their remediation separate from production runtime patches. Ten non-failing lint warnings remain.
7. Prototype pages remain labeled previews; they are not completed production diagnostics/nutrition/device products. Notification delivery, automatic data export, session management UI, billing/entitlements, and some language coverage remain incomplete.
8. Confirm privacy documentation, health-data retention/deletion/export, rules for minors, provider agreements, monitoring, backups/restore and hosting execution of server endpoints. These are still release gates for real athlete data.
9. Review this draft PR and its CI results. Do not merge/deploy until the database and staging gates are satisfied.

The app is closer to a supervised beta; this change is not a declaration that it is ready for unrestricted public launch.

## Delivery status

The implementation was committed locally on the dedicated branch. Both the Git push and the connected GitHub branch-creation API returned HTTP 403; the API says "Resource not accessible by integration." Repository permission metadata did not establish actual integration write permission. No remote branch, draft PR or remote CI result is claimed.

Reconnect an authorized GitHub connection with repository Contents and Pull Requests write access, or push from an owner-authorized checkout. The exact prepared PR description is in `docs/release/DRAFT_PR.md`.

```sh
git push --set-upstream origin fix/release-readiness-athlete-coach
gh pr create --draft --base week2-architecture-refactor --head fix/release-readiness-athlete-coach --title "Harden athlete and coach release paths" --body-file docs/release/DRAFT_PR.md
```

A Git bundle can transfer this committed branch to another checkout that already contains the audited base commit. After downloading the bundle:

```sh
git fetch /path/to/aether-release-readiness.bundle refs/heads/fix/release-readiness-athlete-coach:refs/heads/fix/release-readiness-athlete-coach
git switch fix/release-readiness-athlete-coach
```
