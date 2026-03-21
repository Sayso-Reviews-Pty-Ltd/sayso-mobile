# Sayso Mobile

Expo Router + React Native app for the Sayso consumer mobile experience.

## Current State

- Core user flows are implemented: auth, onboarding, feed/discovery, saved items, profile, notifications, DMs, reviews, and event/special detail screens.
- Auth flows are hardened: PKCE exchange abort-on-timeout, double-submit race guards, onboarding resume across session expiry, already-used/expired link disambiguation, and profile-fetch subscription model.
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
- Access to the **sayso_web** sibling repo (contracts package lives there)
- An iOS simulator, Android emulator, or physical device with Expo Go installed

### Monorepo Layout

This repo is designed to sit alongside `sayso-web` as a sibling directory:

```
workspace/
  sayso-mobile/      ← this repo
  sayso-web/
    packages/
      contracts/     ← shared type contracts, required locally
```

The `@sayso/contracts` package is resolved via a local path alias (`./src/contracts/index.ts`) — no build step required. The sibling repo must be cloned before running `npm install`.

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
- **`@sayso/contracts` is a local alias.** It resolves to `./src/contracts/index.ts` in both TypeScript and Jest — no sibling build step is needed, but the file must exist.
- **Supabase env vars are required for auth.** If they are missing, the app will log warnings at startup and authentication will not work.
- **API base URL normalisation.** `https://sayso.co.za` is automatically normalised to `https://www.sayso.co.za` internally.
- **MapLibre requires a native build.** Map features will not work in Expo Go — use `npm run android` or `npm run ios` for a full native build.

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
| Routing | Expo Router v6 (file-based) |
| Auth + DB | Supabase JS v2 |
| Data fetching | TanStack Query v5 |
| Animations | React Native Reanimated 4 |
| Push notifications | Expo Notifications |
| Maps | MapLibre React Native (native runtime) |
| Search | Algolia v5 (optional path) |
| Secure storage | Expo SecureStore (Keychain / EncryptedSharedPreferences) |

---

## Project Structure

```
sayso-mobile/
├── app/                          # Expo Router file-based routes (thin re-exports)
│   ├── (tabs)/                   # Bottom tab routes
│   ├── (stack)/                  # Stack routes
│   ├── (modals)/                 # Modal and auth routes
│   ├── auth/                     # OAuth callback
│   ├── _layout.tsx               # Root layout — providers, fonts, status bar
│   ├── index.tsx                 # Entry redirect
│   └── role-unsupported.tsx      # Business owner / admin rejection screen
├── src/
│   ├── components/               # Shared UI components
│   ├── hooks/                    # React Query data hooks, one per resource
│   ├── lib/                      # Core utilities: API client, Supabase, env, Algolia
│   ├── navigation/               # Route builders and screen options
│   ├── providers/                # React context providers
│   ├── screens/                  # Screen implementations, organised by route group
│   ├── security/                 # Runtime hardening scaffold
│   └── styles/                   # Design tokens: colours, spacing, radii, shadows
├── docs/
│   ├── release/                  # Ship readiness plan and release notes
│   └── security/                 # Native hardening docs and backend checklist
├── assets/                       # Static images and fonts
├── plugins/                      # Expo config plugins
├── app.config.ts                 # Expo app config (schemes, deep links, EAS)
├── babel.config.js
├── jest.config.ts
└── tsconfig.json
```

---

## Screen Architecture

Route files in `app/` are thin — they re-export screens from `src/screens/`. All logic lives in `src/`.

Large screens are decomposed into feature subdirectories:

```
src/screens/
├── tabs/
│   ├── home/                     # Home feed sub-components
│   ├── home-screen/              # HomeScreenView + styles
│   └── profile/                  # ProfileScreen + controller hook + sub-components
├── modals/
│   ├── login/                    # LoginScreen + controller hook + AuthForm component
│   ├── forgot-password/          # ForgotPasswordScreen + styles
│   ├── reset-password/           # ResetPasswordScreen + controller hook + sub-components
│   ├── verify-email/             # VerifyEmailScreen + styles
│   └── write-review/             # WriteReviewScreen + sub-components
├── stack/
│   ├── achievements/
│   ├── deal-breakers/
│   ├── dm/
│   ├── for-you-screen/
│   └── trending-screen/
└── shared/                       # EventsSpecialsFeedScreen, StaticContentScreen
```

### Controller Hook Pattern

Screens with non-trivial logic extract state and handlers into a co-located `use<Screen>Controller.ts` hook. The screen component is responsible only for rendering. Example:

```
src/screens/modals/reset-password/
├── ResetPasswordScreen.tsx           # Renders only
├── useResetPasswordController.ts     # All state, effects, handlers
├── ResetPasswordScreen.styles.ts     # Styles
├── constants.ts
├── helpers.ts
├── types.ts
└── components/
    ├── ResetPasswordForm.tsx
    ├── ResetPasswordHeader.tsx
    ├── ResetPasswordInvalidState.tsx
    ├── ResetPasswordSuccessState.tsx
    ├── ResetPasswordLoadingState.tsx
    └── ResetPasswordBackButton.tsx
```

### 300 LOC Rule

No file may exceed 300 lines. If a file approaches the limit, split it before adding more logic. This applies to all `.ts` and `.tsx` files.

---

## Key Files

