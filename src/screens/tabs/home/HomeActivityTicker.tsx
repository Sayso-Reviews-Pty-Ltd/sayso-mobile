import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { homeTokens } from './HomeTokens';
import { NAVBAR_BG_COLOR } from '../../../styles/colors';
import { CARD_RADIUS } from '../../../styles/radii';

type ReviewItem = {
  reviewer?: { name?: string };
  businessName?: string;
  rating?: number;
};

type Props = {
  reviews: ReviewItem[];
  loading: boolean;
};

function PulseDot() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.5, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver, isInteraction: false }),
          Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver, isInteraction: false }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 700, easing: Easing.in(Easing.ease), useNativeDriver, isInteraction: false }),
          Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver, isInteraction: false }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale, opacity]);

  return (
    <Animated.View style={[styles.liveDot, { transform: [{ scale }], opacity }]} />
  );
}

function StarRow({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <View style={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <Ionicons
          key={i}
          name="star"
          size={8}
          color={i < filled ? '#F5C842' : 'rgba(255,255,255,0.25)'}
        />
      ))}
    </View>
  );
}

export function HomeActivityTicker({ reviews, loading }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  const handleTrackLayout = useCallback((e: LayoutChangeEvent) => {
    const next = e.nativeEvent.layout.width / 2;
    if (next <= 0) return;
    setTrackWidth((cur) => (Math.abs(cur - next) > 1 ? next : cur));
  }, []);

  useEffect(() => {
    if (trackWidth <= 0) return;
    loopRef.current?.stop();
    translateX.stopAnimation(() => {
      translateX.setValue(0);
      const useNativeDriver = Platform.OS !== 'web';
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: -trackWidth,
            duration: 18_000,
            easing: Easing.linear,
            useNativeDriver,
            isInteraction: false,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 0,
            useNativeDriver,
            isInteraction: false,
          }),
        ])
      );
      loopRef.current = loop;
      loop.start();
    });
    return () => { loopRef.current?.stop(); };
  }, [trackWidth, translateX]);

  if (loading || reviews.length === 0) return null;

  const items = reviews.filter((r) => r.reviewer?.name && r.businessName);
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {/* Left — Live badge */}
      <LinearGradient
        colors={[NAVBAR_BG_COLOR, homeTokens.coralDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.liveTag}
      >
        <PulseDot />
        <Text style={styles.liveText}>LIVE</Text>
      </LinearGradient>

      {/* Scrolling ticker */}
      <View style={styles.tickerArea} pointerEvents="none">
        <Animated.View
          style={[styles.track, { transform: [{ translateX }] }]}
          onLayout={handleTrackLayout}
        >
          {[items, items].map((group, gi) => (
            <View key={gi} style={styles.group}>
              {group.map((r, i) => (
                <View key={`${gi}-${i}`} style={styles.item}>
                  {r.rating != null && <StarRow rating={r.rating} />}
                  <Text style={styles.itemText} numberOfLines={1}>
                    <Text style={styles.nameText}>{r.reviewer!.name}</Text>
                    <Text style={styles.verbText}>{' reviewed '}</Text>
                    <Text style={styles.businessText}>{r.businessName}</Text>
                  </Text>
                  <View style={styles.dot} />
                </View>
              ))}
            </View>
          ))}
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: homeTokens.pageGutter,
    marginTop: 12,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: homeTokens.borderSoft,
    overflow: 'hidden',
    height: 44,
    backgroundColor: homeTokens.white,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: homeTokens.white,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: homeTokens.white,
    letterSpacing: 1,
  },
  tickerArea: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  itemText: {
    fontSize: 12,
    color: homeTokens.textSecondary,
  },
  nameText: {
    fontSize: 12,
    fontWeight: '700',
    color: homeTokens.charcoal,
  },
  verbText: {
    fontSize: 12,
    color: homeTokens.textSecondary,
  },
  businessText: {
    fontSize: 12,
    fontWeight: '600',
    color: homeTokens.charcoal,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: homeTokens.borderSoft,
    marginLeft: 4,
  },
});
