import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from '../hooks/useReducedMotion';

type OverlayKind = 'skeleton' | 'content' | null;

type Props = {
  loading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  durationMs?: number;
  fillContainer?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Crossfades loading skeleton and content without a hard swap.
 *
 * Incoming view stays in flow. Outgoing view is temporarily overlaid and faded
 * out so layout remains stable and transition feels intentional.
 */
export function LoadingCrossfade({
  loading,
  skeleton,
  children,
  durationMs = 180,
  fillContainer = false,
  style,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [overlay, setOverlay] = useState<OverlayKind>(null);
  const [lastLoading, setLastLoading] = useState(loading);

  const incomingOpacity = useSharedValue(1);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (loading === lastLoading) return;

    if (reducedMotion) {
      setOverlay(null);
      setLastLoading(loading);
      incomingOpacity.value = 1;
      overlayOpacity.value = 0;
      return;
    }

    setOverlay(lastLoading ? 'skeleton' : 'content');
    setLastLoading(loading);

    incomingOpacity.value = 0;
    overlayOpacity.value = 1;

    incomingOpacity.value = withTiming(1, { duration: durationMs });
    overlayOpacity.value = withTiming(0, { duration: durationMs }, (finished) => {
      'worklet';
      if (finished) {
        runOnJS(setOverlay)(null);
      }
    });
  }, [
    durationMs,
    incomingOpacity,
    lastLoading,
    loading,
    overlayOpacity,
    reducedMotion,
  ]);

  const incomingStyle = useAnimatedStyle(() => ({
    opacity: incomingOpacity.value,
  }), []);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }), []);

  const incoming = loading ? skeleton : children;
  const overlayNode = overlay === 'skeleton' ? skeleton : overlay === 'content' ? children : null;

  return (
    <View style={[styles.container, fillContainer ? styles.fill : null, style]}>
      <Animated.View style={[fillContainer ? styles.fill : null, incomingStyle]}>
        {incoming}
      </Animated.View>
      {overlayNode ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.overlay, fillContainer ? styles.fill : null, overlayStyle]}
        >
          {overlayNode}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  fill: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
