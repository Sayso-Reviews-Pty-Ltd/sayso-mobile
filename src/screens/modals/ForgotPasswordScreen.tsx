import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { routes } from '../../navigation/routes';
import { getFriendlyAuthError } from './login/helpers';
import { C, GRID } from './forgot-password/constants';
import { styles } from './forgot-password/ForgotPasswordScreen.styles';
import { validateEmail } from './forgot-password/helpers';
import {
  ForgotPasswordBackButton,
  ForgotPasswordEmailForm,
  ForgotPasswordHeader,
  ForgotPasswordSuccessContent,
} from './forgot-password/components';

const FORGOT_PASSWORD_FALLBACK_ERROR =
  'Something went wrong. Please check the email address and try again, or contact support.';

const KNOWN_FRIENDLY_AUTH_ERRORS = new Set<string>([
  'Incorrect email or password.',
  'An account with this email already exists.',
  'Too many attempts. Please try again later.',
  'Please verify your email before signing in.',
  'Your password is too short.',
  "That doesn't look like a valid email address.",
  'Please enter a valid email address.',
  'Connection error. Check your internet and try again.',
  'Something went wrong. Please try again.',
]);

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [focusedField, setFocusedField] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(GRID * 2)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(GRID * 2.5)).current;
  const primaryScale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emailError = emailTouched ? validateEmail(email) : '';
  const emailIsValid = emailTouched && !!email && !emailError;
  const isFormValid = !validateEmail(email);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid || isSubmitting) return;
    setEmailTouched(true);
    if (validateEmail(email)) return;

    setError('');
    setIsSubmitting(true);

    try {
      const redirectTo = ExpoLinking.createURL('/reset-password');
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (resetError) throw resetError;
      setEmailSent(true);
    } catch (err) {
      const friendlyMessage = getFriendlyAuthError(err);
      setError(
        KNOWN_FRIENDLY_AUTH_ERRORS.has(friendlyMessage)
          ? friendlyMessage
          : FORGOT_PASSWORD_FALLBACK_ERROR
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isFormValid, isSubmitting]);

  const handleUseDifferentEmail = useCallback(() => {
    setEmailSent(false);
    setEmail('');
    setEmailTouched(false);
    setError('');
  }, []);

  return (
    <View style={styles.root}>
      <ForgotPasswordBackButton top={insets.top + GRID * 1.5} onPress={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + GRID * 9,
              paddingBottom: insets.bottom + GRID * 4,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.rail}>
            <ForgotPasswordHeader
              emailSent={emailSent}
              email={email}
              opacity={headerOpacity}
              translateY={headerY}
            />

            <Animated.View
              style={[
                styles.cardWrap,
                { opacity: cardOpacity, transform: [{ translateY: cardY }] },
              ]}
            >
              <LinearGradient
                colors={[C.card, C.card, 'rgba(157,171,155,0.95)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                {!emailSent ? (
                  <ForgotPasswordEmailForm
                    error={error}
                    email={email}
                    emailError={emailError}
                    emailIsValid={emailIsValid}
                    focusedField={focusedField}
                    isFormValid={isFormValid}
                    isSubmitting={isSubmitting}
                    primaryScale={primaryScale}
                    onChangeEmail={setEmail}
                    onFocusEmail={() => setFocusedField(true)}
                    onBlurEmail={() => {
                      setFocusedField(false);
                      setEmailTouched(true);
                    }}
                    onSubmit={handleSubmit}
                    onSignIn={() => router.replace(routes.login() as never)}
                  />
                ) : (
                  <ForgotPasswordSuccessContent
                    onBackToLogin={() => router.replace(routes.login() as never)}
                    onUseDifferentEmail={handleUseDifferentEmail}
                  />
                )}
              </LinearGradient>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
