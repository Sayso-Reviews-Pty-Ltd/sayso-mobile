import { useEffect } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, cancelAnimation } from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { MOTION_VARIANTS, REDUCED_MOTION_DURATION, STAGGER_MAX_DELAY, STAGGER_STEP, type MotionVariant } from './motionTokens';
import { usePageTransitionScope } from './TransitionScope';

type Props = {
  children: React.ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
  variant?: MotionVariant;
  animate?: boolean;
  disableOnVirtualized?: boolean;
};

export function TransitionItem({
  children,
  index = 0,
  style,
  variant = 'card',
  animate = true,
  disableOnVirtualized = false,
}: Props) {
  const reducedMotionEnabled = useReducedMotion();
  const progress = useSharedValue(0);
  const spec = MOTION_VARIANTS[variant];
  const scope = usePageTransitionScope();
  const scopeTick = scope?.scopeTick ?? 0;
  const shouldAnimate = animate && !disableOnVirtualized;

  useEffect(() => {
    if (__DEV__ && !scope) {
      console.warn('[motion] TransitionItem rendered outside TransitionScopeProvider.');
    }
  }, [scope]);

  useEffect(() => {
    scope?.registerItem();
  }, [scope, scopeTick]);

  useEffect(() => {
    if (!shouldAnimate) {
      cancelAnimation(progress);
      progress.value = 1;
      return;
    }

    const delay = reducedMotionEnabled ? 0 : Math.min(spec.baseDelay + index * STAGGER_STEP, STAGGER_MAX_DELAY);

    cancelAnimation(progress);
    progress.value = 0;
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: reducedMotionEnabled ? REDUCED_MOTION_DURATION : spec.duration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [index, progress, reducedMotionEnabled, scopeTick, shouldAnimate, spec.baseDelay, spec.duration]);

  const translateYFrom = reducedMotionEnabled ? 0 : spec.translateY;
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: translateYFrom * (1 - progress.value) }],
  }), [translateYFrom]);

  if (Platform.OS === 'web') {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
