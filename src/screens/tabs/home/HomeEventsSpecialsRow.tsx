import { useRef } from 'react';
import { Animated, FlatList, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { EventSpecialListItemDto } from '@sayso/contracts';
import { EventCard } from '../../../components/EventCard';
import { EventCardSkeleton } from '../../../components/EventCardSkeleton';
import { Text } from '../../../components/Typography';
import { homeTokens } from './HomeTokens';
import { CARD_RADIUS } from '../../../styles/radii';
import { CARD_SHADOW_MD } from '../../../styles/overlayShadow';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

const GAP = 14;
const SKELETONS = [0, 1, 2];
const SCALE_INACTIVE = 0.92;
const OPACITY_INACTIVE = 0.7;
const FLATLIST_PERF = {
  initialNumToRender: 2,
  maxToRenderPerBatch: 2,
  windowSize: 5,
  removeClippedSubviews: Platform.OS === 'android',
} as const;

type AnimatedCardProps = {
  scrollX: Animated.Value;
  index: number;
  snapInterval: number;
  children: React.ReactNode;
};

function AnimatedCard({ scrollX, index, snapInterval, children }: AnimatedCardProps) {
  const inputRange = [
    (index - 1) * snapInterval,
    index * snapInterval,
    (index + 1) * snapInterval,
  ];
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [SCALE_INACTIVE, 1, SCALE_INACTIVE],
    extrapolate: 'clamp',
  });
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [OPACITY_INACTIVE, 1, OPACITY_INACTIVE],
    extrapolate: 'clamp',
  });
  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      {children}
    </Animated.View>
  );
}

type Props = {
  items: EventSpecialListItemDto[];
  loading: boolean;
  error?: string | null;
};

export function HomeEventsSpecialsRow({ items, loading, error }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - homeTokens.pageGutter - GAP - 40;
  const snapInterval = cardWidth + GAP;
  const reducedMotion = useReducedMotion();

  const scrollX = useRef(new Animated.Value(0)).current;
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  if (loading) {
    return (
      <FlatList
        horizontal
        data={SKELETONS}
        keyExtractor={(i) => `event-skeleton-${i}`}
        renderItem={() => (
          <View style={{ width: cardWidth }}>
            <EventCardSkeleton />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        getItemLayout={(_, index) => ({
          length: cardWidth,
          offset: (cardWidth + GAP) * index,
          index,
        })}
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        style={styles.row}
        contentContainerStyle={styles.content}
        {...FLATLIST_PERF}
      />
    );
  }

  if (error || items.length === 0) {
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>Nothing to show here yet.</Text>
        <Text style={styles.messageText}>
          {error ?? 'Events and specials will appear here as new listings go live.'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={items}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      renderItem={({ item, index }) =>
        reducedMotion ? (
          <EventCard item={item} style={{ width: cardWidth }} />
        ) : (
          <AnimatedCard scrollX={scrollX} index={index} snapInterval={snapInterval}>
            <EventCard item={item} style={{ width: cardWidth }} />
          </AnimatedCard>
        )
      }
      ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
      getItemLayout={(_, index) => ({
        length: cardWidth,
        offset: (cardWidth + GAP) * index,
        index,
      })}
      showsHorizontalScrollIndicator={false}
      snapToInterval={snapInterval}
      snapToAlignment="start"
      decelerationRate="fast"
      disableIntervalMomentum
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={styles.row}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    overflow: 'visible',
    backgroundColor: homeTokens.offWhite,
  },
  content: {
    paddingHorizontal: homeTokens.pageGutter,
    paddingTop: 4,
    paddingBottom: 18,
    backgroundColor: homeTokens.offWhite,
  },
  messageCard: {
    marginHorizontal: homeTokens.pageGutter,
    padding: 20,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: homeTokens.borderSoft,
    backgroundColor: homeTokens.cardBg,
    ...CARD_SHADOW_MD,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: homeTokens.charcoal,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: homeTokens.textSecondary,
    marginTop: 6,
  },
});
