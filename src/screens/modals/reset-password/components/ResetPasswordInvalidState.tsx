import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../components/Typography';
import { C } from '../constants';
import { styles } from '../ResetPasswordScreen.styles';

type Props = {
  onRequestNewLink: () => void;
  onBackToLogin: () => void;
};

export function ResetPasswordInvalidState({ onRequestNewLink, onBackToLogin }: Props) {
  return (
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
        style={({ pressed }) => [styles.submitBtn, pressed ? styles.submitBtnPressed : null]}
        onPress={onRequestNewLink}
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
      <Pressable style={styles.secondaryBtn} onPress={onBackToLogin}>
        <Text style={styles.secondaryBtnTxt}>Back to Login</Text>
      </Pressable>
    </>
  );
}
