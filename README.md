# Sayso Mobile

Expo Router + React Native app for the Sayso consumer mobile experience.

## Current State

- Core user flows are implemented for auth, onboarding, feed/discovery, saved items, profile, notifications, DMs, reviews, and event/special detail screens.
- Role gating is active. `business_owner` and `admin` accounts are redirected to `/role-unsupported`.
- Release readiness work is tracked in `docs/release/ship-readiness-plan-2026-03-16.md`.

## Product Scope

- This app targets end-user (consumer) journeys.
- Business-owner and admin management workflows remain web-only for this release.

---

## New Developer Onboarding

### Prerequisites

Before cloning, make sure you have:

- **Node.js 20 LTS** (check with `node -v`)
- **npm 9+** (check with `npm -v`)
- **Expo CLI** — install globally if needed: `npm install -g expo-cli`
- Access to the **Sayso Supabase project** — get credentials from the team
- Access to the **sayso_web** monorepo sibling (contracts package lives there)
- An iOS simulator, Android emulator, or physical device with Expo Go installed

### Monorepo Layout

This repo is designed to sit alongside `sayso_web` as a sibling directory:

```
workspace/
  sayso-mobile/      ← this repo
  sayso_web/
    packages/
      contracts/     ← shared type contracts, required locally
```

The `@sayso/contracts` package is resolved via a local file path (`file:../../sayso_web/packages/contracts`). Make sure the sibling repo is cloned and its packages are built before running `npm install` here.

### Step-by-Step Setup

**1. Clone and install dependencies**

```bash
git clone <repo-url> sayso-mobile
cd sayso-mobile
npm install
```

**2. Set up environment variables**

```bash
cp .env.example .env
```

Then open `.env` and fill in values. The minimum required to run the app:

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API base URL (must be HTTPS in non-dev builds) |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

