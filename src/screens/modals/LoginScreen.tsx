import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuthSession } from '../../hooks/useSession';
import { routes } from '../../navigation/routes';
import { Text } from '../../components/Typography';

type AuthMode = 'login' | 'register';
type AccountType = 'personal' | 'business';

type Props = {
  defaultMode?: AuthMode;
};

const C = {
  page: '#E5E0E5',
  card: '#9DAB9B',
  wine: '#722F37',
  wineLight: 'rgba(114,47,55,0.12)',
  charcoal: '#2D2D2D',
  white: '#FFFFFF',
  sage: '#7D9B76',
  textMuted: '#5A5A5A',
  textSubtle: '#8A8A8A',
  error: '#C2410C',
  errorBg: 'rgba(254,242,232,0.95)',
  errorBorder: 'rgba(251,146,60,0.35)',
  whiteA20: 'rgba(255,255,255,0.20)',
  whiteA15: 'rgba(255,255,255,0.15)',
  whiteA10: 'rgba(255,255,255,0.10)',
  charcoalA70: 'rgba(45,45,45,0.70)',
};

function passwordScore(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function validateUsername(u: string): string {
  if (!u) return 'Username is required';
  if (u.length < 3) return 'At least 3 characters';
  if (u.length > 30) return 'Max 30 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(u)) return 'Letters, numbers and underscores only';
  return '';
}

function validateEmail(e: string): string {
  if (!e) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Enter a valid email';
  return '';
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
const STRENGTH_COLORS = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#16A34A'];

export default function LoginScreen({ defaultMode = 'login' }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signInWithPassword, signInWithGoogle } = useAuthSession();

  const [authMode, setAuthMode] = useState<AuthMode>(defaultMode);
  const [accountType, setAccountType] = useState<AccountType>('personal');

  const [username, setUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Sliding tab indicator (0 = register/left, 1 = login/right)
  const tabAnim = useRef(new Animated.Value(defaultMode === 'login' ? 1 : 0)).current;
  // Sliding account type indicator (0 = personal, 1 = business)
  const acctAnim = useRef(new Animated.Value(0)).current;
  // Form content fade + slide
  const formOpacity = useRef(new Animated.Value(1)).current;
  const formTranslateY = useRef(new Animated.Value(0)).current;
  // Title crossfade
  const titleOpacity = useRef(new Animated.Value(1)).current;
  const titleTranslateY = useRef(new Animated.Value(0)).current;
  // Pill widths measured via onLayout
  const [tabPillWidth, setTabPillWidth] = useState(0);
  const [acctPillWidth, setAcctPillWidth] = useState(0);

  // Entrance animations (mount only — independent of mode-switch animations)
  const backEntranceOpacity = useRef(new Animated.Value(0)).current;
  const backEntranceScale   = useRef(new Animated.Value(0.7)).current;
  const titleEntranceOpacity = useRef(new Animated.Value(0)).current;
  const titleEntranceY       = useRef(new Animated.Value(20)).current;
  const toggleEntranceOpacity = useRef(new Animated.Value(0)).current;
  const toggleEntranceY       = useRef(new Animated.Value(16)).current;
  const cardEntranceOpacity = useRef(new Animated.Value(0)).current;
  const cardEntranceY       = useRef(new Animated.Value(28)).current;
  const cardEntranceScale   = useRef(new Animated.Value(0.97)).current;

  const switchMode = useCallback((mode: AuthMode) => {
    if (mode === authMode) return;
    // Slide indicator with spring
    Animated.spring(tabAnim, {
      toValue: mode === 'login' ? 1 : 0,
      damping: 20, stiffness: 200, useNativeDriver: true,
    }).start();
    // Fade form + title out, swap state, fade back in
    Animated.parallel([
      Animated.timing(formOpacity, { toValue: 0, duration: 130, useNativeDriver: true }),
      Animated.timing(formTranslateY, { toValue: -10, duration: 130, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 0, duration: 110, useNativeDriver: true }),
      Animated.timing(titleTranslateY, { toValue: -6, duration: 110, useNativeDriver: true }),
    ]).start(() => {
      setAuthMode(mode);
      setError('');
      formTranslateY.setValue(10);
      titleTranslateY.setValue(6);
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(formTranslateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(titleTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }, [authMode, tabAnim, formOpacity, formTranslateY, titleOpacity, titleTranslateY]);

  const switchAccountType = useCallback((type: AccountType) => {
    Animated.spring(acctAnim, {
      toValue: type === 'business' ? 1 : 0,
      damping: 20, stiffness: 200, useNativeDriver: true,
    }).start();
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(titleTranslateY, { toValue: -4, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setAccountType(type);
      titleTranslateY.setValue(4);
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(titleTranslateY, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    });
  }, [acctAnim, titleOpacity, titleTranslateY]);

  // Staggered entrance on mount
  useEffect(() => {
    const fade = (val: Animated.Value, delay: number, duration = 360) =>
      Animated.timing(val, { toValue: 1, delay, duration, useNativeDriver: true });
    const slide = (val: Animated.Value, delay: number, duration = 380) =>
      Animated.timing(val, { toValue: 0, delay, duration, useNativeDriver: true });
    const spring = (val: Animated.Value, toValue: number, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(val, { toValue, useNativeDriver: true, damping: 18, stiffness: 180 }),
      ]);

    // Back button: 0ms — scale pop + fade
    Animated.parallel([
      fade(backEntranceOpacity, 0, 280),
      spring(backEntranceScale, 1, 0),
    ]).start();

    // Title block: 80ms — slide up + fade
    Animated.parallel([
      fade(titleEntranceOpacity, 80, 380),
      slide(titleEntranceY, 80, 380),
    ]).start();

    // Account type toggle: 160ms — slide up + fade
    Animated.parallel([
      fade(toggleEntranceOpacity, 160, 360),
      slide(toggleEntranceY, 160, 360),
    ]).start();

    // Card: 240ms — slide up + scale + fade
    Animated.parallel([
      fade(cardEntranceOpacity, 240, 400),
      slide(cardEntranceY, 240, 400),
      spring(cardEntranceScale, 1, 240),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isRegister = authMode === 'register';
  const isBusiness = accountType === 'business';

  const usernameError = usernameTouched ? validateUsername(username) : '';
  const emailError = emailTouched ? validateEmail(email) : '';
  const pwScore = passwordScore(password);

  const isFormValid = isRegister
    ? !validateUsername(username) && !validateEmail(email) && pwScore >= 2 && consent
    : email.length > 0 && password.length > 0;

  const handleBack = useCallback(() => {
    router.push(routes.onboarding() as never);
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              account_type: accountType,
            },
          },
        });
        if (signUpError) throw signUpError;
        // New users go through onboarding
        router.replace(routes.interests() as never);
      } else {
        await signInWithPassword(email, password);
        router.replace(routes.home() as never);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, isSubmitting, isRegister, email, password, username, accountType, signInWithPassword, router]);

  const handleGoogle = useCallback(async () => {
    if (isGoogleLoading) return;
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace(routes.home() as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  }, [isGoogleLoading, signInWithGoogle, router]);

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background decoration — clipped to screen bounds */}
      <View style={styles.orbLayer} pointerEvents="none">
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />
        <View style={[styles.orb, styles.orb4]} />
      </View>

      {/* Back button */}
      <Animated.View
        style={[
          styles.backBtnWrap,
          { top: insets.top + 12, opacity: backEntranceOpacity, transform: [{ scale: backEntranceScale }] },
        ]}
        pointerEvents="box-none"
      >
        <Pressable style={styles.backBtn} onPress={handleBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={C.charcoal} />
        </Pressable>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Animated.View style={{ opacity: titleEntranceOpacity, transform: [{ translateY: titleEntranceY }] }}>
          <Animated.View style={[styles.titleBlock, { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }]}>
            <Text style={styles.title}>
              {isBusiness
                ? isRegister ? 'Register Your Business' : 'Business Login'
                : isRegister ? 'Create Your Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isBusiness
                ? isRegister
                  ? 'Register your business to manage your presence and connect with customers.'
                  : 'Sign in to manage your business presence and respond to reviews.'
                : isRegister
                  ? 'Sign up today - share honest reviews, climb leaderboards, and rate any business!'
                  : 'Sign in to continue discovering sayso'}
            </Text>
          </Animated.View>
          </Animated.View>

          {/* Account type toggle */}
          <Animated.View style={{ opacity: toggleEntranceOpacity, transform: [{ translateY: toggleEntranceY }] }}>
          <View style={styles.accountToggleWrap}>
            <View
              style={styles.accountToggle}
              onLayout={e => setAcctPillWidth(e.nativeEvent.layout.width)}
            >
              {acctPillWidth > 0 && (
                <Animated.View style={[
                  styles.acctIndicator,
                  {
                    width: (acctPillWidth - 8) / 2,
                    transform: [{ translateX: acctAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, (acctPillWidth - 8) / 2],
                    }) }],
                  },
                ]} />
              )}
              {(['personal', 'business'] as AccountType[]).map((type) => (
                <Pressable
                  key={type}
                  style={styles.accountToggleBtn}
                  onPress={() => switchAccountType(type)}
                >
                  <Text style={[styles.accountToggleTxt, accountType === type && styles.accountToggleTxtActive]}>
                    {type === 'personal' ? 'Personal' : 'Business'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          </Animated.View>

          {/* Card */}
          <Animated.View style={{ opacity: cardEntranceOpacity, transform: [{ translateY: cardEntranceY }, { scale: cardEntranceScale }] }}>
          <View style={styles.card}>
            {/* Register / Login tab */}
            <View style={styles.tabRow}>
              <View
                style={styles.tabPill}
                onLayout={e => setTabPillWidth(e.nativeEvent.layout.width)}
              >
                {tabPillWidth > 0 && (
                  <Animated.View style={[
                    styles.tabIndicator,
                    {
                      width: (tabPillWidth - 8) / 2,
                      transform: [{ translateX: tabAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, (tabPillWidth - 8) / 2],
                      }) }],
                    },
                  ]} />
                )}
                {(['register', 'login'] as AuthMode[]).map((mode) => (
                  <Pressable key={mode} style={styles.tabBtn} onPress={() => switchMode(mode)}>
                    <Text style={[styles.tabTxt, authMode === mode && styles.tabTxtActive]}>
                      {mode === 'register' ? 'Register' : 'Login'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Animated form content */}
            <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formTranslateY }] }}>

            {/* Error banner */}
            {!!error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={C.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Username (register only) */}
            {isRegister && (
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{isBusiness ? 'Business username' : 'Username'}</Text>
                <TextInput
                  style={[styles.input, !!usernameError && styles.inputError]}
                  value={username}
                  onChangeText={setUsername}
                  onBlur={() => setUsernameTouched(true)}
                  placeholder="e.g. johndoe"
                  placeholderTextColor={C.whiteA20}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username-new"
                  returnKeyType="next"
                />
                {!!usernameError && (
                  <Text style={styles.fieldError}>{usernameError}</Text>
                )}
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>{isBusiness ? 'Business email' : 'Email'}</Text>
              <TextInput
                style={[styles.input, !!emailError && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                onBlur={() => setEmailTouched(true)}
                placeholder={isBusiness ? 'business@company.com' : 'you@example.com'}
                placeholderTextColor={C.whiteA20}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
              />
              {!!emailError && (
                <Text style={styles.fieldError}>{emailError}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={isRegister ? 'Create a password' : 'Enter your password'}
                  placeholderTextColor={C.whiteA20}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <Pressable style={styles.eyeBtn} onPress={() => setPasswordVisible((v) => !v)} hitSlop={8}>
                  <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.6)" />
                </Pressable>
              </View>
              {/* Strength bars (register only) */}
              {isRegister && password.length > 0 && (
                <View style={styles.strengthWrap}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: i <= pwScore ? STRENGTH_COLORS[pwScore] : 'rgba(255,255,255,0.2)' },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: STRENGTH_COLORS[pwScore] || 'rgba(255,255,255,0.5)' }]}>
                    {STRENGTH_LABELS[pwScore] ?? ''}
                  </Text>
                </View>
              )}
            </View>

            {/* Forgot password (login only) */}
            {!isRegister && (
              <Pressable onPress={() => router.push(routes.forgotPassword() as never)} style={styles.forgotWrap}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            )}

            {/* Consent (register only) */}
            {isRegister && (
              <Pressable style={styles.consentRow} onPress={() => setConsent((v) => !v)}>
                <View style={[styles.checkbox, consent && styles.checkboxChecked]}>
                  {consent && <Ionicons name="checkmark" size={12} color={C.white} />}
                </View>
                <Text style={styles.consentText}>
                  I agree to the{' '}
                  <Text style={styles.consentLink} onPress={() => router.push(routes.terms() as never)}>
                    Terms of Use
                  </Text>
                  {' '}and{' '}
                  <Text style={styles.consentLink} onPress={() => router.push(routes.privacy() as never)}>
                    Privacy Policy
                  </Text>
                </Text>
              </Pressable>
            )}

            {/* Submit */}
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                (!isFormValid || isSubmitting) && styles.submitBtnDisabled,
                pressed && isFormValid && styles.submitBtnPressed,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.submitTxt}>
                  {isRegister ? 'Creating account…' : 'Signing in…'}
                </Text>
              ) : (
                <Text style={styles.submitTxt}>
                  {isRegister
                    ? isBusiness ? 'Create business account' : 'Create account'
                    : isBusiness ? 'Business sign in' : 'Sign in'}
                </Text>
              )}
            </Pressable>

            {/* Google (personal only) */}
            {!isBusiness && (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>
                <Pressable
                  style={({ pressed }) => [styles.googleBtn, pressed && styles.googleBtnPressed, isGoogleLoading && styles.submitBtnDisabled]}
                  onPress={handleGoogle}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Text style={styles.googleTxt}>Connecting…</Text>
                  ) : (
                    <>
                      <View style={styles.googleIcon}>
                        <Text style={{ fontSize: 15 }}>G</Text>
                      </View>
                      <Text style={styles.googleTxt}>Google</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}

            {/* Switch mode */}
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <Pressable onPress={() => switchMode(isRegister ? 'login' : 'register')}>
                <Text style={styles.switchLink}>
                  {isRegister ? 'Log in' : 'Sign up'}
                </Text>
              </Pressable>
            </View>

            </Animated.View>
          </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20 },

  // Orbs
  orbLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 260, height: 260, top: -80, right: -60, backgroundColor: 'rgba(114,47,55,0.12)' },
  orb2: { width: 180, height: 180, top: 140, left: -60, backgroundColor: 'rgba(157,171,155,0.18)' },
  orb3: { width: 140, height: 140, bottom: 200, right: -40, backgroundColor: 'rgba(125,155,118,0.14)' },
  orb4: { width: 100, height: 100, bottom: 80, left: 20, backgroundColor: 'rgba(114,47,55,0.08)' },

  // Back
  backBtnWrap: { position: 'absolute', left: 16, zIndex: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },

  // Title
  titleBlock: { marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 30, fontWeight: '700', color: '#2D2D2D', textAlign: 'center', letterSpacing: -0.5, lineHeight: 36 },
  subtitle: { fontSize: 15, lineHeight: 22, color: 'rgba(45,45,45,0.65)', textAlign: 'center', marginTop: 6, paddingHorizontal: 8 },

  // Account type toggle
  accountToggleWrap: { alignItems: 'center', marginBottom: 16 },
  accountToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 999, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  acctIndicator: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: 999, backgroundColor: 'rgba(114,47,55,0.9)', shadowColor: '#722F37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  accountToggleBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999, zIndex: 1 },
  accountToggleTxt: { fontSize: 13, fontWeight: '600', color: 'rgba(45,45,45,0.65)' },
  accountToggleTxtActive: { color: '#FFFFFF' },

  // Card
  card: { backgroundColor: '#9DAB9B', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },

  // Tab
  tabRow: { alignItems: 'center', marginBottom: 20 },
  tabPill: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: 4 },
  tabIndicator: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: 999, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999, zIndex: 1 },
  tabTxt: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.65)' },
  tabTxtActive: { color: '#2D2D2D' },

  // Error
  errorBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(254,242,232,0.95)', borderWidth: 1, borderColor: 'rgba(251,146,60,0.35)', borderRadius: 12, padding: 12, marginBottom: 14 },
  errorText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#C2410C', lineHeight: 18 },

  // Fields
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 14, fontSize: 16, color: '#FFFFFF', fontFamily: 'Urbanist_500Medium' },
  inputError: { borderColor: 'rgba(239,68,68,0.6)' },
  fieldError: { marginTop: 4, fontSize: 12, fontWeight: '600', color: '#FCA5A5' },

  // Password
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },

  // Strength
  strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: 999 },
  strengthLabel: { fontSize: 12, fontWeight: '700', width: 60, textAlign: 'right' },

  // Forgot
  forgotWrap: { alignItems: 'flex-end', marginTop: -4, marginBottom: 8 },
  forgotText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },

  // Consent
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: '#7D9B76', borderColor: '#7D9B76' },
  consentText: { flex: 1, fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.85)', fontWeight: '400' },
  consentLink: { fontWeight: '700', color: '#FFFFFF', textDecorationLine: 'underline' },

  // Submit
  submitBtn: { marginTop: 8, backgroundColor: '#722F37', borderRadius: 999, paddingVertical: 16, alignItems: 'center', shadowColor: '#722F37', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 6 },
  submitBtnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  submitBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  submitTxt: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  dividerText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

  // Google
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 999, paddingVertical: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  googleBtnPressed: { opacity: 0.9 },
  googleIcon: { width: 20, height: 20, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  googleTxt: { fontSize: 14, fontWeight: '700', color: '#2D2D2D' },

  // Switch mode
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  switchText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '400' },
  switchLink: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
