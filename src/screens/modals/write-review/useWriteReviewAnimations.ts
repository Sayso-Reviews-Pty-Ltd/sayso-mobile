import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const SECTION_DELAYS = [100, 150, 200, 200, 250, 300] as const;

export type WriteReviewAnimations = {
  formOpacity: Animated.Value;
  formTranslateY: Animated.Value;
  sectionAnims: Array<{ opacity: Animated.Value; translateX: Animated.Value }>;
  titleScale: Animated.Value;
  bodyScale: Animated.Value;
  validationOpacity: Animated.Value;
  validationTranslateY: Animated.Value;
  progressAnim: Animated.Value;
  thumbScales: Animated.Value[];
};

export function useWriteReviewAnimations(
  reducedMotion: boolean,
  titleFocused: boolean,
  textFocused: boolean,
  showValidation: boolean,
  charProgress: number,
): WriteReviewAnimations {
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(20)).current;
  const sectionAnims = useRef(
    SECTION_DELAYS.map(() => ({ opacity: new Animated.Value(0), translateX: new Animated.Value(-20) }))
  ).current;
  const titleScale = useRef(new Animated.Value(1)).current;
  const bodyScale = useRef(new Animated.Value(1)).current;
  const validationOpacity = useRef(new Animated.Value(0)).current;
  const validationTranslateY = useRef(new Animated.Value(-4)).current;
  const wasShowingValidation = useRef(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const thumbScales = useRef([0, 1].map(() => new Animated.Value(1))).current;

  // Form entrance
  useEffect(() => {
    if (reducedMotion) {
      formOpacity.setValue(1);
      formTranslateY.setValue(0);
      sectionAnims.forEach((anim) => { anim.opacity.setValue(1); anim.translateX.setValue(0); });
      return;
    }
    Animated.parallel([
      Animated.timing(formOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(formTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    sectionAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(SECTION_DELAYS[index]),
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim.translateX, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start();
    });
  }, [formOpacity, formTranslateY, reducedMotion, sectionAnims]);

  // Title focus scale
  useEffect(() => {
    if (reducedMotion) return;
    Animated.timing(titleScale, { toValue: titleFocused ? 1.01 : 1, duration: 200, useNativeDriver: true }).start();
  }, [reducedMotion, titleFocused, titleScale]);

  // Body focus scale
  useEffect(() => {
    if (reducedMotion) return;
    Animated.timing(bodyScale, { toValue: textFocused ? 1.01 : 1, duration: 200, useNativeDriver: true }).start();
  }, [bodyScale, reducedMotion, textFocused]);

  // Validation hint
  useEffect(() => {
    if (showValidation && !wasShowingValidation.current) {
      wasShowingValidation.current = true;
      if (reducedMotion) { validationOpacity.setValue(1); validationTranslateY.setValue(0); return; }
      validationOpacity.setValue(0);
      validationTranslateY.setValue(-4);
      Animated.parallel([
        Animated.timing(validationOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(validationTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    } else if (!showValidation) {
      wasShowingValidation.current = false;
      validationOpacity.setValue(0);
      validationTranslateY.setValue(-4);
    }
  }, [reducedMotion, showValidation, validationOpacity, validationTranslateY]);

  // Progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: charProgress,
      duration: reducedMotion ? 0 : 300,
      useNativeDriver: false,
    }).start();
  }, [charProgress, progressAnim, reducedMotion]);

  return { formOpacity, formTranslateY, sectionAnims, titleScale, bodyScale, validationOpacity, validationTranslateY, progressAnim, thumbScales };
}
