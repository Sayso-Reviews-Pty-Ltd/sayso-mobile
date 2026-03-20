import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../components/Typography';
import { C } from '../constants';
import { styles } from '../ResetPasswordScreen.styles';
import type { InvalidReason } from '../types';

const INVALID_LINK_MESSAGE =
  'Your password reset link may have expired or already been used. Request a fresh link to continue.';

type Props = {
  invalidReason: InvalidReason;
  message?: string;
  onRequestNewLink: () => void;
  onBackToLogin: () => void;
};

export function ResetPasswordInvalidState({
  invalidReason,
  message,
  onRequestNewLink,
  onBackToLogin,
}: Props) {
  const isAlreadyUsed = invalidReason === 'already-used';
  const bodyMessage = isAlreadyUsed && message ? message : INVALID_LINK_MESSAGE;
  const primaryLabel = isAlreadyUsed ? 'Sign in' : 'Request New Link';
  const primaryAction = isAlreadyUsed ? onBackToLogin : onRequestNewLink;
  const secondaryLabel = isAlreadyUsed ? 'Resend reset link' : 'Back to Login';
  const secondaryAction = isAlreadyUsed ? onRequestNewLink : onBackToLogin;

  return (
    <>
      <View style={styles.stateIconWrap}>
        <View style={[styles.stateCircle, styles.stateCircleWarning]}>
          <Ionicons name="close-outline" size={32} color="#F59E0B" />
        </View>
      </View>
      <Text style={styles.stateMessage}>
        {bodyMessage}
      </Text>
      <Pressable
        style={({ pressed }) => [styles.submitBtn, pressed ? styles.submitBtnPressed : null]}
        onPress={primaryAction}
      >
        <LinearGradient
          colors={[C.wine, 'rgba(114,47,55,0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitBtnGradient}
        >
          <Text style={styles.submitTxt}>{primaryLabel}</Text>
        </LinearGradient>
      </Pressable>
      <Pressable style={styles.secondaryBtn} onPress={secondaryAction}>
        <Text style={styles.secondaryBtnTxt}>{secondaryLabel}</Text>
      </Pressable>
    </>
  );
}
