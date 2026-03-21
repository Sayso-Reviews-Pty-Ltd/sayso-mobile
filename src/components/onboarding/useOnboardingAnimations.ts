import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export type OnboardingAnimations = {
  titleOpacity: Animated.Value;
  titleY: Animated.Value;
  subtitleOpacity: Animated.Value;
  subtitleY: Animated.Value;
  actionOpacity: Animated.Value;
  actionY: Animated.Value;
  progressScaleX: Animated.Value;
  activeDotScale: Animated.Value;
  backOpacity: Animated.Value;
  backY: Animated.Value;
};

export function useOnboardingAnimations(
  reducedMotion: boolean,
  step: number,
  hasBack: boolean,
): OnboardingAnimations {
  const progressEase = useRef(Easing.bezier(0.4, 0, 0.2, 1)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(10)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(10)).current;
  const actionOpacity = useRef(new Animated.Value(0)).current;
  const actionY = useRef(new Animated.Value(16)).current;
  const progressScaleX = useRef(new Animated.Value(0)).current;
  const activeDotScale = useRef(new Animated.Value(1)).current;
  const backOpacity = useRef(new Animated.Value(0)).current;
  const backY = useRef(new Animated.Value(30)).current;

  // Entrance animations for title, subtitle, action
  useEffect(() => {
    if (reducedMotion) {
      titleOpacity.setValue(1);
      titleY.setValue(0);
      subtitleOpacity.setValue(1);
      subtitleY.setValue(0);
      actionOpacity.setValue(1);
      actionY.setValue(0);
      return;
    }

    const ease = Easing.out(Easing.cubic);
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, delay: 50, duration: 400, useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, delay: 50, duration: 400, easing: ease, useNativeDriver: true }),
    ]).start();
    Animated.parallel([
      Animated.timing(subtitleOpacity, { toValue: 1, delay: 110, duration: 400, useNativeDriver: true }),
      Animated.timing(subtitleY, { toValue: 0, delay: 110, duration: 400, easing: ease, useNativeDriver: true }),
    ]).start();
    Animated.parallel([
      Animated.timing(actionOpacity, { toValue: 1, delay: 180, duration: 320, useNativeDriver: true }),
      Animated.timing(actionY, { toValue: 0, delay: 180, duration: 320, easing: ease, useNativeDriver: true }),
    ]).start();
  }, [actionOpacity, actionY, reducedMotion, subtitleOpacity, subtitleY, titleOpacity, titleY]);

  // Progress bar animation
  useEffect(() => {
    if (reducedMotion) {
      progressScaleX.setValue(1);
      return;
    }
    progressScaleX.setValue(0);
    Animated.timing(progressScaleX, {
      toValue: 1,
      duration: 800,
      easing: progressEase,
      useNativeDriver: true,
    }).start();
  }, [progressEase, progressScaleX, reducedMotion, step]);

  // Active dot pulse
  useEffect(() => {
    if (reducedMotion) {
      activeDotScale.setValue(1);
      return;
    }
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(activeDotScale, { toValue: 1.1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(activeDotScale, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulseLoop.start();
    return () => {
      pulseLoop.stop();
      activeDotScale.setValue(1);
    };
  }, [activeDotScale, reducedMotion]);

  // Back button entrance
  useEffect(() => {
    if (!hasBack) return;
    if (reducedMotion) {
      backOpacity.setValue(1);
      backY.setValue(0);
      return;
    }
    backOpacity.setValue(0);
    backY.setValue(30);
    Animated.parallel([
      Animated.timing(backOpacity, { toValue: 1, delay: 100, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(backY, { toValue: 0, delay: 100, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [backOpacity, backY, hasBack, reducedMotion]);

  return { titleOpacity, titleY, subtitleOpacity, subtitleY, actionOpacity, actionY, progressScaleX, activeDotScale, backOpacity, backY };
}
