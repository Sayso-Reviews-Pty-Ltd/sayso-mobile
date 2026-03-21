import { memo } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ONBOARDING_GRADIENTS, ONBOARDING_TOKENS } from '../../../components/onboarding/onboardingTheme';
import { Text } from '../../../components/Typography';
import { styles } from './styles';
import type { PillMutables, Subcategory } from './types';

type Props = {
  item: Subcategory;
  mutables: PillMutables;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: () => void;
};

export const PillItem = memo(function PillItem({ item, mutables, isSelected, isDisabled, onPress }: Props) {
  const wrapStyle = useAnimatedStyle(
    () => ({
      opacity: mutables.opacity.value,
      transform: [
        { translateX: mutables.x.value },
        { translateY: mutables.y.value },
        { scale: mutables.entryScale.value },
        { scale: mutables.selectedScale.value },
        { scale: mutables.tapScale.value },
      ],
    }),
    [mutables]
  );

  const checkStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: mutables.checkScale.value }],
      opacity: mutables.checkScale.value,
    }),
    [mutables]
  );

  return (
    <Animated.View style={wrapStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.pill,
          isDisabled && styles.pillDisabled,
          pressed && !isDisabled && styles.pillPressed,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={
            isSelected
              ? ONBOARDING_GRADIENTS.cardPrimary
              : ['rgba(157,171,155,0.10)', 'rgba(157,171,155,0.05)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.pillFill, isSelected && styles.pillSelected]}
        >
          <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{item.label}</Text>
          {isSelected ? (
            <Animated.View style={checkStyle}>
              <Ionicons name="checkmark-circle-outline" size={14} color={ONBOARDING_TOKENS.white} />
            </Animated.View>
          ) : null}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
});
