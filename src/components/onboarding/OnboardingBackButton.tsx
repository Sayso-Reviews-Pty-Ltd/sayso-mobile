import { Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ONBOARDING_TOKENS } from './onboardingTheme';
import { styles } from './onboardingLayoutStyles';

type Props = {
  onBack: () => void;
  backOpacity: Animated.Value;
  backY: Animated.Value;
  topInset: number;
};

export function OnboardingBackButton({ onBack, backOpacity, backY, topInset }: Props) {
  return (
    <Animated.View
      style={[
        styles.backWrap,
        { top: topInset + 8 },
        { opacity: backOpacity, transform: [{ translateY: backY }] },
      ]}
    >
      <Pressable style={styles.backBtn} onPress={onBack} hitSlop={12}>
        <Ionicons name="arrow-back-outline" size={22} color={ONBOARDING_TOKENS.white} />
      </Pressable>
    </Animated.View>
  );
}
