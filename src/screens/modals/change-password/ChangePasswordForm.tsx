import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../components/Typography';
import { ChangePasswordField } from './ChangePasswordField';

const GRID = 8;
const C = {
  wine: '#722F37',
  white: '#FFFFFF',
  errorText: '#722F37',
  errorBg: 'rgba(229,224,229,0.95)',
  errorBorder: 'rgba(114,47,55,0.35)',
};

type Field = 'current' | 'new' | 'confirm';

interface Props {
  currentPw: string; setCurrentPw: (v: string) => void;
  newPw: string; setNewPw: (v: string) => void;
  confirmPw: string; setConfirmPw: (v: string) => void;
  currentError: string; newError: string; confirmError: string;
  focused: Field | null;
  visible: Partial<Record<Field, boolean>>;
  isSignedOut: boolean;
  error: string;
  isValid: boolean;
  formDisabled: boolean;
  isPending: boolean;
  setFieldFocused: (f: Field | null) => void;
  touch: (f: Field) => void;
  toggleVisible: (f: Field) => void;
  handleSubmit: () => void;
}

export function ChangePasswordForm({
  currentPw, setCurrentPw,
  newPw, setNewPw,
  confirmPw, setConfirmPw,
  currentError, newError, confirmError,
  focused, visible, isSignedOut, error,
  isValid, formDisabled, isPending,
  setFieldFocused, touch, toggleVisible, handleSubmit,
}: Props) {
  const router = useRouter();

  return (
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

      <ChangePasswordField
        field="current" label="Current Password"
        value={currentPw} onChange={setCurrentPw}
        placeholder="Your current password" fieldError={currentError}
        focused={focused} visible={!!visible.current} isSignedOut={isSignedOut}
        onFocus={() => setFieldFocused('current')}
        onBlur={() => { setFieldFocused(null); touch('current'); }}
        onToggleVisible={() => toggleVisible('current')}
        extraProps={{ autoComplete: 'current-password' }}
      />
      <ChangePasswordField
        field="new" label="New Password"
        value={newPw} onChange={setNewPw}
        placeholder="Create a new password" fieldError={newError}
        focused={focused} visible={!!visible.new} isSignedOut={isSignedOut}
        onFocus={() => setFieldFocused('new')}
        onBlur={() => { setFieldFocused(null); touch('new'); }}
        onToggleVisible={() => toggleVisible('new')}
        extraProps={{ autoComplete: 'new-password', maxLength: 72 }}
      />
      <ChangePasswordField
        field="confirm" label="Confirm New Password"
        value={confirmPw} onChange={setConfirmPw}
        placeholder="Confirm new password" fieldError={confirmError}
        focused={focused} visible={!!visible.confirm} isSignedOut={isSignedOut}
        onFocus={() => setFieldFocused('confirm')}
        onBlur={() => { setFieldFocused(null); touch('confirm'); }}
        onToggleVisible={() => toggleVisible('confirm')}
        extraProps={{ autoComplete: 'new-password', returnKeyType: 'done', onSubmitEditing: handleSubmit }}
      />

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
          <Text style={styles.btnTxt}>{isPending ? 'Updating…' : 'Update Password'}</Text>
        </LinearGradient>
      </Pressable>

      {isSignedOut ? (
        <Pressable
          style={({ pressed }) => [styles.signInBtn, pressed ? styles.submitBtnPressed : null]}
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
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: GRID,
    backgroundColor: C.errorBg, borderWidth: 1, borderColor: C.errorBorder,
    borderRadius: GRID * 1.5, padding: GRID * 1.5, marginBottom: GRID * 2,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: '600', color: C.errorText, lineHeight: 18 },
  submitBtn: {
    borderRadius: 999, overflow: 'hidden',
    shadowColor: C.wine, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 14, elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  submitBtnPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  btnGradient: { minHeight: GRID * 7, paddingVertical: GRID * 1.5, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { fontSize: 16, fontWeight: '600', color: C.white },
  signInBtn: { marginTop: GRID, borderRadius: 999, overflow: 'hidden', shadowColor: C.wine, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 6 },
});
