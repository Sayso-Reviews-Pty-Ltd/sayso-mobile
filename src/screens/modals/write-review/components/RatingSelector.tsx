import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../components/Typography';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { C, RATING_LABELS, STAR_GRADIENT } from '../constants';

function GradientStar({ filled, size = 42 }: { filled: boolean; size?: number }) {
  if (!filled) {
    return <Ionicons name="star-outline" size={size} color={C.charcoal30} />;
  }
  return (
    <LinearGradient
      colors={STAR_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientStar}
    >
      <Ionicons name="star" size={Math.round(size * 0.72)} color="#fff" />
    </LinearGradient>
  );
}

type Props = {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
};

export function RatingSelector({ value, onChange, disabled }: Props) {
  const reducedMotion = useReducedMotion();

  const labelOpacity = useRef(new Animated.Value(1)).current;
  const labelTranslateY = useRef(new Animated.Value(0)).current;
  const labelScale = useRef(new Animated.Value(1)).current;
  const [visibleRating, setVisibleRating] = useState(value);
  const isFirstRating = useRef(true);

  useEffect(() => {
    if (isFirstRating.current) {
      isFirstRating.current = false;
      setVisibleRating(value);
      return;
    }
    if (reducedMotion) {
      setVisibleRating(value);
      return;
    }
    Animated.parallel([
      Animated.timing(labelOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(labelTranslateY, { toValue: 8, duration: 100, useNativeDriver: true }),
      Animated.timing(labelScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setVisibleRating(value);
      labelTranslateY.setValue(-8);
      Animated.parallel([
        Animated.timing(labelOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(labelTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(labelScale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }, [labelOpacity, labelScale, labelTranslateY, reducedMotion, value]);

  const starScales = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(1))).current;
  const starRotates = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;

  const handleStarPress = (i: number) => {
    if (disabled) return;
    onChange(i);
    if (!reducedMotion) {
      Animated.sequence([
        Animated.timing(starRotates[i - 1], { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(starRotates[i - 1], { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(starRotates[i - 1], { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  };

  const label = visibleRating > 0 ? RATING_LABELS[visibleRating] : null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>How was your experience?</Text>
      <Animated.View style={[styles.labelSlot, { opacity: labelOpacity, transform: [{ translateY: labelTranslateY }, { scale: labelScale }] }]}>
        {label ? (
          <View style={styles.labelPill}>
            <Text style={styles.labelText}>{label}</Text>
          </View>
        ) : (
          <Text style={styles.tapHint}>Tap a star to rate</Text>
        )}
      </Animated.View>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Animated.View
            key={i}
            style={{
              transform: [
                { scale: starScales[i - 1] },
                {
                  rotate: starRotates[i - 1].interpolate({
                    inputRange: [-10, 0, 10],
                    outputRange: ['-10deg', '0deg', '10deg'],
                  }),
                },
              ],
            }}
          >
            <Pressable
              onPress={() => handleStarPress(i)}
              onPressIn={() =>
                !reducedMotion &&
                Animated.timing(starScales[i - 1], { toValue: 0.9, duration: 80, useNativeDriver: true }).start()
              }
              onPressOut={() =>
                !reducedMotion &&
                Animated.timing(starScales[i - 1], { toValue: 1, duration: 120, useNativeDriver: true }).start()
              }
              style={styles.starBtn}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${i} star${i !== 1 ? 's' : ''}`}
            >
              <GradientStar filled={i <= value} size={42} />
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10, paddingVertical: 4 },
  heading: { fontSize: 16, fontWeight: '600', color: C.charcoal },
  tapHint: { fontSize: 14, color: C.charcoal60 },
  labelPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, backgroundColor: C.charcoal10 },
  labelText: { fontSize: 16, fontWeight: '700', color: C.charcoal },
  labelSlot: { minHeight: 30, alignItems: 'center', justifyContent: 'center' },
  starsRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  starBtn: { padding: 6 },
  gradientStar: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