| File | Purpose |
|---|---|
| `src/lib/api.ts` | Centralised API client with retry logic and `ApiError` class |
| `src/lib/supabase.ts` | Supabase client singleton with `SecureStore` session adapter |
| `src/lib/queryClient.ts` | TanStack Query client config (staleTime, gcTime, retry) |
| `src/lib/env.ts` | Typed env var access with validation warnings |
| `src/providers/AuthProvider.tsx` | Session management; exposes `signInWithPassword`, `signInWithGoogle`, `signOut` |
| `src/providers/ProfileProvider.tsx` | User profile state; fetches on `SIGNED_IN` via `onAuthStateChange` subscription |
| `src/providers/Providers.tsx` | Composes all providers for the app root |
| `src/components/RootGuard.tsx` | Auth gating, role gating, onboarding step-gating, and onboarding resume |
| `src/navigation/routes.ts` | Typed route builder functions |
| `src/styles/colors.ts` | Design token: all colour values |
| `src/styles/layout.ts` | Design token: spacing scale and layout constants |
| `src/contracts/index.ts` | API response DTOs shared with the web project |

---

## Providers

| Provider | Responsibility |
|---|---|
| `AuthProvider` | Supabase session + auth methods |
| `ProfileProvider` | User profile; re-fetches on every `SIGNED_IN` event |
| `NotificationsProvider` | Unread count, push badge management, realtime updates |
| `FiltersProvider` | Search/filter state |
| `ScrollToTopProvider` | Global scroll-to-top signal for tab press |
| `SecurityProvider` | Runtime integrity checks, cert pinning |

---

## Auth Flow

```
app/index.tsx
  └── RootGuard (src/components/RootGuard.tsx)
        ├── No session          → /onboarding
        ├── Unverified email    → /verify-email
        ├── Onboarding step     → /onboarding/<step>  (resumes from AsyncStorage on re-auth)
        ├── Unsupported role    → /role-unsupported
        └── Verified consumer   → /(tabs)/home
```

**Auth screens** (all in `app/(modals)/`):

| Route | Screen |
|---|---|
| `/onboarding` | Onboarding intro — RootGuard is sole redirect authority |
| `/login` | Email/password + Google OAuth |
| `/register` | New account sign-up |
| `/forgot-password` | Request password reset email |
| `/reset-password` | PKCE exchange + password update form |
| `/verify-email` | Resend verification, check verification status |
| `/change-password` | Authenticated password change (re-verifies current password) |
| `/auth/callback` | OAuth + magic link callback handler |
| `/auth/auth-code-error` | PKCE failure landing page |

**Key hardening details:**

- `RootGuard` is the single source of truth for session-based redirects. Screens do not redirect authenticated users — `OnboardingScreen` carries a comment at the removed call site to enforce this.
- `ProfileProvider` uses an `onAuthStateChange` subscription (not a mount effect) so profile state is always fresh after re-authentication.
- The reset-password exchange uses `Promise.race` with a `timedOut` flag. If the timeout wins, `supabase.auth.signOut()` is called fire-and-forget to invalidate any partial session, and the in-flight exchange result is discarded.
- `isAuthSettling` (a ref, not state) in `useLoginController` prevents a second `signInWithPassword` call before the first `SIGNED_IN` subscription event fires.
- Onboarding progress is written to `AsyncStorage` (`onboarding_resume`) before redirecting an unauthenticated user away from a mid-flow step, and consumed by `RootGuard` after re-authentication.

---

## Route Surface

**Tabs:**
- `/home`, `/leaderboard`, `/saved`, `/profile`

**Stack routes:**
- `/trending`, `/for-you`, `/events-specials`
- `/business/[id]`, `/event/[id]`, `/special/[id]`
- `/notifications`, `/dm`, `/dm/[threadId]`
- `/achievements`, `/deal-breakers`
- `/profile/[username]`, `/reviewer/[id]`
- Static pages: `/about`, `/contact`, `/privacy`, `/terms`

**Modal / auth routes:**
- `/onboarding`, `/onboarding/select-account-type`, `/complete`
- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/change-password`
- `/auth/callback`, `/auth/auth-code-error`
- `/write-review/[type]/[id]`

---

## Design System

All UI work must follow the rules in `CLAUDE.md`. Summary for new developers:

**Grid:** All layout aligns to an **8pt base grid** (4pt for fine adjustments). Use only these spacing values: `4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64`.

**Tokens:** Colours, spacing, typography, radii, and shadows all come from `src/styles/`. Do not hardcode values.

**Components:** Before building something new, check `src/components/` first. Reuse or extend what exists.

**No creative deviation:** Do not introduce new colours, gradients, shadows, or decorative elements not already in the design system.

---

## Notifications

- Unread count is provided globally via `NotificationsProvider`.
- Push token registration posts to `/api/user/push-tokens`.
- Realtime notification updates subscribe via Supabase channels.
- DM notification quick-reply action is wired when native notifications are available.

---

## Testing

Tests use **Jest** with `jest-expo` preset and **React Native Testing Library**.

```bash
npm test                  # run all tests
npm run test:watch        # watch mode
npm run test:coverage     # generate coverage report
npm run test:ci           # CI mode (serial, non-interactive)
```

Test files live in `src/__tests__/` mirroring the `src/` structure:

```
src/__tests__/
├── setup.ts                # Mocks: React Query, Supabase, SecureStore, icons, Reanimated
├── hooks/                  # Hook tests (useChangePassword, useBusinessReviews, etc.)
├── lib/                    # Utility tests (api, calendar, distance, routes)
├── navigation/             # Route builder tests
├── screens/                # Screen integration tests (ChangePasswordScreen, etc.)
└── components/             # Component tests
```

Coverage is collected from `src/lib/`, `src/hooks/`, and `src/components/`. The `@sayso/contracts` alias resolves to `./src/contracts/index.ts` in Jest — no sibling build step needed.

---

## Security and Hardening

- Mobile API requests use centralised error handling and retry behaviour (`src/lib/api.ts`).
- Supabase tokens are stored in the platform secure enclave via `expo-secure-store`.
- Runtime hardening scaffold: `src/security/` (integrity checks, jailbreak detection, cert pinning).
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
