import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.image} />
      <View style={styles.body}>
        <View style={styles.titleLine} />
        <View style={styles.subtitleLine} />
        <View style={styles.ratingLine} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
  },
  body: {
    padding: 12,
  },
  titleLine: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E5E7EB',
    width: '70%',
  },
  subtitleLine: {
    height: 11,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    width: '50%',
    marginTop: 8,
  },
  ratingLine: {
    height: 11,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    width: '30%',
    marginTop: 8,
  },
});
