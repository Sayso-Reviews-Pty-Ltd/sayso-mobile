import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { SkeletonBlock } from '../components/SkeletonBlock';
import { routes } from '../navigation/routes';
import { Text } from '../components/Typography';

type CallbackParams = {
  code?: string;
  type?: string;
  error?: string;
  error_description?: string;
  state?: string;
};

function isExpiredVerificationError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('expired') ||
    lower.includes('invalid') ||
    lower.includes('otp has expired') ||
    lower.includes('token has expired') ||
    lower.includes('email link is invalid')
  );
}

function stepToRoute(step: string | null | undefined): string {
  switch (step) {
    case 'subcategories': return routes.subcategories();
    case 'deal-breakers': return routes.dealBreakers();
    case 'complete': return routes.completeProfile();
    default:              return routes.interests();
  }
}

function normalizeRole(r: string | null | undefined): string | null {
  if (!r) return null;
  if (['admin', 'super_admin', 'superadmin'].includes(r)) return 'admin';
  if (['business_owner', 'business', 'owner'].includes(r)) return 'business_owner';
  return 'user';
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<CallbackParams>();

  useEffect(() => {
    let cancelled = false;

    async function finishAuth() {
      try {
        // Handle error params from provider
        if (params.error) {
          const paramError = params.error_description || params.error;
          if (isExpiredVerificationError(paramError)) {
            // Distinguish an already-verified account from a genuinely expired link.
            // getUser() is called in the error branch only — never on the success path.
            const { data: checkData } = await supabase.auth.getUser();
            if (checkData?.user?.email_confirmed_at) {
              router.replace('/verify-email?already_verified=1' as never);
            } else {
              router.replace('/verify-email?expired=1' as never);
            }
            return;
          }
          throw new Error(paramError);
        }

        if (!params.code) {
          // Some flows pass the token via URL fragment — try to get session directly
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('Missing OAuth code and no active session');
          // Session already established — fall through to profile check below
        } else {
          // Exchange code for session (PKCE flow)
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
          if (exchangeError) {
            supabase.auth.signOut().catch(() => {});
            const encoded = encodeURIComponent('Sign-in could not be verified. Please try again.');
            router.replace((`/auth/auth-code-error?error=${encoded}`) as never);
            return;
          }

          // Verify the session user matches the user_id claim in state (if present)
          const sessionUserId = exchangeData.session?.user?.id;
          let stateUserId: string | undefined;
          if (params.state) {
            try {
              const decoded = JSON.parse(atob(params.state));
              stateUserId = typeof decoded?.user_id === 'string' ? decoded.user_id : undefined;
            } catch {
              // Malformed state — skip the check
            }
          }
          if (stateUserId && sessionUserId && stateUserId !== sessionUserId) {
            supabase.auth.signOut().catch(() => {});
            const encoded = encodeURIComponent('Account mismatch detected. Please sign in again.');
            router.replace((`/auth/auth-code-error?error=${encoded}`) as never);
            return;
          }
        }

        if (cancelled) return;

        // Password recovery flow — redirect to reset-password form
        if (params.type === 'recovery') {
          router.replace(routes.resetPassword() as never);
          return;
        }

        const { data: authUserData, error: authUserError } = await supabase.auth.getUser();
        if (authUserError) throw authUserError;
        const currentUserId = authUserData.user?.id;
        if (!currentUserId) throw new Error('No authenticated user found after auth callback');

        // Fetch profile to determine routing — retry up to 3 times to handle
        // the case where the profile trigger hasn't run yet.
        let profileData: {
          role?: string | null;
          account_role?: string | null;
          onboarding_step?: string | null;
          onboarding_completed_at?: string | null;
          onboarding_complete?: boolean | null;
        } | null = null;

        for (let attempt = 0; attempt < 3; attempt++) {
          const { data } = await supabase
            .from('profiles')
            .select('role, account_role, onboarding_step, onboarding_completed_at, onboarding_complete')
            .eq('user_id', currentUserId)
            .single();

          if (data) {
            profileData = data;
            break;
          }
          if (attempt < 2) await new Promise(r => setTimeout(r, 600));
        }

        if (cancelled) return;

        const effectiveRole = normalizeRole(profileData?.account_role) ?? normalizeRole(profileData?.role);

        // Unsupported role → role-unsupported screen
        if (effectiveRole === 'business_owner' || effectiveRole === 'admin') {
          router.replace('/role-unsupported' as never);
          return;
        }

        // Check if onboarding is complete
        // Signup email verification also lands here (type=signup) and should
        // continue via onboarding-aware routing, not a forced login redirect.
        const isOnboardingComplete = Boolean(profileData?.onboarding_completed_at) || Boolean(profileData?.onboarding_complete);

        if (isOnboardingComplete) {
          router.replace(routes.home() as never);
        } else {
          router.replace(stepToRoute(profileData?.onboarding_step) as never);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Authentication callback failed';
          const encoded = encodeURIComponent(message);
          router.replace((`/auth/auth-code-error?error=${encoded}`) as never);
        }
      }
    }

    finishAuth();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <View style={styles.skeletonWrap}>
          <SkeletonBlock style={styles.skeletonOrb} />
          <SkeletonBlock style={styles.skeletonLine} />
        </View>
        <Text style={styles.label}>Finishing sign in…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E0E5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  skeletonWrap: {
    alignItems: 'center',
    gap: 10,
  },
  skeletonOrb: {
    width: 54,
    height: 54,
    borderRadius: 999,
  },
  skeletonLine: {
    width: 132,
    height: 10,
    borderRadius: 999,
  },
  label: {
    fontSize: 15,
    color: '#4B5563',
  },
});
