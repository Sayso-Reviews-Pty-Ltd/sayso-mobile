import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { EventCard } from '../EventCard';
import { EventCardSkeleton } from '../EventCardSkeleton';
import { Text } from '../Typography';
import { useBusinessEvents } from '../../hooks/useBusinessEvents';
import { businessDetailColors, businessDetailSpacing } from './styles';

const CARD_WIDTH = 320;
const GAP = 12;
const SKELETONS = [0, 1, 2];
const FLATLIST_PERF = {
  initialNumToRender: 2,
  maxToRenderPerBatch: 2,
  windowSize: 5,
  removeClippedSubviews: Platform.OS === 'android',
} as const;

type Props = {
  businessId: string;
  businessName: string;
};

export function BusinessOwnedEventsSection({ businessId, businessName }: Props) {
  const { events, isLoading, error, refetch } = useBusinessEvents(businessId);
  const hasEvents = events.length > 0;

  if (!isLoading && !hasEvents) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Events & Specials from {businessName}</Text>

      {error && hasEvents ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Some results may be missing: {error}</Text>
          <Text style={styles.retryText} onPress={() => void refetch()}>
            Retry
          </Text>
        </View>
      ) : null}

      {isLoading && !hasEvents ? (
        <FlatList
          horizontal
          data={SKELETONS}
          keyExtractor={(i) => `event-skeleton-${i}`}
          renderItem={() => (
            <View style={{ width: CARD_WIDTH }}>
              <EventCardSkeleton />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH,
            offset: (CARD_WIDTH + GAP) * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + GAP}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          contentContainerStyle={styles.rowContent}
          {...FLATLIST_PERF}
        />
      ) : (
        <FlatList
          horizontal
          data={events}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) => (
            <EventCard item={item} style={{ width: CARD_WIDTH }} />
          )}
          ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH,
            offset: (CARD_WIDTH + GAP) * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + GAP}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          contentContainerStyle={styles.rowContent}
          {...FLATLIST_PERF}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
    marginTop: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: businessDetailColors.charcoal,
    marginHorizontal: businessDetailSpacing.pageGutter,
  },
  errorBanner: {
    marginHorizontal: businessDetailSpacing.pageGutter,
    borderRadius: 12,
    backgroundColor: 'rgba(229,224,229,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    color: businessDetailColors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  retryText: {
    color: businessDetailColors.coral,
    fontSize: 12,
    fontWeight: '700',
  },
  rowContent: {
    paddingHorizontal: businessDetailSpacing.pageGutter,
    paddingBottom: 4,
  },
});
