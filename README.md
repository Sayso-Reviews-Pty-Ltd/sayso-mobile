# Sayso Mobile

Consumer-facing mobile app built with Expo + React Native. Covers discovery, reviews, DMs, notifications, and user profiles. Business-owner and admin workflows are web-only.

---

## Quick Start

**Prerequisites:** Node.js 20 LTS, npm 9+, Expo Go (device) or an iOS/Android simulator.

```bash
git clone <repo-url> sayso-mobile
cd sayso-mobile
npm install
cp .env.example .env   # fill in Supabase + API values (see below)
npm run start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

> **Note:** `npm run start` sets `EXPO_NO_DEPENDENCY_VALIDATION=1` intentionally — this suppresses false peer-dependency warnings from the monorepo setup.

---

## Environment Variables

Copy `.env.example` to `.env` and set values before running.

### Required

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API base URL (`https://`) |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

### Recommended

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_EAS_PROJECT_ID` | Required for push token registration |

### Optional

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` | Map rendering (native builds only) |
| `EXPO_PUBLIC_MAPBOX_WEB_PIN_URL` | Web map marker asset |
| `EXPO_PUBLIC_ALGOLIA_APP_ID` | Algolia search (optional path) |
| `EXPO_PUBLIC_ALGOLIA_SEARCH_KEY` | Algolia search key |
| `EXPO_PUBLIC_API_PINNED_KEY_HASHES` | Certificate pinning hashes |
| `EXPO_PUBLIC_SECURITY_ENFORCE_PINNING` | Enable cert pinning enforcement |
| `EXPO_PUBLIC_SECURITY_ENFORCE_INTEGRITY` | Enable integrity checks |
| `EXPO_PUBLIC_SECURITY_ALLOW_EMULATOR` | Allow emulator in hardened builds |

---

## Scripts

| Command | Description |
|---|---|
| `npm run start` | Expo dev server |
| `npm run start:offline` | Expo dev server (offline mode) |
| `npm run ios` | Native iOS build |
| `npm run android` | Native Android build |
| `npm run web` | Expo for web |
| `npm run type-check` | TypeScript check (no emit) |
| `npm test` | Run Jest test suite |
| `npm run test:watch` | Jest watch mode |
| `npm run test:coverage` | Jest with coverage report |
| `npm run test:ci` | Jest in CI mode (serial, non-interactive) |

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
| Maps | MapLibre React Native (native builds only) |
| Search | Algolia v5 (optional path) |
| Push notifications | Expo Notifications |
| Secure storage | Expo SecureStore (Keychain / EncryptedSharedPreferences) |

---

## Project Structure

```
sayso-mobile/
├── app/                      # Expo Router routes — thin re-exports only
│   ├── (tabs)/               # Bottom tab routes
│   ├── (stack)/              # Stack routes
│   ├── (modals)/             # Modal and auth routes
│   ├── auth/                 # OAuth callback handler
│   ├── _layout.tsx           # Root layout — providers, fonts, status bar
│   └── index.tsx             # Entry redirect (handled by RootGuard)
├── src/
│   ├── components/           # Shared UI components
│   ├── hooks/                # TanStack Query data hooks, one per resource
│   ├── lib/                  # API client, Supabase, env, Algolia, utilities
│   ├── navigation/           # Typed route builder functions
│   ├── providers/            # React context providers
│   ├── screens/              # Screen implementations, organised by route group
│   ├── security/             # Runtime hardening scaffold
│   └── styles/               # Design tokens: colours, spacing, radii, shadows
├── docs/
│   ├── release/              # Ship readiness plan and release notes
│   └── security/             # Hardening docs and backend checklist
├── assets/                   # Fonts and images
├── plugins/                  # Expo config plugins
├── app.config.ts             # Expo app config (schemes, deep links, EAS)
└── jest.config.ts
```

### Monorepo Layout

This repo expects `sayso-web` as a sibling directory:

```
workspace/
  sayso-mobile/
  sayso-web/
    packages/
      contracts/     ← shared type DTOs, resolved locally
```

`@sayso/contracts` resolves to `./src/contracts/index.ts` in both TypeScript and Jest — no build step needed in the sibling repo.

---

## Screen Architecture

Route files in `app/` re-export screens from `src/screens/`. All logic lives under `src/`.

### Controller Hook Pattern

Complex screens extract state and side-effects into a co-located `use<Name>Controller.ts` hook. The screen component renders only.

```
src/screens/modals/reset-password/
├── ResetPasswordScreen.tsx          # Renders only
├── useResetPasswordController.ts    # All state, effects, and handlers
├── components/
│   ├── ResetPasswordForm.tsx
│   ├── ResetPasswordSuccessState.tsx
│   ├── ResetPasswordInvalidState.tsx
│   └── ResetPasswordLoadingState.tsx
```

### 300 LOC Rule

No file may exceed 300 lines. Split before adding logic, not after.

---

## Route Surface

### Tabs
`/home` · `/leaderboard` · `/saved` · `/profile`

