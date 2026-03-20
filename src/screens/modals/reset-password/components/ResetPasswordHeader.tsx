import { Animated, View } from 'react-native';
import { Text } from '../../../../components/Typography';
import { styles } from '../ResetPasswordScreen.styles';
import type { ScreenState } from '../types';

type Props = {
  screenState: ScreenState;
  opacity: Animated.Value;
  translateY: Animated.Value;
};

function getTitle(state: ScreenState): string {
  if (state === 'invalid') return 'Link Expired';
  if (state === 'success') return 'Password Updated';
  return 'New Password';
}

function getSubtitle(state: ScreenState): string {
  if (state === 'invalid') return 'This reset link is no longer valid. Please request a new one.';
  if (state === 'success') return 'Your password has been updated. Redirecting you to home.';
  return 'Enter a new password for your account.';
}

export function ResetPasswordHeader({ screenState, opacity, translateY }: Props) {
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{getTitle(screenState)}</Text>
        <Text style={styles.subtitle}>{getSubtitle(screenState)}</Text>
      </View>
    </Animated.View>
  );
}
