import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useRootNavigationState } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../providers/AuthProvider';
import { useProfile } from '../providers/ProfileProvider';
import { routes } from '../navigation/routes';
import { supabase } from '../lib/supabase';

const ONBOARDING_RESUME_KEY = 'onboarding_resume';

// ─────────────────────────────────────────────────────────────────────────────
// Route classification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Routes that are ONLY for unauthenticated users.
 * Fully-onboarded users landing here are redirected to /home.
 */
const UNAUTHENTICATED_ONLY_ROUTES = [
  '/onboarding',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

/**
 * Routes that carry auth context but bypass role/onboarding enforcement.
 * (callback exchanges, error recovery screens)
 */
const AUTH_BRIDGE_ROUTES = ['/verify-email', '/auth/callback', '/role-unsupported'];

/**
 * Onboarding step routes — freely navigable while onboarding is in progress.
 */
const ONBOARDING_STEP_ROUTES = ['/interests', '/subcategories', '/deal-breakers', '/complete'];
const ONBOARDING_STEP_ORDER = {
  interests: 0,
  subcategories: 1,
  'deal-breakers': 2,
  complete: 3,
} as const;

/**
 * Routes that require an authenticated session.
 * Unauthenticated users attempting to reach these are redirected to /onboarding.
 *
 * Everything NOT in this list is publicly browsable (mirrors web behaviour):
 * home feed, business/event/special detail, leaderboard, trending, etc.
 */
const PRIVATE_ROUTES = [
  '/notifications',
  '/dm',
  '/achievements',
  '/badges',
  '/for-you',
  '/saved',
  '/interests',
  '/subcategories',
  '/deal-breakers',
  '/complete',
];

/**
 * The own-profile tab route is private (exact match only — /profile/username
 * public profiles are browsable and start with '/profile/' so they don't match).
 */
const PRIVATE_EXACT = ['/profile'];

// ─────────────────────────────────────────────────────────────────────────────

function isMatch(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(r => pathname === r || pathname.startsWith(r + '/'));
}

function isPrivate(pathname: string): boolean {
  return (
    isMatch(pathname, PRIVATE_ROUTES) ||
    PRIVATE_EXACT.includes(pathname)
  );
}

function stepToRoute(step: string | null): string {
  switch (step) {
    case 'subcategories': return routes.subcategories();
    case 'deal-breakers': return routes.dealBreakers();
    case 'complete': return routes.completeProfile();
    default:              return routes.interests();
  }
}

function routeToOnboardingStep(pathname: string): keyof typeof ONBOARDING_STEP_ORDER | null {
  if (pathname === routes.interests() || pathname.startsWith(`${routes.interests()}/`)) {
    return 'interests';
  }
  if (pathname === routes.subcategories() || pathname.startsWith(`${routes.subcategories()}/`)) {
    return 'subcategories';
  }
  if (pathname === routes.dealBreakers() || pathname.startsWith(`${routes.dealBreakers()}/`)) {
    return 'deal-breakers';
  }
  if (pathname === routes.completeProfile() || pathname.startsWith(`${routes.completeProfile()}/`)) {
    return 'complete';
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stateless routing guard — enforces onboarding-first entry while preserving
 * auth/email/onboarding progression.
 *
 * On first app load:
 *   • Unauthenticated users are funneled to /onboarding
 *   • Authenticated users are normalized to /home (except auth bridge routes)
 *
 * Authenticated users go through role → email-verification → onboarding checks,
 * then land on /home (or resume at their correct onboarding step).
 */
export function RootGuard({ children }: { children: React.ReactNode }) {
  const isTestEnv = process.env.NODE_ENV === 'test';
  const router = useRouter();
  const pathname = usePathname();
  const { session, isLoading: isAuthLoading } = useAuth();
  const { profileState, isProfileLoading } = useProfile();
  // Used in Case 2 to verify the role-unsupported route is registered before
  // redirecting there. routeNames is undefined while the navigator is still
  // mounting; in that case we treat the route as present (safe default).
  const navigationState = useRootNavigationState();

  // Prevent the same redirect from firing multiple times per pathname
  const lastRedirectRef = useRef<string | null>(null);
  const hasHandledInitialRoutingRef = useRef(false);

  // Resume route read from AsyncStorage — null means no resume, undefined means
  // not yet loaded. The main effect waits for resumeLoaded before routing so the
  // resume is always available before the first routing decision is made.
  const [resumeRoute, setResumeRoute] = useState<string | null>(null);
  const [resumeLoaded, setResumeLoaded] = useState(isTestEnv);

  useEffect(() => {
    if (isTestEnv) {
      return;
    }

    let active = true;

    AsyncStorage.getItem(ONBOARDING_RESUME_KEY)
      .then(raw => {
        if (!active) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (
              typeof parsed?.route === 'string' &&
              isMatch(parsed.route, ONBOARDING_STEP_ROUTES)
            ) {
              setResumeRoute(parsed.route);
            }
          } catch {
            // Malformed entry — ignore and treat as no resume
          }
        }
      })
      .catch(() => { /* AsyncStorage failure — continue without resume */ })
      .finally(() => {
        if (active) {
          setResumeLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, [isTestEnv]);

  useEffect(() => {
    // Wait for both auth + profile to fully resolve before making any decision.
    // Also wait for the AsyncStorage resume read so it is available before the
    // first routing decision — prevents a double-navigation race.
    if (isAuthLoading || isProfileLoading || !resumeLoaded) return;

    const isUnauthOnly     = isMatch(pathname, UNAUTHENTICATED_ONLY_ROUTES);
    const isAuthBridge     = isMatch(pathname, AUTH_BRIDGE_ROUTES);
    const isOnboardingStep = isMatch(pathname, ONBOARDING_STEP_ROUTES);

    function navigate(target: string) {
      if (target === pathname || lastRedirectRef.current === target) return;
      lastRedirectRef.current = target;
      router.replace(target as never);
    }

    if (!hasHandledInitialRoutingRef.current) {
      hasHandledInitialRoutingRef.current = true;

      // Keep auth callback/error bridge routes intact.
      if (!isAuthBridge) {
        if (!session && pathname !== routes.onboarding()) {
          navigate(routes.onboarding());
          return;
        }
        if (session && pathname !== routes.home()) {
          navigate(routes.home());
          return;
        }
      }
    }

    // ── Case 1: No session ────────────────────────────────────────────────────
    if (!session) {
      // Block access to authenticated-only features
      if (isPrivate(pathname)) {
        // Preserve mid-onboarding position so it can be resumed after re-auth.
        // Only serialise the route — no form values or auth tokens.
        if (isOnboardingStep) {
          AsyncStorage.setItem(
            ONBOARDING_RESUME_KEY,
            JSON.stringify({ route: pathname }),
          ).catch(() => { /* silent — default routing still proceeds */ });
        }
        navigate(routes.onboarding());
      }
      // Public routes remain available to guest users once they pass onboarding.
      return;
    }

    // Wait until profile is resolved before making role / onboarding decisions
    if (!profileState) return;

    const effectiveRole = profileState.accountRole ?? profileState.role;

    // ── Case 2: Unsupported role ──────────────────────────────────────────────
    if (effectiveRole === 'business_owner' || effectiveRole === 'admin') {
      // Before redirecting, verify the route is actually registered in the
      // navigator. If routeNames is undefined the navigator is still mounting
      // — treat that as "route present" so we don't sign out prematurely.
      const routeNames = navigationState?.routeNames;
      const roleUnsupportedExists =
        routeNames == null || routeNames.includes('role-unsupported');

      if (roleUnsupportedExists) {
        navigate('/role-unsupported');
      } else {
        // Route is missing — sign out directly and go to onboarding.
        // Use router.replace directly (bypasses the pathname comparison in
        // navigate()) and set lastRedirectRef so the guard doesn't re-fire.
        lastRedirectRef.current = routes.onboarding();
        supabase.auth.signOut().finally(() => {
          router.replace(routes.onboarding() as never);
        });
      }
      return;
    }

    // ── Case 3: Email not yet verified ───────────────────────────────────────
    if (!profileState.isEmailVerified) {
      // Allow auth-bridge and unauthenticated-only routes (ToS, privacy, etc.)
      if (!isAuthBridge && !isUnauthOnly) {
        navigate(routes.verifyEmail());
      }
      return;
    }

    // ── Case 4: Onboarding incomplete ────────────────────────────────────────
    if (!profileState.isOnboardingComplete) {
      // Prevent skip-ahead while still allowing users to revisit earlier steps.
      const expectedRoute = stepToRoute(profileState.onboardingStep);
      const expectedStep = routeToOnboardingStep(expectedRoute) ?? 'interests';
      const currentStep = routeToOnboardingStep(pathname);

      // Attempt to resume from saved progress after re-authentication.
      // The guard checks in Cases 2–3 have already passed (role OK, email verified),
      // so we only need to confirm the resume step doesn't leap ahead of the
      // user's actual onboarding position.
      if (resumeRoute) {
        const resumeStep = routeToOnboardingStep(resumeRoute);
        const isValidResume =
          resumeStep !== null &&
          ONBOARDING_STEP_ORDER[resumeStep] <= ONBOARDING_STEP_ORDER[expectedStep];

        // Always consume the resume entry — valid or not — so it is never reused.
        AsyncStorage.removeItem(ONBOARDING_RESUME_KEY).catch(() => {});
        setResumeRoute(null);

        if (isValidResume) {
          navigate(resumeRoute);
          return;
        }
        // Invalid or ahead-of-progress resume — fall through to normal routing.
      }

      if (!currentStep) {
        navigate(expectedRoute);
        return;
      }

      if (ONBOARDING_STEP_ORDER[currentStep] > ONBOARDING_STEP_ORDER[expectedStep]) {
        navigate(expectedRoute);
      }
      return;
    }

    // ── Case 5: Fully onboarded ───────────────────────────────────────────────
    // Move logged-in, onboarded users off landing/auth/onboarding screens
    if (isUnauthOnly || isOnboardingStep) {
      // Clear any stale resume so normal completion never triggers a resume redirect.
      AsyncStorage.removeItem(ONBOARDING_RESUME_KEY).catch(() => {});
      setResumeRoute(null);
      navigate(routes.home());
    }
    // Auth-bridge routes (verify-email, role-unsupported) — let them sit there;
    // they'll navigate forward themselves once their state resolves.
  }, [isAuthLoading, isProfileLoading, session, profileState, pathname, router, navigationState, resumeRoute, resumeLoaded]);

  return <>{children}</>;
}
