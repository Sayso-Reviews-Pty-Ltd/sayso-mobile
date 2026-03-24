import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Linking,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { routes } from '../../navigation/routes';
import { Text } from '../../components/Typography';
import { useProfile } from '../../providers/ProfileProvider';
import { C, RESEND_COOLDOWN_SECS } from './verify-email/constants';
import { getInboxUrl } from './verify-email/helpers';
import { styles } from './verify-email/VerifyEmailScreen.styles';

function stepToRoute(step: string | null | undefined): string {
  switch (step) {
    case 'subcategories': return routes.subcategories();
    case 'deal-breakers': return routes.dealBreakers();
    case 'complete':      return routes.completeProfile();
    default:              return routes.interests();
  }
}

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ expired?: string; already_verified?: string }>();
  const insets = useSafeAreaInsets();
  const { refreshProfile } = useProfile();

  const [pendingEmail, setPendingEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profileWarning, setProfileWarning] = useState<string | null>(null);

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Entrance animations
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(18)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const actionsY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    AsyncStorage.getItem('pending_verification_email').then(email => {
      if (email) setPendingEmail(email);
    });

    Animated.parallel([
      Animated.timing(textOpacity, { toValue: 1, delay: 80, duration: 360, useNativeDriver: true }),
      Animated.timing(textY, { toValue: 0, delay: 80, duration: 360, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, delay: 180, duration: 360, useNativeDriver: true }),
      Animated.timing(cardY, { toValue: 0, delay: 180, duration: 360, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(actionsOpacity, { toValue: 1, delay: 280, duration: 320, useNativeDriver: true }),
      Animated.timing(actionsY, { toValue: 0, delay: 280, duration: 320, useNativeDriver: true }),
    ]).start();

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_SECS);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const handleResend = useCallback(async () => {
    if (isResending || cooldown > 0 || !pendingEmail) return;

    setError('');
    setResendSuccess(false);
    setIsResending(true);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: {
          emailRedirectTo: ExpoLinking.createURL('/auth/callback'),
        },
      });

      if (resendError) throw resendError;

      setResendSuccess(true);
      startCooldown();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend. Try again.');
    } finally {
      setIsResending(false);
    }
  }, [isResending, cooldown, pendingEmail]);

  // Allows users who verified on a different device to continue
  const handleCheckVerification = useCallback(async () => {
    if (isChecking) return;

    setError('');
    setIsChecking(true);

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();

        if (userData.user?.email_confirmed_at) {
          try { await supabase.auth.refreshSession(); } catch { /* non-blocking */ }
          try {
            await refreshProfile();
          } catch (profileErr) {
            console.error(profileErr);
            setProfileWarning('Verification succeeded, but your profile could not be refreshed. Please restart the app.');
          }

          const { data: profileData } = await supabase
            .from('profiles')
            .select('onboarding_step, onboarding_completed_at, onboarding_complete')
            .eq('user_id', userData.user.id)
            .maybeSingle();

          const isOnboardingComplete =
            Boolean(profileData?.onboarding_completed_at) || Boolean(profileData?.onboarding_complete);
          const destination = isOnboardingComplete
            ? routes.home()
            : stepToRoute(profileData?.onboarding_step);

          try {
            router.replace(destination as never);
          } catch {
            // Route unreachable — stay on screen without error
          }
          return;
        }

        await refreshProfile();
        setError('Email not yet verified. Please check your inbox and click the link.');
      } else {
        setError('No active session. Please sign in again.');
        router.replace(routes.login() as never);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, refreshProfile, router]);

  const handleOpenInbox = useCallback(async () => {
    if (!pendingEmail) return;

    const url = getInboxUrl(pendingEmail);
    try {
      await Linking.openURL(url);
    } catch {
      setError('Could not open inbox. Please check your mail app manually.');
    }
  }, [pendingEmail]);

  const displayEmail = pendingEmail || 'your email';
  const maskedEmail = useMemo(() => {
    if (!pendingEmail) return 'your email';
    return pendingEmail.replace(/(.{2})(.*)(@.*)/, (_m, p1, p2, p3) => {
      return p1 + '*'.repeat(Math.max(0, p2.length)) + p3;
    });
  }, [pendingEmail]);

  const linkExpired = params.expired === '1';
  const alreadyVerified = params.already_verified === '1';

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}> 
      <View style={[styles.backWrap, { top: insets.top + 8 }]}> 
        <Pressable onPress={() => router.replace(routes.home() as never)} hitSlop={10} style={styles.backBtn}> 
          <Ionicons name="arrow-back-outline" size={22} color={C.charcoal} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 74, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.textBlock, { opacity: textOpacity, transform: [{ translateY: textY }] }]}> 
          <Text style={styles.heading}>Check Your Email</Text>
          <Text style={styles.subheading}>
            {alreadyVerified
              ? 'Your email is already verified. You can sign in now.'
              : linkExpired
                ? 'Your verification link expired. Request a fresh link and continue.'
                : "We've sent a confirmation email to verify your account and unlock full features!"}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>
          {alreadyVerified ? (
            <Animated.View style={{ opacity: actionsOpacity, transform: [{ translateY: actionsY }] }}>
              <Pressable
                style={({ pressed }) => [styles.resendBtn, pressed && styles.btnPressed]}
                onPress={() => router.replace(routes.login() as never)}
              >
                <LinearGradient
                  colors={[C.wine, '#7A404A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.resendBtnGradient}
                >
                  <Text style={styles.resendBtnTxt}>Sign in</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ) : (
            <>
          <View style={styles.mailCircle}>
            <Ionicons name="mail-outline" size={42} color={C.charcoal} />
          </View>

          <Pressable onPress={handleOpenInbox} disabled={!pendingEmail} style={({ pressed }) => [styles.emailBtn, pressed && styles.btnPressed, !pendingEmail && styles.btnDisabled]}>
            <Text style={styles.emailBtnTxt}>{displayEmail}</Text>
            <Ionicons name="open-outline" size={14} color={C.white} />
          </Pressable>

          <Text style={styles.instructions}>
            Please check your inbox and click the verification link. Once verified, come back here and continue.
          </Text>

          <View style={styles.whyCard}>
            <View style={styles.whyTitleRow}>
              <Ionicons name="checkmark-circle-outline" size={17} color={C.sage} />
              <Text style={styles.whyTitle}>Why verify your email?</Text>
            </View>
            {[
              'Unlock full app features (posting, saving, leaderboards)',
              'Secure account recovery and password resets',
              'Receive important updates and notifications',
              'Build trust within the community',
            ].map(item => (
              <View key={item} style={styles.whyItemRow}>
                <View style={styles.whyDot} />
                <Text style={styles.whyItemTxt}>{item}</Text>
              </View>
            ))}
          </View>

          <Animated.View style={{ opacity: actionsOpacity, transform: [{ translateY: actionsY }] }}>
            <Pressable
              style={({ pressed }) => [styles.resendBtn, pressed && !isResending && cooldown === 0 && styles.btnPressed, (isResending || cooldown > 0) && styles.btnDisabled]}
              onPress={handleResend}
              disabled={isResending || cooldown > 0}
            >
              <LinearGradient
                colors={[C.wine, '#7A404A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.resendBtnGradient}
              >
                <Ionicons name="refresh-outline" size={15} color={C.white} style={{ marginRight: 6 }} />
                <Text style={styles.resendBtnTxt}>
                  {isResending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
                </Text>
              </LinearGradient>
            </Pressable>

            {!!error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={C.errorText} />
                <Text style={styles.errorTxt}>{error}</Text>
              </View>
            )}

            {profileWarning !== null && (
              <View style={styles.successBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={C.sage} />
                <Text style={styles.successTxt}>{profileWarning}</Text>
              </View>
            )}

            {resendSuccess && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle-outline" size={16} color={C.sage} />
                <Text style={styles.successTxt}>Verification email resent to {maskedEmail}.</Text>
              </View>
            )}

            <Text style={styles.spamHint}>
              Didn&apos;t receive the email? Check your spam folder or try resending.
            </Text>

            <Pressable onPress={handleCheckVerification} disabled={isChecking} style={({ pressed }) => [styles.verifiedLink, pressed && styles.btnPressed]}>
              <Text style={styles.verifiedLinkTxt}>{isChecking ? 'Checking verification…' : "I've verified my email"}</Text>
            </Pressable>
          </Animated.View>
            </>
          )}
        </Animated.View>

        <Pressable onPress={() => router.replace(routes.login() as never)} style={styles.backToLogin}> 
          <Text style={styles.backToLoginTxt}>Back to login</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