See the full [Environment Variables](#environment-variables) section below for all options.

**3. Start the development server**

```bash
npm run start
```

This starts Expo with dependency validation disabled (see `EXPO_NO_DEPENDENCY_VALIDATION` note below). Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

**4. Run type checks**

```bash
npm run type-check
```

**5. Run the test suite**

```bash
npm test
```

### Known Gotchas

- **`EXPO_NO_DEPENDENCY_VALIDATION=1`** is set in `npm run start` and `npm run web`. This suppresses Expo's peer dependency warnings caused by version mismatches in the monorepo setup — it is intentional and expected.
- **`@sayso/contracts` must exist locally.** If `npm install` fails with a file path resolution error, ensure `sayso_web` is cloned at the sibling path and its packages have been installed.
- **Supabase env vars are required for auth.** If they are missing, the app will log warnings at startup and authentication will not work correctly.
- **API base URL normalisation.** If you set `EXPO_PUBLIC_API_BASE_URL` to `https://sayso.co.za`, the app automatically normalises it to `https://www.sayso.co.za` internally.
- **MapLibre requires a native build.** Map features will not work in Expo Go — you need `npm run android` or `npm run ios` for a full native build.

---

## Environment Variables

Copy `.env.example` to `.env` and set values.

**Required:**

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Recommended:**

- `EXPO_PUBLIC_EAS_PROJECT_ID` — required for push token registration

**Optional (feature dependent):**

- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` — map rendering features
- `EXPO_PUBLIC_MAPBOX_WEB_PIN_URL` — web map marker asset
- `EXPO_PUBLIC_ALGOLIA_APP_ID` and `EXPO_PUBLIC_ALGOLIA_SEARCH_KEY` — Algolia-first search path

**Security hardening flags:**

- `EXPO_PUBLIC_API_PINNED_KEY_HASHES`
- `EXPO_PUBLIC_SECURITY_ENFORCE_PINNING`
- `EXPO_PUBLIC_SECURITY_ENFORCE_INTEGRITY`
- `EXPO_PUBLIC_SECURITY_ALLOW_EMULATOR`

---

## Scripts

| Command | Description |
|---|---|
| `npm run start` | Start Expo dev server (dependency validation disabled) |
| `npm run start:offline` | Start Expo in offline mode |
| `npm run android` | Run native Android build |
| `npm run ios` | Run native iOS build |
| `npm run web` | Run Expo for web |
| `npm run type-check` | TypeScript check without emit |
| `npm test` | Run Jest test suite |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Run Jest with coverage report |
| `npm run test:ci` | Run Jest in CI mode (serial, no watch) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 |
| Runtime | React Native 0.81 / React 19 |
| Language | TypeScript (strict mode) |
| Routing | Expo Router |
| Auth + DB | Supabase JS v2 |
| Data fetching | TanStack Query v5 |
| Push notifications | Expo Notifications |
| Maps | MapLibre React Native (native runtime) |
| Search | Algolia (optional path) |

---

## Project Structure

```
sayso-mobile/
├── app/                    # Expo Router file-based routes
│   ├── (tabs)/             # Bottom tab routes (home, leaderboard, saved, profile)
│   ├── (stack)/            # Stack routes (business detail, event detail, etc.)
│   ├── (modals)/           # Modal routes (auth, onboarding, review writing)
│   ├── auth/               # Auth callback and error handling
│   ├── _layout.tsx         # Root layout (providers, global guard)
│   ├── index.tsx           # Entry redirect
│   └── role-unsupported.tsx
├── src/
│   ├── components/         # Shared UI components (see design system rules)
│   ├── hooks/              # React Query data hooks, one per resource type
│   ├── lib/                # Core utilities: API client, Supabase, query client, env
│   ├── navigation/         # Navigation helpers and typed link utilities
│   ├── providers/          # React context providers (auth, profile, notifications, etc.)
│   ├── screens/            # Screen-level components, organised by route group
│   ├── security/           # Runtime hardening scaffold
│   └── styles/             # Design tokens: colors, spacing, radii, shadows
├── docs/
│   ├── release/            # Ship readiness plan and release notes
│   └── security/           # Native hardening docs and backend checklist
├── assets/                 # Static images and fonts
├── plugins/                # Expo config plugins
├── app.config.ts           # Expo app configuration (schemes, deep links, EAS)
├── babel.config.js
├── jest.config.ts
└── tsconfig.json
```

### Key Files to Know

| File | Purpose |
|---|---|
| `src/lib/api.ts` | Centralised API client with retry logic and error handling |
| `src/lib/supabase.ts` | Supabase client singleton |
| `src/lib/queryClient.ts` | TanStack Query client config |
| `src/lib/env.ts` | Typed env var access with validation warnings |
| `src/providers/AuthProvider.tsx` | Session management, auth state |
| `src/providers/Providers.tsx` | Composes all providers for the app root |
| `src/components/RootGuard.tsx` | Route protection: auth gating, role gating, onboarding gating |
| `src/styles/colors.ts` | Design token: all colour values |
| `src/styles/layout.ts` | Design token: spacing scale and layout constants |

---

## Design System

All UI work must follow the rules in `CLAUDE.md`. A summary for new developers:

**Grid:** All layout aligns to an **8pt base grid** (4pt for fine adjustments). Use only these spacing values: `4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64`.

**Tokens:** Colours, spacing, typography, radii, and shadows all come from `src/styles/`. Do not hardcode values — pull from the token files.

**Components:** Before building something new, check `src/components/` first. Reuse or extend what exists. Shared UI patterns live there and should not be duplicated.

**No creative deviation:** Do not introduce new colours, gradients, shadows, or decorative elements that aren't already in the design system. When in doubt, match what already exists elsewhere in the codebase.

---

## Route Surface (Expo Router)

**Tabs:**
- `/home`
- `/leaderboard`
- `/saved`
- `/profile`

**Stack routes:**
- `/trending`, `/for-you`, `/events`, `/events-specials`
- `/business/[id]`, `/event/[id]`, `/special/[id]`
- `/reviewer/[id]`, `/profile/[username]`
- `/notifications`, `/dm`, `/dm/[threadId]`
- Static pages: `/about`, `/contact`, `/privacy`, `/terms`

**Modal/auth routes:**
- `/onboarding`, `/onboarding/select-account-type`, `/complete`
- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`
- `/auth/callback`, `/auth/auth-code-error`
- `/write-review/[type]/[id]`

---

## Auth, Deep Linking, and Role Guarding

- App scheme is `sayso`.
- OAuth callback route is `/auth/callback`.
- Universal/App Links are configured in `app.config.ts` for `https://sayso.co.za` and `https://www.sayso.co.za`.
- Root guard behaviour:
  - Unauthenticated users are funnelled to onboarding/auth routes.
  - Onboarding progression is step-gated.
  - Unsupported roles (`business_owner`, `admin`) are redirected to `/role-unsupported`.

---

## Notifications

- Unread count is provided globally via `NotificationsProvider`.
- Push token registration posts to `/api/user/push-tokens`.
- Realtime notification updates are subscribed via Supabase channels.
- DM notification quick-reply action is wired when native notifications are available.

---

## Testing

Tests use **Jest** with `jest-expo` preset and **React Native Testing Library**.

```bash
npm test                  # run all tests
npm run test:watch        # watch mode for development
npm run test:coverage     # generate coverage report
npm run test:ci           # CI mode (serial, non-interactive)
```

Test files live in `src/__tests__/` and follow the pattern `**/*.test.ts(x)`. Coverage is collected from `src/lib/`, `src/hooks/`, and `src/components/`.

The `moduleNameMapper` in `jest.config.ts` resolves `@sayso/contracts` to the local TypeScript source, so the sibling repo must be present for tests to run.

---

## Security and Hardening

- Mobile API requests use centralised error handling and retry behaviour (`src/lib/api.ts`).
- Runtime hardening scaffold exists in `src/security/`.
- See:
  - `docs/security/native-hardening-scaffold.md`
  - `docs/security/backend-handoff-checklist.md`

---

## CI

GitHub Actions currently run:

- TypeScript check
- Production dependency audit (`npm audit --omit=dev --audit-level=high`)
- Secret scan (Gitleaks)

Workflow file: `.github/workflows/security.yml`
