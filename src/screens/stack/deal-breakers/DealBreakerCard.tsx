import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { ONBOARDING_GRADIENTS, ONBOARDING_TOKENS } from '../../../components/onboarding/onboardingTheme';
import { Text } from '../../../components/Typography';
import {
  DEALBREAKER_ICONS,
  DEALBREAKERS,
  type CardMutables,
} from './constants';
import { styles } from './styles';

type Props = {
  item: (typeof DEALBREAKERS)[number];
  mutables: CardMutables;
  isDisabled: boolean;
  onPress: () => void;
};

export const DealBreakerCard = memo(function DealBreakerCard({
  item,
  mutables,
  isDisabled,
  onPress,
}: Props) {
  const wrapStyle = useAnimatedStyle(
    () => ({
      width: '48.5%',
      opacity: mutables.opacity.value,
      transform: [{ translateY: mutables.y.value }, { scale: mutables.selectedScale.value }],
    }),
    []
  );

  const frontFaceStyle = useAnimatedStyle(
    () => ({
      transform: [
        { perspective: 1000 },
        { rotateY: `${interpolate(mutables.flip.value, [0, 180], [0, 180])}deg` },
      ],
    }),
    []
  );

  const backFaceStyle = useAnimatedStyle(
    () => ({
      transform: [
        { perspective: 1000 },
        { rotateY: `${interpolate(mutables.flip.value, [0, 180], [180, 360])}deg` },
      ],
    }),
    []
  );

  return (
    <Animated.View style={wrapStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isDisabled && styles.cardDisabled,
          pressed && !isDisabled && styles.cardPressed,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <View style={styles.flipCard}>
          <Animated.View style={[styles.cardFace, frontFaceStyle]}>
            <LinearGradient
              colors={
                isDisabled
                  ? ['rgba(45,45,45,0.05)', 'rgba(45,45,45,0.03)']
                  : ['rgba(157,171,155,0.10)', 'rgba(157,171,155,0.05)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.cardFaceFill, isDisabled && styles.cardFaceFillDisabled]}
            >
              <View style={[styles.cardIconWrap, isDisabled && styles.cardIconWrapDisabled]}>
                <Ionicons
                  name={DEALBREAKER_ICONS[item.id]}
                  size={24}
                  color={isDisabled ? 'rgba(45,45,45,0.45)' : ONBOARDING_TOKENS.sage}
                />
              </View>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text numberOfLines={2} style={styles.cardDescription}>
                {item.description}
              </Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.cardFace, backFaceStyle]}>
            <LinearGradient
              colors={ONBOARDING_GRADIENTS.cardPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardFaceFill}
            >
              <View style={styles.selectedIconWrap}>
                <Ionicons
                  name={DEALBREAKER_ICONS[item.id]}
                  size={28}
                  color={ONBOARDING_TOKENS.white}
                />
              </View>
              <View style={styles.selectedCheck}>
                <Ionicons name="checkmark-circle-outline" size={15} color={ONBOARDING_TOKENS.coral} />
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
});
