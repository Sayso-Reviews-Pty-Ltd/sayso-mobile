import { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuthSession } from '../../hooks/useSession';
import { useChangePassword } from '../../hooks/useChangePassword';
import { Text } from '../../components/Typography';

const GRID = 8;
const ICON_SIZE = 18;
const C = {
  page: '#E5E0E5',
  card: '#9DAB9B',
  wine: '#722F37',
  sage: '#7D9B76',
  charcoal: '#2D2D2D',
  charcoal60: 'rgba(45,45,45,0.6)',
  charcoal50: 'rgba(45,45,45,0.5)',
  white: '#FFFFFF',
  inputBg: 'rgba(255,255,255,0.95)',
  inputBorder: 'rgba(255,255,255,0.6)',
  errorText: '#722F37',
  errorBg: 'rgba(229,224,229,0.95)',
  errorBorder: 'rgba(114,47,55,0.35)',
};

type Field = 'current' | 'new' | 'confirm';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthSession();
  const changePassword = useChangePassword();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [visible, setVisible] = useState<Partial<Record<Field, boolean>>>({});
  const [focused, setFocused] = useState<Field | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSignedOut, setIsSignedOut] = useState(false);
  const isSubmittingRef = useRef(false);

  const currentError = touched.current && !currentPw ? 'Current password is required.' : '';
  const newError =
    touched.new && !newPw ? 'New password is required.' :
    touched.new && [...newPw].length < 6 ? 'Use at least 6 characters.' : '';
  const confirmError =
    touched.confirm && !confirmPw ? 'Please confirm your password.' :
    touched.confirm && confirmPw !== newPw ? 'Passwords do not match.' : '';

  const isValid = !currentError && !newError && !confirmError &&
    !!currentPw && [...newPw].length >= 6 && confirmPw === newPw;
  const formDisabled = changePassword.isPending || isSignedOut;

  const touch = (field: Field) => setTouched((t) => ({ ...t, [field]: true }));
  const toggleVisible = (field: Field) => setVisible((v) => ({ ...v, [field]: !v[field] }));

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      setTouched({ current: true, new: true, confirm: true });
      if (!isValid || changePassword.isPending || isSignedOut) return;
      setError('');

      if (!user?.email) {
        setError('You are not signed in. Please sign in again before changing your password.');
        return;
      }

      const currentPassword = currentPw.trim();
      const newPassword = newPw.trim();

      if (currentPassword === newPassword) {
        setError('Your new password must be different from your current password.');
        return;
      }

      if ([...newPassword].length > 72) {
        setError('Password must be 72 characters or fewer.');
        return;
      }

      // ── Step 1: verify current password ────────────────────────────────────
      // Errors here return early without touching auth state.
      let authVerified = false;
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (authError) {
          const isCredentialError =
            authError.code === 'invalid_grant' ||
            authError.message?.includes('Email not confirmed') ||
            authError.message?.includes('Invalid login credentials');

          if (isCredentialError) {
            const isOAuthOnly =
              Array.isArray(user.identities) &&
              user.identities.length > 0 &&
              !user.identities.some((id) => id.provider === 'email');

            if (isOAuthOnly) {
              setError(
                "Your account uses Google sign-in and does not have a password. Use 'Forgot password' to set one via email.",
              );
              return;
            }
          }

          setError('Current password is incorrect.');
          return;
        }
        authVerified = true;
      } catch {
        setError('Failed to update password. Please try again.');
        return;
      }

      // ── Step 2: update password ─────────────────────────────────────────────
      // signInWithPassword succeeded; sign out on any failure to prevent
      // ambiguous re-auth state.
      if (!authVerified) return;
      try {
        await changePassword.mutateAsync({ newPassword });
        setSuccess(true);
      } catch {
        try {
          await supabase.auth.signOut();
        } catch {
          // Continue to signed-out recovery UI even if sign-out call fails.
        }
        setError('');
        setIsSignedOut(true);
      }
    } finally {
      isSubmittingRef.current = false;
    }
  }, [isValid, changePassword, user, currentPw, newPw, isSignedOut]);

  const renderField = (
    field: Field,
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    fieldError: string,
    extraProps?: object,
  ) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[
        styles.inputRow,
        focused === field && styles.inputRowFocused,
        fieldError ? styles.inputRowError : null,
      ]}>
        <Ionicons
          name={fieldError ? 'alert-circle' : 'lock-closed'}
          size={ICON_SIZE}
          color={fieldError ? C.wine : focused === field ? C.sage : C.charcoal60}
          style={styles.inputLeftIcon}
        />
        <TextInput
          style={[styles.input, value && styles.inputFilled]}
          value={value}
          onChangeText={onChange}
          editable={!isSignedOut}
          onFocus={() => setFocused(field)}
          onBlur={() => { setFocused(null); touch(field); }}
          placeholder={placeholder}
          placeholderTextColor={C.charcoal50}
          secureTextEntry={!visible[field]}
          autoCapitalize="none"
          autoCorrect={false}
          {...extraProps}
        />
        <Pressable
          style={[styles.eyeBtn, isSignedOut ? styles.eyeBtnDisabled : null]}
          onPress={() => toggleVisible(field)}
          hitSlop={8}
          disabled={isSignedOut}
        >
          <Ionicons name={visible[field] ? 'eye-off' : 'eye'} size={ICON_SIZE} color={C.charcoal60} />
        </Pressable>
      </View>
      {!!fieldError && <Text style={styles.fieldError}>{fieldError}</Text>}
    </View>
  );

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
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + GRID * 9, paddingBottom: insets.bottom + GRID * 4 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.rail}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{success ? 'Password Updated' : 'Change Password'}</Text>
              <Text style={styles.subtitle}>
                {success
                  ? 'Your password has been updated successfully.'
                  : 'Enter your current password then choose a new one.'}
              </Text>
            </View>

            <LinearGradient
              colors={[C.card, C.card, 'rgba(157,171,155,0.95)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {success ? (
                <View style={styles.successWrap}>
                  <View style={styles.successCircle}>
                    <Ionicons name="checkmark-outline" size={36} color={C.sage} />
                  </View>
                  <Text style={styles.successMsg}>All set! Your password is now updated.</Text>
                  <Pressable style={styles.doneBtn} onPress={() => router.back()}>
                    <LinearGradient
                      colors={[C.wine, 'rgba(114,47,55,0.8)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.btnGradient}
                    >
                      <Text style={styles.btnTxt}>Done</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              ) : (
                <>
                  {isSignedOut ? (
                    <View style={styles.errorBanner}>
                      <Ionicons name="shield-checkmark-outline" size={16} color={C.errorText} />
                      <Text style={styles.errorText}>
                        You have been signed out for security. Please sign in again to change your password.
                      </Text>
                    </View>
                  ) : null}
                  {!isSignedOut && !!error && (
                    <View style={styles.errorBanner}>
                      <Ionicons name="alert-circle-outline" size={16} color={C.errorText} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}
                  {renderField('current', 'Current Password', currentPw, setCurrentPw, 'Your current password', currentError, { autoComplete: 'current-password' })}
                  {renderField('new', 'New Password', newPw, setNewPw, 'Create a new password', newError, { autoComplete: 'new-password', maxLength: 72 })}
                  {renderField('confirm', 'Confirm New Password', confirmPw, setConfirmPw, 'Confirm new password', confirmError, { autoComplete: 'new-password', returnKeyType: 'done', onSubmitEditing: handleSubmit })}
                  <Pressable
                    style={({ pressed }) => [
                      styles.submitBtn,
                      (!isValid || formDisabled) && styles.submitBtnDisabled,
                      pressed && isValid && styles.submitBtnPressed,
                    ]}
                    onPress={handleSubmit}
                    disabled={formDisabled}
                  >
                    <LinearGradient
                      colors={[C.wine, 'rgba(114,47,55,0.8)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.btnGradient}
                    >
                      <Text style={styles.btnTxt}>
                        {changePassword.isPending ? 'Updating…' : 'Update Password'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                  {isSignedOut ? (
                    <Pressable
                      style={({ pressed }) => [styles.doneBtn, pressed ? styles.submitBtnPressed : null]}
                      onPress={() => router.replace('/login' as never)}
                    >
                      <LinearGradient
                        colors={[C.wine, 'rgba(114,47,55,0.8)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnGradient}
                      >
                        <Text style={styles.btnTxt}>Sign in</Text>
                      </LinearGradient>
                    </Pressable>
                  ) : null}
                </>
              )}
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: GRID * 2, alignItems: 'center' },
  rail: { width: '100%', maxWidth: 420, gap: GRID * 3 },

  backBtnWrap: { position: 'absolute', left: GRID * 2, zIndex: 20 },
  backBtn: {
    width: 40, height: 40, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(45,45,45,0.08)',
  },

  titleBlock: { alignItems: 'center', gap: GRID, paddingHorizontal: GRID },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '700', color: C.charcoal, textAlign: 'center', letterSpacing: -0.4 },
  subtitle: { fontSize: 16, lineHeight: 24, color: 'rgba(45,45,45,0.7)', textAlign: 'center', fontWeight: '400' },

  card: {
    width: '100%', borderRadius: 12,
    paddingHorizontal: GRID, paddingVertical: GRID * 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 8,
  },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: GRID,
    backgroundColor: C.errorBg, borderWidth: 1, borderColor: C.errorBorder,
    borderRadius: GRID * 1.5, padding: GRID * 1.5, marginBottom: GRID * 2,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: '600', color: C.errorText, lineHeight: 18 },

  fieldWrap: { marginBottom: GRID * 2 },
  fieldLabel: { marginBottom: GRID, fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.93)' },
  inputRow: {
    minHeight: GRID * 7, justifyContent: 'center', borderRadius: 999,
    backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.inputBorder,
  },
  inputRowError: { borderColor: C.wine },
  inputRowFocused: {
    borderColor: C.wine, shadowColor: C.wine,
    shadowOpacity: 0.16, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 2,
  },
  inputLeftIcon: { position: 'absolute', left: GRID * 2, top: '50%', marginTop: -(ICON_SIZE / 2), zIndex: 2 },
  input: {
    paddingLeft: GRID * 5.75, paddingRight: GRID * 6,
    paddingVertical: GRID * 1.75, fontSize: 16, color: C.charcoal,
    fontFamily: 'Urbanist_400Regular', borderRadius: 999,
  },
  inputFilled: { fontFamily: 'Urbanist_600SemiBold' },
  fieldError: { marginTop: GRID * 0.5, fontSize: 12, fontWeight: '600', color: '#FDE2D5' },
  eyeBtn: { position: 'absolute', right: GRID * 1.75, top: 0, bottom: 0, justifyContent: 'center' },
  eyeBtnDisabled: { opacity: 0.5 },

  submitBtn: {
    borderRadius: 999, overflow: 'hidden',
    shadowColor: C.wine, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 14, elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  submitBtnPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  btnGradient: { minHeight: GRID * 7, paddingVertical: GRID * 1.5, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { fontSize: 16, fontWeight: '600', color: C.white },
  doneBtn: { borderRadius: 999, overflow: 'hidden', shadowColor: C.wine, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 6 },

  successWrap: { alignItems: 'center', gap: GRID * 2 },
  successCircle: {
    width: 80, height: 80, borderRadius: 999,
    backgroundColor: 'rgba(125,155,118,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  successMsg: { fontSize: 14, lineHeight: 22, color: 'rgba(255,255,255,0.88)', textAlign: 'center', fontWeight: '400', paddingHorizontal: GRID },
});
