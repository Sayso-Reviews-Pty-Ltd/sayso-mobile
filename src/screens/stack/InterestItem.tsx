import { memo } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle, type SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ONBOARDING_GRADIENTS, ONBOARDING_TOKENS } from '../../components/onboarding/onboardingTheme';
import { Text } from '../../components/Typography';
import { styles } from './interestsStyles';

export type ItemMutables = {
  opacity: SharedValue<number>;
  y: SharedValue<number>;
  x: SharedValue<number>;
  entryScale: SharedValue<number>;
  selectedScale: SharedValue<number>;
  bounceScale: SharedValue<number>;
  checkScale: SharedValue<number>;
};

export type InterestItemProps = {
  item: { id: string; label: string };
  mutables: ItemMutables;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: () => void;
};

export const InterestItem = memo(function InterestItem({ item, mutables, isSelected, isDisabled, onPress }: InterestItemProps) {
  const wrapStyle = useAnimatedStyle(() => ({
    width: '48.2%',
    opacity: mutables.opacity.value,
    transform: [
      { translateY: mutables.y.value },
      { translateX: mutables.x.value },
      { scale: mutables.entryScale.value },
      { scale: mutables.selectedScale.value },
      { scale: mutables.bounceScale.value },
    ],
  }), []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mutables.checkScale.value }],
    opacity: mutables.checkScale.value,
  }), []);

  return (
    <Animated.View style={wrapStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.circle,
          isDisabled && styles.circleDisabled,
          pressed && !isDisabled && styles.circlePressed,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={isSelected ? ONBOARDING_GRADIENTS.cardPrimary : ONBOARDING_GRADIENTS.cardSecondary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.circleFill, isSelected && styles.circleFillSelected]}
        >
          <Text style={[styles.circleLabel, isSelected && styles.circleLabelSelected]}>
            {item.label}
          </Text>
        </LinearGradient>
      </Pressable>
      {isSelected ? (
        <Animated.View style={[styles.checkBadge, checkStyle]}>
          <Ionicons name="checkmark-circle-outline" size={22} color={ONBOARDING_TOKENS.sage} />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
});
