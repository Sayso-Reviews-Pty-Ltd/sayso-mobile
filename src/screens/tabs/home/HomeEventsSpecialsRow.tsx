import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import type { EventSpecialListItemDto } from '@sayso/contracts';
import { EventCard } from '../../../components/EventCard';
import { EventCardSkeleton } from '../../../components/EventCardSkeleton';
import { Text } from '../../../components/Typography';
import { homeTokens } from './HomeTokens';
import { CARD_RADIUS } from '../../../styles/radii';
import { CARD_SHADOW_MD } from '../../../styles/overlayShadow';

type Props = {
  items: EventSpecialListItemDto[];
  loading: boolean;
  error?: string | null;
};

export function HomeEventsSpecialsRow({ items, loading, error }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - homeTokens.pageGutter - 14 - 40;
  const snapInterval = cardWidth + 14;

  if (loading) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        style={styles.row}
        contentContainerStyle={styles.content}
      >
        {[1, 2, 3].map((item) => (
          <View key={`event-skeleton-${item}`} style={[styles.cardWrap, { width: cardWidth }]}>
            <EventCardSkeleton />
          </View>
        ))}
      </ScrollView>
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.content}
    >
      {items.map((item) => (
        <EventCard key={`${item.type}-${item.id}`} item={item} style={[styles.cardWrap, { width: cardWidth }]} />
      ))}
    </ScrollView>
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
    gap: 14,
    backgroundColor: homeTokens.offWhite,
  },
  cardWrap: {
    width: 340,
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