### Stack
| Route | Description |
|---|---|
| `/trending` | Trending businesses (list + map on native) |
| `/for-you` | Personalised feed |
| `/events-specials` | Events and specials feed |
| `/business/[id]` | Business detail — hero, photos, reviews, location |
| `/event/[id]` · `/special/[id]` | Event/special detail |
| `/notifications` | Notification inbox |
| `/dm` · `/dm/[threadId]` | DM inbox and conversation thread |
| `/achievements` · `/deal-breakers` | User preferences |
| `/profile/[username]` · `/reviewer/[id]` | Public reviewer profiles |
| `/about` · `/contact` · `/privacy` · `/terms` | Static content |

### Modals / Auth
| Route | Description |
|---|---|
| `/login` | Email/password + Google OAuth |
| `/register` | New account sign-up |
| `/forgot-password` | Request password reset |
| `/reset-password` | PKCE exchange + new password form |
| `/verify-email` | Resend and check email verification |
| `/change-password` | Authenticated password change |
| `/onboarding` · `/onboarding/select-account-type` | Onboarding wizard |
| `/complete` | Profile completion |
| `/write-review/[type]/[id]` | Review composer |
| `/auth/callback` · `/auth/auth-code-error` | OAuth / PKCE handlers |

---

## Auth Flow

```
app/index.tsx
  └── RootGuard
        ├── No session          → /onboarding
        ├── Unverified email    → /verify-email
        ├── Onboarding step     → /onboarding/<step>   (resumes after re-auth)
        ├── Unsupported role    → /role-unsupported
        └── Verified consumer   → /(tabs)/home
```

`RootGuard` is the single source of truth for session-based redirects. Individual screens do not redirect authenticated users.

**Key hardening details:**
- PKCE reset uses `Promise.race` with a timeout; on timeout, `supabase.auth.signOut()` is called fire-and-forget and the in-flight result is discarded.
- `isAuthSettling` ref in `useLoginController` prevents a double `signInWithPassword` call before the first `SIGNED_IN` event fires.
- Onboarding progress is written to `AsyncStorage` before redirecting an unauthenticated user away from a mid-flow step, and consumed by `RootGuard` after re-authentication.
- `ProfileProvider` subscribes to `onAuthStateChange` rather than mounting a fetch effect, so profile state is always fresh after re-auth.

---

## Key Files

| File | Purpose |
|---|---|
| `src/lib/api.ts` | API client with retry logic and `ApiError` |
| `src/lib/supabase.ts` | Supabase singleton with `SecureStore` session adapter |
| `src/lib/queryClient.ts` | TanStack Query config (staleTime, gcTime, retry) |
| `src/lib/env.ts` | Typed env access with validation warnings |
| `src/providers/AuthProvider.tsx` | Session state; exposes `signIn`, `signInWithGoogle`, `signOut` |
| `src/providers/ProfileProvider.tsx` | User profile; re-fetches on every `SIGNED_IN` event |
| `src/components/RootGuard.tsx` | Auth gating, role gating, onboarding step-gating |
| `src/navigation/routes.ts` | Typed route builder functions |
| `src/styles/colors.ts` | Colour design tokens |
| `src/styles/layout.ts` | Spacing scale and layout constants |
| `src/contracts/index.ts` | API response DTOs (shared with `sayso-web`) |

---

## Providers

| Provider | Responsibility |
|---|---|
| `AuthProvider` | Supabase session + auth methods |
| `ProfileProvider` | User profile; re-fetches on `SIGNED_IN` |
| `NotificationsProvider` | Unread count, push badge, realtime updates |
| `FiltersProvider` | Search and filter state |
| `ScrollToTopProvider` | Global scroll-to-top signal for tab press |
| `SecurityProvider` | Runtime integrity checks and cert pinning |

---

## Design System

All layout follows an **8pt base grid** (4pt for fine adjustments).

**Spacing scale:** `4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64` — no other values.

All colours, spacing, typography, radii, and shadows come from `src/styles/`. Do not hardcode values. Before building a new component, check `src/components/` first.

Full rules in [CLAUDE.md](CLAUDE.md).

---

## Testing

Tests use **Jest** with `jest-expo` and **React Native Testing Library**.

```
src/__tests__/
├── setup.ts          # Mocks: React Query, Supabase, SecureStore, icons, Reanimated
├── hooks/            # Data hook tests
├── lib/              # Utility tests (api, calendar, distance, routes)
├── navigation/       # Route builder tests
├── screens/          # Screen integration tests
└── components/       # Component unit tests
```

Coverage is collected from `src/lib/`, `src/hooks/`, and `src/components/`.

---

## Security

- Supabase tokens stored in platform secure enclave via `expo-secure-store`.
- Centralised API error handling and retry in `src/lib/api.ts`.
- Runtime hardening scaffold in `src/security/` (integrity checks, jailbreak detection, cert pinning).
- See `docs/security/` for native hardening details and backend handoff checklist.

---

## CI

GitHub Actions (`.github/workflows/security.yml`) runs on every push:

- TypeScript type check
- Production dependency audit (`npm audit --omit=dev --audit-level=high`)
- Secret scan via Gitleaks
