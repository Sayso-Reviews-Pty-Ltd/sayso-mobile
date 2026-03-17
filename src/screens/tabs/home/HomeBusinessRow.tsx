import { FlatList, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { BusinessListItemDto, FeaturedBusinessDto } from '@sayso/contracts';
import { BusinessCard } from '../../../components/BusinessCard';
import { Text } from '../../../components/Typography';
import { SkeletonCard } from '../../../components/SkeletonCard';
import { homeTokens } from './HomeTokens';
import { CARD_RADIUS } from '../../../styles/radii';
import { CARD_SHADOW_MD } from '../../../styles/overlayShadow';

const GAP = 14;
const SKELETONS = [0, 1, 2];
const FLATLIST_PERF = {
  initialNumToRender: 2,
  maxToRenderPerBatch: 2,
  windowSize: 5,
  removeClippedSubviews: Platform.OS === 'android',
} as const;

type Props<T extends BusinessListItemDto | FeaturedBusinessDto> = {
  items: T[];
  loading: boolean;
  error?: string | null;
  emptyTitle: string;
  emptyMessage: string;
  contentPaddingBottom?: number;
};

export function HomeBusinessRow<T extends BusinessListItemDto | FeaturedBusinessDto>({
  items,
  loading,
  error,
  emptyTitle,
  emptyMessage,
  contentPaddingBottom = 18,
}: Props<T>) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - homeTokens.pageGutter - GAP - 40;
  const snapInterval = cardWidth + GAP;
  const resolvedPaddingBottom = Math.max(contentPaddingBottom, 12);

  if (loading) {
    return (
      <FlatList
        horizontal
        data={SKELETONS}
        keyExtractor={(i) => `business-skeleton-${i}`}
        renderItem={() => (
          <View style={{ width: cardWidth }}>
            <SkeletonCard />
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
        contentContainerStyle={[styles.content, { paddingBottom: resolvedPaddingBottom }]}
        {...FLATLIST_PERF}
      />
    );
  }

  if (error) {
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>Couldn&apos;t load this row right now.</Text>
        <Text style={styles.messageText}>{error}</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>{emptyTitle}</Text>
        <Text style={styles.messageText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <BusinessCard business={item} style={{ width: cardWidth }} />
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
      contentContainerStyle={[styles.content, { paddingBottom: resolvedPaddingBottom }]}
      {...FLATLIST_PERF}
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
