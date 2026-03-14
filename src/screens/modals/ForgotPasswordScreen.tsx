import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { routes } from '../../navigation/routes';
import { Text } from '../../components/Typography';

const GRID = 8;
const MAX_RAIL_WIDTH = 420;
const FIELD_ICON_SIZE = 18;

const C = {
  page: '#E5E0E5',
  card: '#9DAB9B',
  wine: '#722F37',
  sage: '#7D9B76',
  charcoal: '#2D2D2D',
  charcoal70: 'rgba(45,45,45,0.7)',
  charcoal60: 'rgba(45,45,45,0.6)',
  charcoal50: 'rgba(45,45,45,0.5)',
  white: '#FFFFFF',
  inputBg: 'rgba(255,255,255,0.95)',
  inputBorder: 'rgba(255,255,255,0.6)',
  errorText: '#722F37',
  errorBg: 'rgba(229,224,229,0.95)',
  errorBorder: 'rgba(114,47,55,0.35)',
};

function validateEmail(e: string): string {
  if (!e) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Enter a valid email address.';
  return '';
}

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
      Animated.timing(headerOpacity, { toValue: 1, duration: 260, easing: easeOut, useNativeDriver: true }),
      Animated.timing(headerY, { toValue: 0, duration: 260, easing: easeOut, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.delay(70),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 280, easing: easeOut, useNativeDriver: true }),
        Animated.timing(cardY, { toValue: 0, duration: 280, easing: easeOut, useNativeDriver: true }),
      ]),
      Animated.spring(primaryScale, { toValue: 1, damping: 18, stiffness: 230, mass: 0.9, useNativeDriver: true }),
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
      setError(err instanceof Error ? err.message : 'We couldn\'t send the reset link right now. Please try again.');
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
    <View style={[styles.root, { backgroundColor: C.page }]}>
      <View style={[styles.backBtnWrap, { top: insets.top + GRID * 1.5 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back-outline" size={22} color={C.charcoal} />
        </Pressable>
      </View>

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
            <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerY }] }}>
              <View style={styles.titleBlock}>
                <Text style={styles.title}>
                  {emailSent ? 'Check Your Inbox' : 'Reset Password'}
                </Text>
                <Text style={styles.subtitle}>
                  {emailSent
                    ? `We've sent a reset link to ${email}`
                    : 'Enter your email and we\'ll send you a link to reset your password.'}
                </Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.cardWrap, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>
              <LinearGradient
                colors={[C.card, C.card, 'rgba(157,171,155,0.95)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                {!emailSent ? (
                  <>
                    {!!error && (
                      <View style={styles.errorBanner}>
                        <Ionicons name="alert-circle-outline" size={16} color={C.errorText} />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    )}

                    <View style={styles.fieldWrap}>
                      <Text style={styles.fieldLabel}>Email</Text>
                      <View
                        style={[
                          styles.inputRow,
                          focusedField ? styles.inputRowFocused : null,
                          emailError ? styles.inputRowError : null,
                        ]}
                      >
                        <Ionicons
                          name={emailError ? 'alert-circle' : emailIsValid ? 'checkmark-circle' : 'mail'}
                          size={FIELD_ICON_SIZE}
                          color={
                            emailError
                              ? C.wine
                              : emailIsValid
                                ? C.sage
                                : focusedField
                                  ? C.sage
                                  : C.charcoal60
                          }
                          style={styles.inputLeftIcon}
                        />
                        <TextInput
                          style={[styles.input, email ? styles.inputFilled : null]}
                          value={email}
                          onChangeText={setEmail}
                          onFocus={() => setFocusedField(true)}
                          onBlur={() => {
                            setFocusedField(false);
                            setEmailTouched(true);
                          }}
                          placeholder="you@example.com"
                          placeholderTextColor={C.charcoal50}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoComplete="email"
                          returnKeyType="done"
                          onSubmitEditing={handleSubmit}
                        />
                      </View>
                      {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
                    </View>

                    <Animated.View style={{ transform: [{ scale: primaryScale }] }}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.submitBtn,
                          (!isFormValid || isSubmitting) ? styles.submitBtnDisabled : null,
                          pressed && isFormValid ? styles.submitBtnPressed : null,
                        ]}
                        onPress={handleSubmit}
                        disabled={!isFormValid || isSubmitting}
                      >
                        <LinearGradient
                          colors={[C.wine, 'rgba(114,47,55,0.8)']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.submitBtnGradient}
                        >
                          <Text style={styles.submitTxt}>
                            {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                          </Text>
                        </LinearGradient>
                      </Pressable>
                    </Animated.View>

                    <View style={styles.switchRow}>
                      <Text style={styles.switchText}>Remember your password? </Text>
                      <Pressable onPress={() => router.replace(routes.login() as never)}>
                        <Text style={styles.switchLink}>Sign in</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.successIconWrap}>
                      <View style={styles.successCircle}>
                        <Ionicons name="mail-outline" size={38} color={C.charcoal} />
                      </View>
                    </View>

                    <View style={styles.nextStepsCard}>
                      <Text style={styles.nextStepsTitle}>Next steps</Text>
                      {[
                        'Check your inbox (and spam folder)',
                        'Click the reset link in the email',
                        'Create a new password',
                      ].map((step, i) => (
                        <View key={step} style={styles.nextStepRow}>
                          <View style={styles.nextStepNum}>
                            <Text style={styles.nextStepNumTxt}>{i + 1}</Text>
                          </View>
                          <Text style={styles.nextStepTxt}>{step}</Text>
                        </View>
                      ))}
                      <Text style={styles.expiryNote}>Reset link expires in 60 minutes.</Text>
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        styles.submitBtn,
                        pressed ? styles.submitBtnPressed : null,
                      ]}
                      onPress={() => router.replace(routes.login() as never)}
                    >
                      <LinearGradient
                        colors={[C.wine, 'rgba(114,47,55,0.8)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitBtnGradient}
                      >
                        <Text style={styles.submitTxt}>Back to Login</Text>
                      </LinearGradient>
                    </Pressable>

                    <Pressable
                      style={styles.differentEmailBtn}
                      onPress={handleUseDifferentEmail}
                    >
                      <Text style={styles.differentEmailTxt}>Use a different email</Text>
                    </Pressable>
                  </>
                )}
              </LinearGradient>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  scroll: {
    paddingHorizontal: GRID * 2,
    alignItems: 'center',
  },

  rail: {
    width: '100%',
    maxWidth: MAX_RAIL_WIDTH,
    gap: GRID * 3,
  },

  backBtnWrap: {
    position: 'absolute',
    left: GRID * 2,
    zIndex: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45,45,45,0.08)',
  },

  titleBlock: {
    alignItems: 'center',
    gap: GRID,
    paddingHorizontal: GRID,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: C.charcoal,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: C.charcoal70,
    textAlign: 'center',
    fontWeight: '400',
  },

  cardWrap: {
    width: '100%',
  },
  card: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: GRID,
    paddingVertical: GRID * 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GRID,
    backgroundColor: C.errorBg,
    borderWidth: 1,
    borderColor: C.errorBorder,
    borderRadius: GRID * 1.5,
    padding: GRID * 1.5,
    marginBottom: GRID * 2,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: C.errorText,
    lineHeight: 18,
  },

  fieldWrap: {
    marginBottom: GRID * 2,
  },
  fieldLabel: {
    marginBottom: GRID,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.93)',
  },
  inputRow: {
    position: 'relative',
    minHeight: GRID * 7,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.inputBorder,
  },
  inputRowError: {
    borderColor: C.wine,
  },
  inputRowFocused: {
    borderColor: C.wine,
    shadowColor: C.wine,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  inputLeftIcon: {
    position: 'absolute',
    left: GRID * 2,
    top: '50%',
    marginTop: -(FIELD_ICON_SIZE / 2),
    zIndex: 2,
  },
  input: {
    paddingLeft: GRID * 5.75,
    paddingRight: GRID * 2.5,
    paddingVertical: GRID * 1.75,
    fontSize: 16,
    color: C.charcoal,
    fontFamily: 'Urbanist_400Regular',
    borderRadius: 999,
  },
  inputFilled: {
    fontFamily: 'Urbanist_600SemiBold',
  },
  fieldError: {
    marginTop: GRID * 0.5,
    fontSize: 12,
    fontWeight: '600',
    color: '#FDE2D5',
  },

  submitBtn: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: C.wine,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  submitBtnGradient: {
    minHeight: GRID * 7,
    paddingVertical: GRID * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  submitBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  submitTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: C.white,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: GRID * 2.5,
    paddingTop: GRID * 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  switchText: {
    fontSize: 14,
    color: C.white,
    fontWeight: '400',
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '600',
    color: C.white,
  },

  successIconWrap: {
    alignItems: 'center',
    marginBottom: GRID * 2,
  },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextStepsCard: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.36)',
    borderRadius: 12,
    paddingHorizontal: GRID * 1.5,
    paddingVertical: GRID * 1.5,
    marginBottom: GRID * 2,
    gap: GRID,
  },
  nextStepsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.93)',
    marginBottom: GRID * 0.5,
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: GRID * 1.25,
  },
  nextStepNum: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  nextStepNumTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: C.white,
  },
  nextStepTxt: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '400',
  },
  expiryNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: GRID * 0.5,
    fontWeight: '400',
  },

  differentEmailBtn: {
    alignItems: 'center',
    paddingVertical: GRID * 1.5,
    marginTop: GRID,
  },
  differentEmailTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
});
