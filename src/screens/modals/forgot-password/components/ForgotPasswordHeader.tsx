import { Animated, StyleSheet, View } from 'react-native';
import { Text } from '../../../../components/Typography';
import { C, GRID } from '../constants';

type Props = {
  emailSent: boolean;
  email: string;
  opacity: Animated.Value;
  translateY: Animated.Value;
};

export function ForgotPasswordHeader({ emailSent, email, opacity, translateY }: Props) {
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>
          {emailSent ? 'Check Your Inbox' : 'Reset Password'}
        </Text>
        <Text style={styles.subtitle}>
          {emailSent
            ? `We've sent a reset link to ${email}`
            : "Enter your email and we'll send you a link to reset your password."}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
});
