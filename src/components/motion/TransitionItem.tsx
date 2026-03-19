import { useEffect } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import {
  MOTION_VARIANTS,
  OPACITY_LEAD_DURATION,
  REDUCED_MOTION_DURATION,
  STAGGER_MAX_DELAY,
  STAGGER_STEP,
  type MotionVariant,
} from './motionTokens';
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
  const spec = MOTION_VARIANTS[variant];
  const scope = usePageTransitionScope();
  const scopeTick = scope?.scopeTick ?? 0;
  const shouldAnimate = animate && !disableOnVirtualized;

  // Three independent shared values rather than a single 0→1 progress scalar.
  //
  // Separating opacity from position matters because:
  //   - Springs can overshoot past their target. A progress value > 1 driving
  //     opacity would be harmless, but using a dedicated timing value is cleaner
  //     and lets opacity lead slightly so the eye catches motion, not appearance.
  //   - translateY and scale are both physical dimensions — the same spring config
  //     drives both, so they settle together and feel coherent.
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(spec.translateY);
  const scale = useSharedValue(spec.scaleFrom);

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
      cancelAnimation(opacity);
      cancelAnimation(translateY);
      cancelAnimation(scale);
      opacity.value = 1;
      translateY.value = 0;
      scale.value = 1;
      return;
    }

    const delay = reducedMotionEnabled
      ? 0
      : Math.min(spec.baseDelay + index * STAGGER_STEP, STAGGER_MAX_DELAY);

    // Always reset to the resting-before-animation state before replaying,
    // so re-entry (e.g. tab switch) always plays the full reveal.
    cancelAnimation(opacity);
    cancelAnimation(translateY);
    cancelAnimation(scale);
    opacity.value = 0;
    translateY.value = spec.translateY;
    scale.value = spec.scaleFrom;

    if (reducedMotionEnabled) {
      // Accessibility path: flat fade + gentle slide, no spring physics.
      opacity.value = withDelay(delay, withTiming(1, { duration: REDUCED_MOTION_DURATION }));
      translateY.value = withDelay(
        delay,
        withTiming(0, { duration: REDUCED_MOTION_DURATION, easing: Easing.out(Easing.quad) }),
      );
      // No scale animation — keep it maximally calm.
      scale.value = 1;
    } else {
      const springConfig = {
        stiffness: spec.stiffness,
        damping: spec.damping,
        mass: spec.mass,
      };

      // Opacity: fast timing that leads the spring. The element fades in while
      // it's still travelling, so the motion reads as purposeful arrival rather
      // than a ghostly fade-and-stop.
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration: OPACITY_LEAD_DURATION, easing: Easing.out(Easing.quad) }),
      );

      // Position: spring physics. The element has inertia — it slightly
      // overshoots zero and settles back, like a physical object being placed.
      translateY.value = withDelay(delay, withSpring(0, springConfig));

      // Scale: same spring so position and size settle together. Only applied
      // to variants where the pop-in reads as intentional (card, cta).
      if (spec.scaleFrom < 1) {
        scale.value = withDelay(delay, withSpring(1, springConfig));
      }
    }
  }, [
    index,
    opacity,
    reducedMotionEnabled,
    scale,
    scopeTick,
    shouldAnimate,
    spec,
    translateY,
  ]);

  // Capture hasScale as a primitive so the worklet closure doesn't need the
  // full spec object, keeping the animated style fast and allocation-free.
  const hasScale = spec.scaleFrom < 1;
  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: opacity.value,
      transform: hasScale
        ? [{ translateY: translateY.value }, { scale: scale.value }]
        : [{ translateY: translateY.value }],
    }),
    [hasScale],
  );

  if (Platform.OS === 'web') {
    return <View style={style}>{children}</View>;
  }

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
