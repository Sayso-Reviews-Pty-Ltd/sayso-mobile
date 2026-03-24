import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../components/Typography';

const GRID = 8;
const C = {
  wine: '#722F37',
  sage: '#7D9B76',
  white: '#FFFFFF',
  errorText: '#722F37',
  errorBg: 'rgba(229,224,229,0.95)',
  errorBorder: 'rgba(114,47,55,0.35)',
};

interface Props {
  newEmail: string;
  resendCooldown: number;
  isResendPending: boolean;
  error: string;
  onResend: () => void;
  onCancel: () => void;
}

export function ChangeEmailPendingState({
  newEmail,
  resendCooldown,
  isResendPending,
  error,
  onResend,
  onCancel,
}: Props) {
  const canResend = resendCooldown === 0 && !isResendPending;
  const resendLabel =
    isResendPending ? 'Resending…' :
    resendCooldown > 0 ? `Resend in ${resendCooldown}s` :
    'Resend Email';

  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Ionicons name="mail-outline" size={36} color={C.sage} />
      </View>

      <Text style={styles.heading}>Check your inbox</Text>
      <Text style={styles.msg}>
        {'We sent a verification link to '}
        <Text style={styles.emailHighlight}>{newEmail}</Text>
        {'. Your email will update once you confirm the link.'}
      </Text>

      {!!error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={14} color={C.errorText} />
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            {error}
          </Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.resendBtn,
          !canResend && styles.resendBtnDisabled,
          pressed && canResend && styles.resendBtnPressed,
        ]}
        onPress={onResend}
        disabled={!canResend}
        accessibilityRole="button"
        accessibilityLabel={
          resendCooldown > 0
            ? `Resend available in ${resendCooldown} seconds`
            : 'Resend verification email'
        }
        accessibilityState={{ disabled: !canResend }}
      >
        <LinearGradient
          colors={[C.wine, 'rgba(114,47,55,0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btnGradient}
        >
          <Text style={styles.btnTxt}>{resendLabel}</Text>
        </LinearGradient>
      </Pressable>

      <Pressable
        style={styles.cancelBtn}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancel email change and return to form"
      >
        <Text style={styles.cancelTxt}>Cancel and use a different email</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: GRID * 2 },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: 'rgba(125,155,118,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
  },
  msg: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '400',
    paddingHorizontal: GRID,
  },
  emailHighlight: { fontWeight: '700', color: 'rgba(255,255,255,0.95)' },
  errorBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: GRID,
    backgroundColor: C.errorBg,
    borderWidth: 1,
    borderColor: C.errorBorder,
    borderRadius: GRID * 1.5,
    padding: GRID * 1.5,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: '600', color: C.errorText, lineHeight: 18 },
  resendBtn: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: C.wine,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  resendBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  resendBtnPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  btnGradient: {
    minHeight: GRID * 7,
    paddingVertical: GRID * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { fontSize: 16, fontWeight: '600', color: C.white },
  cancelBtn: { paddingVertical: GRID * 0.5 },
  cancelTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'underline',
  },
});
