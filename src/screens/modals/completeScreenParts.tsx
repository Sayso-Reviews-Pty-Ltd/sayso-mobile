import { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSequence,
  Easing, interpolate, type SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ONBOARDING_TOKENS } from '../../components/onboarding/onboardingTheme';
import { completeStyles } from './completeScreenStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FALL_DISTANCE = Dimensions.get('window').height + 160;

export type ParticleShape = 'square' | 'circle' | 'rect';

export type DealbreakerIconName =
  | 'shield-checkmark-outline'
  | 'time-outline'
  | 'happy-outline'
  | 'pricetag-outline';

export const DEALBREAKER_ICONS: Record<string, DealbreakerIconName> = {
  trustworthiness: 'shield-checkmark-outline',
  punctuality: 'time-outline',
  friendliness: 'happy-outline',
  'value-for-money': 'pricetag-outline',
};

export const CONFETTI_COLORS = [
  ONBOARDING_TOKENS.coral,
  ONBOARDING_TOKENS.sage,
  ONBOARDING_TOKENS.offWhite,
  '#722F37',
  '#9DAB9B',
  '#F4C842',
  '#E8735A',
  '#A8D5A2',
  '#F9E4B7',
  '#C9A0DC',
  '#FFB347',
  '#87CEEB',
  '#FF6B9D',
  '#B5EAD7',
  '#FFDAC1',
];

export const PARTICLE_SHAPES: ParticleShape[] = ['square', 'circle', 'rect'];
export const PARTICLE_COUNT = 180;
export { SCREEN_WIDTH };

export function Particle({
  delay,
  x,
  color,
  size,
  drift,
  fallDuration,
  shape,
  spinMultiplier,
}: {
  delay: number;
  x: number;
  color: string;
  size: number;
  drift: number;
  fallDuration: number;
  shape: ParticleShape;
  spinMultiplier: number;
}) {
  const y = useSharedValue(-size);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 120 }));

    y.value = withDelay(
      delay,
      withTiming(FALL_DISTANCE, { duration: fallDuration, easing: Easing.linear }, (finished) => {
        'worklet';
        if (finished) {
          opacity.value = withTiming(0, { duration: 180 });
        }
      })
    );

    rotation.value = withDelay(
      delay,
      withTiming(360 * spinMultiplier, { duration: fallDuration, easing: Easing.linear })
    );

    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(drift, { duration: fallDuration * 0.5, easing: Easing.inOut(Easing.sin) }),
        withTiming(-drift * 0.6, { duration: fallDuration * 0.5, easing: Easing.inOut(Easing.sin) })
      )
    );
  }, [delay, drift, fallDuration, opacity, rotation, spinMultiplier, translateX, y]);

  const width = shape === 'rect' ? size * 0.4 : size;
  const height = shape === 'rect' ? size * 1.8 : size;
  const borderRadius = shape === 'circle' ? size / 2 : shape === 'rect' ? 2 : size / 5;

  const particleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: y.value },
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
  }), []);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: x,
          width,
          height,
          borderRadius,
          backgroundColor: color,
        },
        particleStyle,
      ]}
      pointerEvents="none"
    />
  );
}

export function FloatingIcon({ icon, floatValue }: { icon: DealbreakerIconName; floatValue: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatValue.value, [0, 1], [0, -8]) }],
  }), []);

  return (
    <Animated.View style={style}>
      <View style={completeStyles.iconBubble}>
        <Ionicons name={icon} size={22} color={ONBOARDING_TOKENS.sage} />
      </View>
    </Animated.View>
  );
}
