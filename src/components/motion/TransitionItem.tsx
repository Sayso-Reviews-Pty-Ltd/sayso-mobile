import { useEffect } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
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
  EXIT_OPACITY_DURATION,
  getEnterDelay,
  getExitDelay,
  getMotionPhaseTargets,
  MOTION_ROLES,
  type MotionPhase,
  OPACITY_LEAD_DURATION,
  REDUCED_MOTION_DURATION,
  resolveMotionRole,
  type MotionRole,
  type MotionVariant,
} from './motionTokens';
import { usePageTransitionScope } from './TransitionScope';

type Props = {
  children: React.ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
  variant?: MotionVariant;
  role?: MotionRole;
  animate?: boolean;
  disableOnVirtualized?: boolean;
};

export function TransitionItem({
  children,
  index = 0,
  style,
  variant = 'support',
  role,
  animate = true,
  disableOnVirtualized = false,
}: Props) {
  const isFocused = useIsFocused();
  const reducedMotionEnabled = useReducedMotion();
  const motionRole = resolveMotionRole(role ?? variant);
  const spec = MOTION_ROLES[motionRole];
  const scope = usePageTransitionScope();
  const scopeTick = scope?.scopeTick ?? 0;
  const phase = (scope?.phase ?? (isFocused ? 'enter' : 'exit')) as MotionPhase;
  const maxIndex = scope?.maxIndex ?? index;
  const shouldAnimate = animate && !disableOnVirtualized;
  const initialTargets = getMotionPhaseTargets(motionRole, phase, reducedMotionEnabled);

  // Three independent shared values rather than a single 0→1 progress scalar.
  //
  // Separating opacity from position matters because:
  //   - Springs can overshoot past their target. A progress value > 1 driving
  //     opacity would be harmless, but using a dedicated timing value is cleaner
  //     and lets opacity lead slightly so the eye catches motion, not appearance.
  //   - translateY and scale are both physical dimensions — the same spring config
  //     drives both, so they settle together and feel coherent.
  const opacity = useSharedValue(shouldAnimate ? initialTargets.opacityFrom : 1);
  const translateY = useSharedValue(shouldAnimate ? initialTargets.translateYFrom : 0);
  const scale = useSharedValue(shouldAnimate ? initialTargets.scaleFrom : 1);

  useEffect(() => {
    if (__DEV__ && !scope) {
      console.warn('[motion] TransitionItem rendered outside TransitionScopeProvider.');
    }
  }, [scope]);

  useEffect(() => {
    scope?.registerItem(index);
  }, [index, scope, scopeTick]);

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
      : phase === 'enter'
      ? getEnterDelay(motionRole, index)
      : getExitDelay(motionRole, index, maxIndex);

    cancelAnimation(opacity);
    cancelAnimation(translateY);
    cancelAnimation(scale);

    const targets = getMotionPhaseTargets(motionRole, phase, reducedMotionEnabled);

    opacity.value = targets.opacityFrom;
    translateY.value = targets.translateYFrom;
    scale.value = targets.scaleFrom;

    if (reducedMotionEnabled) {
      opacity.value = withDelay(
        delay,
        withTiming(targets.opacityTo, { duration: REDUCED_MOTION_DURATION }),
      );
    } else {
      const springConfig = {
        stiffness: spec.stiffness,
        damping: spec.damping,
        mass: spec.mass,
      };

      if (phase === 'enter') {
        opacity.value = withDelay(
          delay,
          withTiming(1, { duration: OPACITY_LEAD_DURATION, easing: Easing.out(Easing.quad) }),
        );
        translateY.value = withDelay(delay, withSpring(targets.translateYTo, springConfig));
        if (spec.scaleFrom < 1) {
          scale.value = withDelay(delay, withSpring(targets.scaleTo, springConfig));
        } else {
          scale.value = 1;
        }
      } else {
        opacity.value = withDelay(
          delay,
          withTiming(0, { duration: EXIT_OPACITY_DURATION, easing: Easing.out(Easing.quad) }),
        );
        translateY.value = withDelay(delay, withSpring(targets.translateYTo, springConfig));
        if (spec.scaleFrom < 1) {
          scale.value = withDelay(delay, withSpring(targets.scaleTo, springConfig));
        } else {
          scale.value = 1;
        }
      }
    }
  }, [
    phase,
    index,
    maxIndex,
    motionRole,
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
