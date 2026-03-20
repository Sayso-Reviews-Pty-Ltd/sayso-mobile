import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { routes } from '../../../navigation/routes';
import { GRID } from './constants';
import { passwordScore } from './helpers';
import type { FocusedField, ScreenState } from './types';

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
    const timeoutGuardRef: { current: ReturnType<typeof setTimeout> | null } = { current: null };

    async function checkSession() {
      try {
        if (recoveryCode) {
          await new Promise<void>((resolve, reject) => {
            timeoutGuardRef.current = setTimeout(() => {
              reject(new Error('The link timed out. Please request a new one.'));
            }, 10000);

            supabase.auth
              .exchangeCodeForSession(recoveryCode)
              .then(({ error: exchangeError }) => {
                if (timeoutGuardRef.current) {
                  clearTimeout(timeoutGuardRef.current);
                  timeoutGuardRef.current = null;
                }
                if (exchangeError) {
                  reject(exchangeError);
                  return;
                }
                resolve();
              })
              .catch(reject);
          });
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!cancelled) {
          setScreenState(data.session ? 'form' : 'invalid');
          runEntrance();
        }
      } catch (err) {
        if (timeoutGuardRef.current) {
          clearTimeout(timeoutGuardRef.current);
          timeoutGuardRef.current = null;
        }
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '');
          setScreenState('invalid');
          runEntrance();
        }
      }
    }

    checkSession();
    return () => {
      cancelled = true;
      if (timeoutGuardRef.current) {
        clearTimeout(timeoutGuardRef.current);
        timeoutGuardRef.current = null;
      }
    };
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
