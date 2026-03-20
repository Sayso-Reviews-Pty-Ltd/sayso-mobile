import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { C, WRITING_PROMPTS } from '../constants';

type Props = {
  promptIndex: number;
  reducedMotion: boolean;
};

export function AnimatedTip({ promptIndex, reducedMotion }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [visibleIndex, setVisibleIndex] = useState(promptIndex);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (reducedMotion) {
      setVisibleIndex(promptIndex);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -8, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setVisibleIndex(promptIndex);
      translateY.setValue(8);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }, [opacity, promptIndex, reducedMotion, translateY]);

  return (
    <Animated.View style={[styles.tipOverlay, { opacity, transform: [{ translateY }] }]} pointerEvents="none">
      <Ionicons name="bulb-outline" size={14} color={C.coral} style={{ opacity: 0.6 }} />
      <Text style={styles.tipText}>Tip: {WRITING_PROMPTS[visibleIndex]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tipOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipText: {
    fontSize: 13,
    color: C.charcoal60,
    flexShrink: 1,
  },
});
