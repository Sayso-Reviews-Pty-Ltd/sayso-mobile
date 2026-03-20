import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { routes } from '../../../navigation/routes';
import { GRID } from './constants';
import { passwordScore } from './helpers';
import type { FocusedField, InvalidReason, ScreenState } from './types';

const ALREADY_USED_LINK_MESSAGE =
  'This reset link has already been used. If you have already changed your password, sign in. If not, request a new link.';

class TimeoutError extends Error {
  constructor() {
    super('The link timed out. Please request a new one.');
    this.name = 'TimeoutError';
  }
}

export function useResetPasswordController() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string | string[] }>();
  const recoveryCode = Array.isArray(code) ? code[0] : code;

  const [screenState, setScreenState] = useState<ScreenState>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [invalidReason, setInvalidReason] = useState<InvalidReason>('invalid-link');

  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(GRID * 2)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(GRID * 2.5)).current;
  const primaryScale = useRef(new Animated.Value(0.98)).current;

  const runEntrance = useCallback(() => {
    const easeOut = Easing.out(Easing.cubic);
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 260,
        easing: easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(headerY, {
        toValue: 0,
        duration: 260,
        easing: easeOut,
        useNativeDriver: true,
      }),
    ]).start();
    Animated.sequence([
      Animated.delay(70),
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 280,
          easing: easeOut,
          useNativeDriver: true,
        }),
        Animated.timing(cardY, {
          toValue: 0,
          duration: 280,
          easing: easeOut,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(primaryScale, {
        toValue: 1,
        damping: 18,
        stiffness: 230,
        mass: 0.9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, cardY, headerOpacity, headerY, primaryScale]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let exchangeAttempted = false;
    let exchangeSucceeded = false;

    async function checkSession() {
      try {
        if (recoveryCode) {
          exchangeAttempted = true;
          let timedOut = false;

          const exchangePromise = (async () => {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(recoveryCode);
            if (timedOut) return; // timeout already won — discard result
            if (exchangeError) throw exchangeError;
          })();

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => {
              timedOut = true;
              supabase.auth.signOut().catch(() => {});
              reject(new TimeoutError());
            }, 10000),
          );

          await Promise.race([exchangePromise, timeoutPromise]);
          exchangeSucceeded = true;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!cancelled) {
          setScreenState(data.session ? 'form' : 'invalid');
          runEntrance();
        }
      } catch (err) {
        let nextInvalidReason: InvalidReason = 'invalid-link';
        let nextError = err instanceof Error ? err.message : '';

        if (exchangeAttempted && !exchangeSucceeded && !(err instanceof TimeoutError)) {
          try {
            const { data: userData, error: getUserError } = await supabase.auth.getUser();
            if (!getUserError && userData.user) {
              nextInvalidReason = 'already-used';
              nextError = ALREADY_USED_LINK_MESSAGE;
            }
          } catch {
            // Keep invalid-link fallback messaging unchanged.
          }
        }

        if (!cancelled) {
          setInvalidReason(nextInvalidReason);
          setError(nextError);
          setScreenState('invalid');
          runEntrance();
        }
      }
    }

    checkSession();
    return () => { cancelled = true; };
  }, [recoveryCode, runEntrance]);

  const pwScore = passwordScore(password);
  const passwordError =
    passwordTouched && !password
      ? 'Password is required.'
      : passwordTouched && password.length < 6
        ? 'Use at least 6 characters.'
        : '';
  const confirmError =
    confirmTouched && !confirmPassword
      ? 'Please confirm your password.'
      : confirmTouched && confirmPassword !== password
        ? 'Passwords do not match.'
        : '';
  const isFormValid = !passwordError && password.length >= 6 && confirmPassword === password;

  const handleSubmit = useCallback(async () => {
    setPasswordTouched(true);
    setConfirmTouched(true);
    if (!isFormValid || isSubmitting) return;

    setError('');
    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setScreenState('success');
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
      redirectTimerRef.current = setTimeout(() => {
        router.replace(routes.home() as never);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Unable to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, isSubmitting, password, router]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(routes.home() as never);
  }, [router]);

  const handleRequestNewLink = useCallback(() => {
    router.replace(routes.forgotPassword() as never);
  }, [router]);

  const handleBackToLogin = useCallback(() => {
    router.replace(routes.login() as never);
  }, [router]);

  const handleBlurPassword = useCallback(() => {
    setFocusedField(null);
    setPasswordTouched(true);
  }, []);

  const handleBlurConfirm = useCallback(() => {
    setFocusedField(null);
    setConfirmTouched(true);
  }, []);

  return {
    cardOpacity,
    cardY,
    confirmError,
    confirmPassword,
    confirmVisible,
    error,
    focusedField,
    handleBack,
    handleBackToLogin,
    handleBlurConfirm,
    handleBlurPassword,
    handleRequestNewLink,
    handleSubmit,
    headerOpacity,
    headerY,
    invalidReason,
    isFormValid,
    isSubmitting,
    password,
    passwordError,
    passwordVisible,
    primaryScale,
    pwScore,
    screenState,
    setConfirmPassword,
    setConfirmVisible,
    setFocusedField,
    setPassword,
    setPasswordVisible,
  };
}
