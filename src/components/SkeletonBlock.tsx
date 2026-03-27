import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  cancelAnimation,
  Easing,
  interpolate,
} from 'react-native-reanimated';
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
export const SKELETON_SHIMMER_WIDTH_PERCENT = 240;
export const SKELETON_SHIMMER_DURATION_MS = 2000;
export const SKELETON_SHIMMER_TRANSLATE_START = -420;
export const SKELETON_SHIMMER_TRANSLATE_END = 420;

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
        withTiming(0, { duration: 980, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    shimmer.value = withRepeat(
      withSequence(
        withDelay(
          220,
          withTiming(1, { duration: SKELETON_SHIMMER_DURATION_MS, easing: Easing.linear }),
        ),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(pulse);
      cancelAnimation(shimmer);
    };
  }, [pulse, shimmer, shouldAnimate]);

  const fillStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(pulse.value, [0, 1], [PULSE_MIN, PULSE_MAX]),
    }),
    [],
  );

  const shimmerStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(shimmer.value, [0, 0.3, 0.7, 1], [0, 0.28, 0.28, 0]),
      transform: [
        {
          translateX: interpolate(
            shimmer.value,
            [0, 1],
            [SKELETON_SHIMMER_TRANSLATE_START, SKELETON_SHIMMER_TRANSLATE_END],
          ),
        },
        { rotate: '14deg' },
      ],
    }),
    [],
  );

  const variantStyle =
    variant === 'soft' ? styles.soft : variant === 'strong' ? styles.strong : styles.default;

  return (
    <View
      style={[styles.base, variantStyle, style]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
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
    top: -18,
    bottom: -18,
    width: `${SKELETON_SHIMMER_WIDTH_PERCENT}%`,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
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
