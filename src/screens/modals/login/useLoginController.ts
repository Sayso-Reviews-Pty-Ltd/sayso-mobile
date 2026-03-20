import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../lib/supabase';
import { apiFetch } from '../../../lib/api';
import { useAuthSession } from '../../../hooks/useSession';
import { routes } from '../../../navigation/routes';
import { GRID } from './constants';
import { getFriendlyAuthError, passwordScore, validateEmail, validateUsername } from './helpers';
import type { AuthMode, FocusedField } from './types';

export function useLoginController(defaultMode: AuthMode) {
  const router = useRouter();
  const { signInWithPassword, signInWithGoogle } = useAuthSession();

  const [authMode, setAuthMode] = useState<AuthMode>(defaultMode);
  const [username, setUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<null | boolean>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameCheckFailed, setUsernameCheckFailed] = useState(false);
  const [tabPillWidth, setTabPillWidth] = useState(0);

  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const tabAnim = useRef(new Animated.Value(defaultMode === 'login' ? 1 : 0)).current;
  const formOpacity = useRef(new Animated.Value(1)).current;
  const formTranslateY = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(1)).current;
  const titleTranslateY = useRef(new Animated.Value(0)).current;

  const headerEntranceOpacity = useRef(new Animated.Value(0)).current;
  const headerEntranceY = useRef(new Animated.Value(GRID * 2)).current;
  const cardEntranceOpacity = useRef(new Animated.Value(0)).current;
  const cardEntranceY = useRef(new Animated.Value(GRID * 2.5)).current;
  const primaryFocusScale = useRef(new Animated.Value(0.98)).current;

  const switchMode = useCallback(
    (mode: AuthMode) => {
      if (mode === authMode) return;

      Animated.spring(tabAnim, {
        toValue: mode === 'login' ? 1 : 0,
        damping: 20,
        stiffness: 220,
        mass: 0.85,
        useNativeDriver: true,
      }).start();

      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(formTranslateY, { toValue: -(GRID * 0.75), duration: 120, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 0, duration: 110, useNativeDriver: true }),
        Animated.timing(titleTranslateY, { toValue: -(GRID * 0.5), duration: 110, useNativeDriver: true }),
      ]).start(() => {
        Keyboard.dismiss();
        setAuthMode(mode);
        setError('');
        setUsernameTouched(false);
        setEmailTouched(false);
        setPasswordTouched(false);
        setUsername('');
        setEmail('');
        setPassword('');
        setUsernameAvailable(null);
        setUsernameChecking(false);
        if (usernameDebounceRef.current) {
          clearTimeout(usernameDebounceRef.current);
          usernameDebounceRef.current = null;
        }
        formTranslateY.setValue(GRID);
        titleTranslateY.setValue(GRID * 0.5);

        Animated.parallel([
          Animated.timing(formOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(formTranslateY, { toValue: 0, duration: 180, useNativeDriver: true }),
          Animated.timing(titleOpacity, { toValue: 1, duration: 170, useNativeDriver: true }),
          Animated.timing(titleTranslateY, { toValue: 0, duration: 170, useNativeDriver: true }),
        ]).start();
      });
    },
    [authMode, formOpacity, formTranslateY, tabAnim, titleOpacity, titleTranslateY]
  );

  useEffect(() => {
    const easeOut = Easing.out(Easing.cubic);

    Animated.parallel([
      Animated.timing(headerEntranceOpacity, {
        toValue: 1,
        duration: 260,
        easing: easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(headerEntranceY, {
        toValue: 0,
        duration: 260,
        easing: easeOut,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(70),
      Animated.parallel([
        Animated.timing(cardEntranceOpacity, {
          toValue: 1,
          duration: 280,
          easing: easeOut,
          useNativeDriver: true,
        }),
        Animated.timing(cardEntranceY, {
          toValue: 0,
          duration: 280,
          easing: easeOut,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(primaryFocusScale, {
        toValue: 1,
        damping: 18,
        stiffness: 230,
        mass: 0.9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardEntranceOpacity, cardEntranceY, headerEntranceOpacity, headerEntranceY, primaryFocusScale]);

  useEffect(() => {
    if (authMode !== 'register') return;

    const clientError = validateUsername(username);
    if (clientError) {
      setUsernameAvailable(null);
      setUsernameChecking(false);
      setUsernameCheckFailed(false);
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
        usernameDebounceRef.current = null;
      }
      return;
    }

    setUsernameChecking(true);
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    usernameDebounceRef.current = setTimeout(async () => {
      try {
        const result = await apiFetch<{ available: boolean }>(
          `/api/user/check-username?username=${encodeURIComponent(username)}`
        );
        setUsernameAvailable(result.available);
        setUsernameCheckFailed(false);
      } catch {
        setUsernameAvailable(null);
        setUsernameCheckFailed(true);
      } finally {
        setUsernameChecking(false);
      }
    }, 300);

    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
        usernameDebounceRef.current = null;
      }
    };
  }, [authMode, username]);

  const isRegister = authMode === 'register';
  const usernameError = usernameTouched ? validateUsername(username) : '';
  const emailError = emailTouched ? validateEmail(email) : '';
  const pwScore = passwordScore(password);
  const usernameIsValid = isRegister && usernameTouched && !!username && !usernameError;
  const emailIsValid = emailTouched && !!email && !emailError;
  const passwordHasState = isRegister ? password.length > 0 : passwordTouched && password.length > 0;

  const isFormValid = isRegister
    ? !validateUsername(username) && !validateEmail(email) && pwScore >= 3 && consent
    : email.length > 0 && password.length >= 6;

  const handleBack = useCallback(() => {
    router.push(routes.onboarding() as never);
  }, [router]);

  const handleForgotPassword = useCallback(() => {
    router.push(routes.forgotPassword() as never);
  }, [router]);

  const handleTerms = useCallback(() => {
    router.push(routes.terms() as never);
  }, [router]);

  const handlePrivacy = useCallback(() => {
    router.push(routes.privacy() as never);
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid || isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    try {
      if (isRegister) {
        const emailRedirectTo = Linking.createURL('/auth/callback');
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              account_type: 'user',
            },
            emailRedirectTo,
          },
        });
        if (signUpError) throw signUpError;

        await AsyncStorage.setItem('pending_verification_email', email);
        router.replace(routes.verifyEmail() as never);
        return;
      }

      await signInWithPassword(email, password);
    } catch (err) {
      setError(getFriendlyAuthError(err));
      setIsSubmitting(false);
    }
  }, [email, isFormValid, isRegister, isSubmitting, password, router, signInWithPassword, username]);

  const handleGoogle = useCallback(async () => {
    if (isGoogleLoading) return;
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      setIsGoogleLoading(false);
    } catch (err) {
      setError(getFriendlyAuthError(err));
      setIsGoogleLoading(false);
    }
  }, [isGoogleLoading, signInWithGoogle]);

  return {
    authMode,
    cardEntranceOpacity,
    cardEntranceY,
    consent,
    email,
    emailError,
    emailIsValid,
    error,
    focusedField,
    formOpacity,
    formTranslateY,
    handleBack,
    handleForgotPassword,
    handleGoogle,
    handlePrivacy,
    handleSubmit,
    handleTerms,
    headerEntranceOpacity,
    headerEntranceY,
    isFormValid,
    isGoogleLoading,
    isRegister,
    isSubmitting,
    password,
    passwordHasState,
    passwordInputRef,
    passwordTouched,
    passwordVisible,
    primaryFocusScale,
    pwScore,
    setConsent,
    setEmail,
    setEmailTouched,
    setFocusedField,
    setPassword,
    setPasswordTouched,
    setPasswordVisible,
    setTabPillWidth,
    setUsername,
    setUsernameTouched,
    switchMode,
    tabAnim,
    tabPillWidth,
    titleOpacity,
    titleTranslateY,
    username,
    usernameAvailable,
    usernameCheckFailed,
    usernameChecking,
    usernameError,
    usernameIsValid,
  };
}
