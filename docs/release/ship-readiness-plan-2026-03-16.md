# Ship Readiness Plan (March 16-29, 2026)

## Goal

Ship a stable mobile release candidate with no open P0/P1 issues, hardened security settings in staging, and repeatable release checks for iOS and Android.

## Baseline Snapshot (March 16, 2026)

- TypeScript check passes (`npm run type-check`).
- Core route surface is implemented across tabs, stack routes, and modals.
- CI includes type-check, dependency audit, and secret scan.
- Current gaps are test coverage, release hardening, and fallback UX/data completion.

## Week 1 (March 16-22, 2026): Stability + Test Foundation

1. Stabilize in-progress UI refactor
- Freeze scope to bug fixes and release blockers only.
- Resolve obvious regressions in recently touched screens (notifications, onboarding, for-you, event detail, home sections).
- Definition of done: no known P0/P1 UI regressions in smoke test list.

2. Add automated test foundation
- Add Jest + React Native Testing Library setup for Expo.
- Add `test` and `test:ci` scripts.
- Create critical-path tests:
  - API error handling and retry behavior.
  - Authentication guard routing behavior.
  - Write review submission happy/failure paths.
  - Notifications list interactions (mark read/delete).
- Definition of done: tests run locally and in CI.

3. Expand CI gates
- Add test job to CI.
- Fail PRs on test failures.
- Keep current audit and gitleaks jobs.
- Definition of done: PR checks enforce type-check + tests + security scan.

4. Close fallback copy/data gaps
- Replace or intentionally accept "coming soon/not available" states in business and event detail cards.
- Confirm unsupported role behavior is expected for this release and document it in release notes.
- Definition of done: every fallback on critical screens has approved copy and expected behavior.

## Week 2 (March 23-29, 2026): Hardening + Release Candidate

1. Complete native security rollout in staging
- Install and link runtime pinning/integrity native modules.
- Configure valid pin hashes and staging env flags.
- Run staging verification with enforcement OFF first, then ON.
- Definition of done: sensitive actions are correctly blocked only when checks fail.

2. Backend contract and security sign-off
- Confirm backend error envelope and code catalog.
- Confirm rate-limit semantics and revoke-all session endpoint timeline.
- Validate trace ID propagation.
- Definition of done: mobile/backend contract checklist signed off.

3. Release QA pass
- Run end-to-end smoke on iOS and Android:
  - Login/register/reset password
  - Onboarding flow
  - Home/search/trending/for-you
  - Business + event/special detail
  - Saved/notifications/profile
  - Write review + media upload
- Definition of done: all smoke tests pass and all P0/P1 issues are closed.

4. Build and launch readiness
- Produce release-candidate builds.
- Validate app config, env configuration, and crash-free startup.
- Prepare release notes and known issues.
- Definition of done: go/no-go checklist approved.

## Exit Criteria (Done Means Done)

- No TypeScript errors.
- CI green on type-check, tests, audit, and secrets scan.
- No open P0/P1 bugs.
- Security hardening validated in staging.
- RC build installed and smoke-tested on iOS + Android.
- Release checklist approved by mobile + backend stakeholders.

## Priority Order

1. Test foundation + CI enforcement
2. Stabilize current in-progress UI changes
3. Security rollout in staging
4. Full QA + release candidate build
