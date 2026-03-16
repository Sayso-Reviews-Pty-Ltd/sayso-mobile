import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, withDelay, cancelAnimation, Easing, interpolate } from 'react-native-reanimated';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { ReactNode } from 'react';

type Props = {
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
  reducedMotionOverride?: boolean;
  variant?: 'default' | 'soft' | 'strong';
  children?: ReactNode;
};

const PULSE_MIN = 0.74;
const PULSE_MAX = 0.96;

export function SkeletonBlock({
  style,
  animated = true,
  reducedMotionOverride,
  variant = 'default',
  children,
}: Props) {
  const reducedMotionEnabled = useReducedMotion();
  const shouldAnimate = animated && !(reducedMotionOverride ?? reducedMotionEnabled);
  const pulse = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (!shouldAnimate) {
      pulse.value = 0.45;
      shimmer.value = 0;
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 980, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 980, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    shimmer.value = withRepeat(
      withSequence(
        withDelay(160, withTiming(1, { duration: 1400, easing: Easing.linear })),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(pulse);
      cancelAnimation(shimmer);
    };
  }, [pulse, shimmer, shouldAnimate]);

  const fillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [PULSE_MIN, PULSE_MAX]),
  }), []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.3, 0.7, 1], [0, 0.28, 0.28, 0]),
    transform: [
      { translateX: interpolate(shimmer.value, [0, 1], [-140, 260]) },
      { rotate: '18deg' },
    ],
  }), []);

  const variantStyle =
    variant === 'soft'
      ? styles.soft
      : variant === 'strong'
      ? styles.strong
      : styles.default;

  return (
    <View style={[styles.base, variantStyle, style]}>
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.fill, fillStyle]} />
      {shouldAnimate ? (
        <Animated.View pointerEvents="none" style={[styles.shimmer, shimmerStyle]} />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderRadius: 10,
  },
  fill: {
    backgroundColor: 'rgba(229, 224, 229, 0.50)',
  },
  shimmer: {
    position: 'absolute',
    top: -14,
    bottom: -14,
    width: '44%',
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
  },
  default: {
    backgroundColor: 'rgba(45, 45, 45, 0.10)',
  },
  soft: {
    backgroundColor: 'rgba(45, 45, 45, 0.05)',
  },
  strong: {
    backgroundColor: 'rgba(45, 45, 45, 0.18)',
  },
});
