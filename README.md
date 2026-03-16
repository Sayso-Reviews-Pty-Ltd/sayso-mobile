# Sayso Mobile

Expo Router + React Native app for the Sayso consumer mobile experience.

## Current State

- Core user flows are implemented for auth, onboarding, feed/discovery, saved items, profile, notifications, DMs, reviews, and event/special detail screens.
- Role gating is active. `business_owner` and `admin` accounts are redirected to `/role-unsupported`.
- Release readiness work is tracked in `docs/release/ship-readiness-plan-2026-03-16.md`.

## Product Scope

- This app targets end-user (consumer) journeys.
- Business-owner and admin management workflows remain web-only for this release.

## Route Surface (Expo Router)

- Tabs:
  - `/home`
  - `/leaderboard`
  - `/saved`
  - `/profile`
- Stack routes include:
  - `/trending`, `/for-you`, `/events`, `/events-specials`
  - `/business/[id]`, `/event/[id]`, `/special/[id]`
  - `/reviewer/[id]`, `/profile/[username]`
  - `/notifications`, `/dm`, `/dm/[threadId]`
  - Static pages: `/about`, `/contact`, `/privacy`, `/terms`
- Modal/auth routes include:
  - `/onboarding`, `/onboarding/select-account-type`, `/complete`
  - `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`
  - `/auth/callback`, `/auth/auth-code-error`
  - `/write-review/[type]/[id]`

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript (strict mode)
- Expo Router
- Supabase JS v2
- TanStack Query v5
- Expo Notifications
- MapLibre React Native (native runtime)

## Prerequisites

- Node.js 20 LTS recommended
- npm 9+
- Expo Go, emulator, or device
- Supabase project credentials
- Sayso backend API base URL
- Local `@sayso/contracts` package path available (configured as `file:../../sayso_web/packages/contracts`)

## Environment Variables

Copy `.env.example` to `.env` and set values.

Required:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Recommended:

- `EXPO_PUBLIC_EAS_PROJECT_ID` (push token registration)

Optional (feature dependent):

- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (map rendering features)
- `EXPO_PUBLIC_MAPBOX_WEB_PIN_URL` (web map marker asset)
- `EXPO_PUBLIC_ALGOLIA_APP_ID` and `EXPO_PUBLIC_ALGOLIA_SEARCH_KEY` (Algolia-first search path)

Security hardening flags:

- `EXPO_PUBLIC_API_PINNED_KEY_HASHES`
- `EXPO_PUBLIC_SECURITY_ENFORCE_PINNING`
- `EXPO_PUBLIC_SECURITY_ENFORCE_INTEGRITY`
- `EXPO_PUBLIC_SECURITY_ALLOW_EMULATOR`

Notes:

- In non-dev builds, `EXPO_PUBLIC_API_BASE_URL` must be HTTPS.
- If Supabase env vars are missing, the app logs warnings and auth cannot function correctly.
- API base URL is normalized to `https://www.sayso.co.za` when `https://sayso.co.za` is provided.

## Setup

```bash
npm install
cp .env.example .env
```

Start dev server:

```bash
npm run start
```

## Scripts

- `npm run start`: Start Expo (with dependency validation disabled)
- `npm run start:offline`: Start Expo offline
- `npm run android`: Run Android native build
- `npm run ios`: Run iOS native build
- `npm run web`: Run Expo for web
- `npm run type-check`: Run TypeScript checks without emit

## Auth, Deep Linking, and Role Guarding

- App scheme is `sayso`.
- OAuth callback route is `/auth/callback`.
- Universal/App Links are configured in `app.config.ts` for:
  - `https://sayso.co.za`
  - `https://www.sayso.co.za`
- Root guard behavior:
  - Unauthenticated users are funneled to onboarding/auth routes.
  - Onboarding progression is step-gated.
  - Unsupported roles are redirected to `/role-unsupported`.

## Notifications

- Unread count is provided globally via `NotificationsProvider`.
- Push token registration posts to `/api/user/push-tokens`.
- Realtime notification updates are subscribed via Supabase channels.
- DM notification quick-reply action is wired when native notifications are available.

## Security and Hardening

- Mobile API requests use centralized error handling and retry behavior (`src/lib/api.ts`).
- Runtime hardening scaffold exists in `src/security/*`.
- See:
  - `docs/security/native-hardening-scaffold.md`
  - `docs/security/backend-handoff-checklist.md`

## CI

GitHub Actions currently run:

- TypeScript check
- Production dependency audit (`npm audit --omit=dev --audit-level=high`)
- Secret scan (Gitleaks)

Workflow file: `.github/workflows/security.yml`

## Project Structure

```txt
app/
  (tabs)/
  (stack)/
  (modals)/
  _layout.tsx
  index.tsx
  auth/callback.tsx
  role-unsupported.tsx
src/
  components/
  hooks/
  lib/
  navigation/
  providers/
  screens/
  security/
  styles/
docs/
  release/
  security/
```
