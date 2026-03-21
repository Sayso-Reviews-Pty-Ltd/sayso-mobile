import { useCallback, useEffect, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Text } from '../../../../components/Typography';
import { COMMUNITY_BADGE_MARQUEE_ASSETS } from '../../../../lib/communityBadgeMarqueeAssets';
import { styles } from './styles';

export function CommunityBadgeMarquee() {
  const translateX = useSharedValue(0);
  const [trackWidth, setTrackWidth] = useState(0);

  const handleTrackLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width / 2;
    if (nextWidth <= 0) return;
    setTrackWidth((current) => (Math.abs(current - nextWidth) > 1 ? nextWidth : current));
  }, []);

  useEffect(() => {
    if (trackWidth <= 0) return;

    cancelAnimation(translateX);
    translateX.value = 0;
    translateX.value = withRepeat(
      withSequence(
        withTiming(-trackWidth, { duration: 8_000, easing: Easing.linear }),
        withTiming(0, { duration: 0 })
      ),
      -1
    );

    return () => {
      cancelAnimation(translateX);
    };
  }, [trackWidth, translateX]);

  const marqueeStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateX: translateX.value }],
    }),
    []
  );

  return (
    <View style={styles.badgeMarqueeContainer}>
      <View style={styles.badgeMarqueeViewport} accessibilityLabel="Badge previews" pointerEvents="none">
        <Animated.View style={[styles.badgeTrack, marqueeStyle]} onLayout={handleTrackLayout}>
          <View style={styles.badgeTrackGroup}>
            {COMMUNITY_BADGE_MARQUEE_ASSETS.map((badge) => (
              <View key={badge.id} style={styles.badgeChip}>
                <Image source={badge.asset} style={styles.badgeChipIcon} contentFit="contain" />
                <Text style={styles.badgeChipLabel}>{badge.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.badgeTrackGroup}>
            {COMMUNITY_BADGE_MARQUEE_ASSETS.map((badge) => (
              <View key={`${badge.id}-clone`} style={styles.badgeChip}>
                <Image source={badge.asset} style={styles.badgeChipIcon} contentFit="contain" />
                <Text style={styles.badgeChipLabel}>{badge.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
