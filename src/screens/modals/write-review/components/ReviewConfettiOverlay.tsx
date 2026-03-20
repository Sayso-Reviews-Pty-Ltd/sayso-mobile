import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import {
  C,
  CONFETTI_COLORS,
  CONFETTI_FALL_DISTANCE,
  CONFETTI_PARTICLE_COUNT,
  SCREEN_WIDTH,
} from '../constants';
import { ConfettiPiece } from '../types';

function ConfettiPieceView({ piece }: { piece: ConfettiPiece }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(piece.delay),
      Animated.timing(progress, {
        toValue: 1,
        duration: piece.duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();

    return () => {
      animation.stop();
      progress.stopAnimation();
    };
  }, [piece.delay, piece.duration, progress]);

  const width = piece.shape === 'rect' ? Math.max(2, Math.round(piece.size * 0.42)) : piece.size;
  const height = piece.shape === 'rect' ? Math.round(piece.size * 1.8) : piece.size;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.confettiPiece,
        {
          left: piece.left,
          width,
          height,
          borderRadius: piece.shape === 'circle' ? piece.size / 2 : 2,
          backgroundColor: piece.color,
          opacity: progress.interpolate({
            inputRange: [0, 0.08, 0.9, 1],
            outputRange: [0, 1, 1, 0],
          }),
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-24, CONFETTI_FALL_DISTANCE],
              }),
            },
            {
              translateX: progress.interpolate({
                inputRange: [0, 0.3, 0.7, 1],
                outputRange: [0, piece.drift * 0.4, piece.drift * 0.75, piece.drift],
              }),
            },
            {
              rotate: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', `${piece.rotate}deg`],
              }),
            },
          ],
        },
      ]}
    />
  );
}

export function ReviewConfettiOverlay({ visible }: { visible: boolean }) {
  const pieces = useMemo<ConfettiPiece[]>(
    () =>
      Array.from({ length: CONFETTI_PARTICLE_COUNT }, (_, index) => ({
        key: index,
        left: Math.random() * SCREEN_WIDTH,
        delay: Math.random() * 600,
        duration: 1000 + Math.random() * 900,
        drift: (Math.random() - 0.5) * 180,
        size: 5 + Math.round(Math.random() * 10),
        rotate: 220 + Math.round(Math.random() * 360),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        shape: (['square', 'circle', 'rect'] as const)[Math.floor(Math.random() * 3)],
      })),
    [visible]
  );

  if (!visible) return null;

  return (
    <View style={styles.confettiOverlay} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPieceView key={piece.key} piece={piece} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  confettiOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 60,
    overflow: 'hidden',
  },
  confettiPiece: {
    position: 'absolute',
    top: -20,
    backgroundColor: C.white,
  },
});
