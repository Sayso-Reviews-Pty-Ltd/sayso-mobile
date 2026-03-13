import { ScrollView, StyleSheet, View } from 'react-native';
import type { EventSpecialListItemDto } from '@sayso/contracts';
import { EventCard } from '../EventCard';
import { EventCardSkeleton } from '../EventCardSkeleton';
import { Text } from '../Typography';
import { businessDetailColors, businessDetailSpacing } from '../business-detail/styles';

type Props = {
  title?: string;
  items: EventSpecialListItemDto[];
  isLoading?: boolean;
  error?: string | null;
};

export function EventSpecialRelatedSection({
  title = 'More Near You',
  items,
  isLoading = false,
  error,
}: Props) {
  if (!isLoading && !error && items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>

      {isLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowContent}>
          {[1, 2].map((item) => (
            <View key={`related-skeleton-${item}`} style={styles.cardWrap}>
              <EventCardSkeleton />
            </View>
          ))}
        </ScrollView>
      ) : error ? (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Could not load related listings.</Text>
          <Text style={styles.messageText}>{error}</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowContent}>
          {items.map((item) => (
            <EventCard key={`${item.type}-${item.id}`} item={item} style={styles.cardWrap} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: businessDetailSpacing.pageGutter,
    gap: 10,
  },
  heading: {
    color: businessDetailColors.charcoal,
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  rowContent: {
    paddingBottom: 2,
    gap: 12,
  },
  cardWrap: {
    width: 318,
  },
  messageCard: {
    borderRadius: businessDetailSpacing.cardRadius,
    backgroundColor: businessDetailColors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  messageTitle: {
    color: businessDetailColors.charcoal,
    fontSize: 16,
    fontWeight: '700',
  },
  messageText: {
    color: businessDetailColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
