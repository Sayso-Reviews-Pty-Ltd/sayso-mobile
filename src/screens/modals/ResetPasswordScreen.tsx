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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { routes } from '../../navigation/routes';
import { Text } from '../../components/Typography';
import { SkeletonBlock } from '../../components/SkeletonBlock';

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
  amber: '#F59E0B',
};

function passwordScore(pw: string): number {
  if (pw.length === 0) return 0;
  if (pw.length < 6) return 1;
  if (pw.length < 8) return 2;
  if (pw.length < 12) return 3;
  return 4;
}

type ScreenState = 'checking' | 'invalid' | 'form' | 'success';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code?: string }>();

  const [screenState, setScreenState] = useState<ScreenState>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<'password' | 'confirm' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(GRID * 2)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(GRID * 2.5)).current;
  const primaryScale = useRef(new Animated.Value(0.98)).current;

  const runEntrance = useCallback(() => {
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
  }, [cardOpacity, cardY, headerOpacity, headerY, primaryScale]);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        if (code) {
          // Deep-link from password reset email — exchange the PKCE code for a recovery session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!cancelled) {
          if (data.session) {
            setScreenState('form');
          } else {
            setScreenState('invalid');
          }
          runEntrance();
        }
      } catch {
        if (!cancelled) {
          setScreenState('invalid');
          runEntrance();
        }
      }
    }

    checkSession();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runEntrance]);

  const pwScore = passwordScore(password);
  const passwordError =
    passwordTouched && !password ? 'Password is required.' :
    passwordTouched && password.length < 6 ? 'Use at least 6 characters.' : '';
  const confirmError =
    confirmTouched && !confirmPassword ? 'Please confirm your password.' :
    confirmTouched && confirmPassword !== password ? 'Passwords do not match.' : '';

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
      setTimeout(() => {
        router.replace(routes.home() as never);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We couldn\'t reset your password right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, isSubmitting, password, router]);

  const getPasswordIcon = () => {
    if (!password.length) return focusedField === 'password' ? 'checkmark-circle' : 'lock-closed';
    if (pwScore >= 3) return 'checkmark-circle';
    return 'alert-circle';
  };

  const getPasswordIconColor = () => {
    if (passwordError) return C.wine;
    if (!password.length) return focusedField === 'password' ? C.sage : C.charcoal60;
    if (pwScore >= 3) return C.sage;
    return C.amber;
  };

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}>
      {screenState !== 'checking' && (
        <View style={[styles.backBtnWrap, { top: insets.top + GRID * 1.5 }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back-outline" size={22} color={C.charcoal} />
          </Pressable>
        </View>
      )}

      {screenState === 'checking' ? (
        <View style={[styles.loadingWrap, { paddingTop: insets.top }]}>
          <View style={styles.skeletonGroup}>
            <SkeletonBlock style={styles.skeletonOrb} />
            <SkeletonBlock style={styles.skeletonLine} />
          </View>
          <Text style={styles.loadingLabel}>Verifying reset link…</Text>
        </View>
      ) : (
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
                    {screenState === 'invalid'
                      ? 'Link Expired'
                      : screenState === 'success'
                        ? 'Password Updated'
                        : 'New Password'}
                  </Text>
                  <Text style={styles.subtitle}>
                    {screenState === 'invalid'
                      ? 'This reset link is no longer valid. Please request a new one.'
                      : screenState === 'success'
                        ? 'Your password has been updated. Redirecting you to home.'
                        : 'Enter a new password for your account.'}
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
                  {screenState === 'invalid' && (
                    <>
                      <View style={styles.stateIconWrap}>
                        <View style={[styles.stateCircle, styles.stateCircleWarning]}>
                          <Ionicons name="close-outline" size={32} color="#F59E0B" />
                        </View>
                      </View>
                      <Text style={styles.stateMessage}>
                        Your password reset link may have expired or already been used. Request a fresh link to continue.
                      </Text>
                      <Pressable
                        style={({ pressed }) => [
                          styles.submitBtn,
                          pressed ? styles.submitBtnPressed : null,
                        ]}
                        onPress={() => router.replace(routes.forgotPassword() as never)}
                      >
                        <LinearGradient
                          colors={[C.wine, 'rgba(114,47,55,0.8)']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.submitBtnGradient}
                        >
                          <Text style={styles.submitTxt}>Request New Link</Text>
                        </LinearGradient>
                      </Pressable>
                      <Pressable
                        style={styles.secondaryBtn}
                        onPress={() => router.replace(routes.login() as never)}
                      >
                        <Text style={styles.secondaryBtnTxt}>Back to Login</Text>
                      </Pressable>
                    </>
                  )}

                  {screenState === 'success' && (
                    <>
                      <View style={styles.stateIconWrap}>
                        <View style={[styles.stateCircle, styles.stateCircleSuccess]}>
                          <Ionicons name="checkmark-outline" size={36} color={C.sage} />
                        </View>
                      </View>
                      <Text style={styles.stateMessage}>
                        All set! You're being redirected to home.
                      </Text>
                    </>
                  )}

                  {screenState === 'form' && (
                    <>
                      {!!error && (
                        <View style={styles.errorBanner}>
                          <Ionicons name="alert-circle-outline" size={16} color={C.errorText} />
                          <Text style={styles.errorText}>{error}</Text>
                        </View>
                      )}

                      <View style={styles.fieldWrap}>
                        <Text style={styles.fieldLabel}>New Password</Text>
                        <View
                          style={[
                            styles.inputRow,
                            focusedField === 'password' ? styles.inputRowFocused : null,
                            passwordError ? styles.inputRowError : null,
                          ]}
                        >
                          <Ionicons
                            name={getPasswordIcon()}
                            size={FIELD_ICON_SIZE}
                            color={getPasswordIconColor()}
                            style={styles.inputLeftIcon}
                          />
                          <TextInput
                            style={[styles.input, styles.passwordInput, password ? styles.inputFilled : null]}
                            value={password}
                            onChangeText={setPassword}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => {
                              setFocusedField(null);
                              setPasswordTouched(true);
                            }}
                            placeholder="Create a password"
                            placeholderTextColor={C.charcoal50}
                            secureTextEntry={!passwordVisible}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="new-password"
                            returnKeyType="next"
                          />
                          <Pressable
                            style={styles.eyeBtn}
                            onPress={() => setPasswordVisible((v) => !v)}
                            hitSlop={8}
                          >
                            <Ionicons
                              name={passwordVisible ? 'eye-off' : 'eye'}
                              size={FIELD_ICON_SIZE}
                              color={C.charcoal60}
                            />
                          </Pressable>
                        </View>
                        {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
                        {!passwordError && password.length > 0 ? (
                          <View style={styles.strengthWrap}>
                            <View style={styles.strengthBars}>
                              {[1, 2, 3, 4].map((i) => (
                                <View
                                  key={i}
                                  style={[
                                    styles.strengthBar,
                                    {
                                      backgroundColor:
                                        i <= pwScore
                                          ? pwScore >= 3 ? C.sage : C.amber
                                          : 'rgba(45,45,45,0.16)',
                                    },
                                  ]}
                                />
                              ))}
                            </View>
                            <Text
                              style={[
                                styles.strengthLabel,
                                { color: pwScore >= 3 ? C.sage : C.amber },
                              ]}
                            >
                              {pwScore === 1 ? 'Too short' : pwScore === 2 ? 'Good' : pwScore === 3 ? 'Strong' : 'Very strong'}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.fieldWrap}>
                        <Text style={styles.fieldLabel}>Confirm Password</Text>
                        <View
                          style={[
                            styles.inputRow,
                            focusedField === 'confirm' ? styles.inputRowFocused : null,
                            confirmError ? styles.inputRowError : null,
                          ]}
                        >
                          <Ionicons
                            name={
                              confirmError
                                ? 'alert-circle'
                                : confirmTouched && confirmPassword && confirmPassword === password
                                  ? 'checkmark-circle'
                                  : 'lock-closed'
                            }
                            size={FIELD_ICON_SIZE}
                            color={
                              confirmError
                                ? C.wine
                                : confirmTouched && confirmPassword && confirmPassword === password
                                  ? C.sage
                                  : focusedField === 'confirm'
                                    ? C.sage
                                    : C.charcoal60
                            }
                            style={styles.inputLeftIcon}
                          />
                          <TextInput
                            style={[styles.input, styles.passwordInput, confirmPassword ? styles.inputFilled : null]}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            onFocus={() => setFocusedField('confirm')}
                            onBlur={() => {
                              setFocusedField(null);
                              setConfirmTouched(true);
                            }}
                            placeholder="Confirm your password"
                            placeholderTextColor={C.charcoal50}
                            secureTextEntry={!confirmVisible}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="new-password"
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                          />
                          <Pressable
                            style={styles.eyeBtn}
                            onPress={() => setConfirmVisible((v) => !v)}
                            hitSlop={8}
                          >
                            <Ionicons
                              name={confirmVisible ? 'eye-off' : 'eye'}
                              size={FIELD_ICON_SIZE}
                              color={C.charcoal60}
                            />
                          </Pressable>
                        </View>
                        {confirmError ? <Text style={styles.fieldError}>{confirmError}</Text> : null}
                      </View>

                      <Animated.View style={{ transform: [{ scale: primaryScale }] }}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.submitBtn,
                            (!isFormValid || isSubmitting) ? styles.submitBtnDisabled : null,
                            pressed && isFormValid ? styles.submitBtnPressed : null,
                          ]}
                          onPress={handleSubmit}
                          disabled={isSubmitting}
                        >
                          <LinearGradient
                            colors={[C.wine, 'rgba(114,47,55,0.8)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitBtnGradient}
                          >
                            <Text style={styles.submitTxt}>
                              {isSubmitting ? 'Updating…' : 'Update Password'}
                            </Text>
                          </LinearGradient>
                        </Pressable>
                      </Animated.View>
                    </>
                  )}
                </LinearGradient>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  skeletonGroup: {
    alignItems: 'center',
    gap: 10,
  },
  skeletonOrb: {
    width: 54,
    height: 54,
    borderRadius: 999,
  },
  skeletonLine: {
    width: 140,
    height: 10,
    borderRadius: 999,
  },
  loadingLabel: {
    fontSize: 15,
    color: 'rgba(45,45,45,0.6)',
  },

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

  stateIconWrap: {
    alignItems: 'center',
    marginBottom: GRID * 2,
  },
  stateCircle: {
    width: 80,
    height: 80,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateCircleWarning: {
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  stateCircleSuccess: {
    backgroundColor: 'rgba(125,155,118,0.22)',
  },
  stateMessage: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    marginBottom: GRID * 2.5,
    fontWeight: '400',
    paddingHorizontal: GRID,
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
  passwordInput: {
    paddingRight: GRID * 6,
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
  eyeBtn: {
    position: 'absolute',
    right: GRID * 1.75,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GRID,
    marginTop: GRID,
  },
  strengthBars: {
    flex: 1,
    flexDirection: 'row',
    gap: GRID * 0.5,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },
  strengthLabel: {
    width: 78,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
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

  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: GRID * 1.5,
    marginTop: GRID,
  },
  secondaryBtnTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
});
