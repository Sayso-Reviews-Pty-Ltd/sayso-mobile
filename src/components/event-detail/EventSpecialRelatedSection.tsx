import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { EventSpecialListItemDto } from '@sayso/contracts';
import { Text } from '../Typography';
import { businessDetailColors, businessDetailSpacing } from '../business-detail/styles';
import { getDateRibbonLabel, getEventDetailHref, resolveEventMediaImage } from '../event-card/eventCardUtils';

type Props = {
  title?: string;
  items: EventSpecialListItemDto[];
  isLoading?: boolean;
  error?: string | null;
};

function RelatedCard({ item }: { item: EventSpecialListItemDto }) {
  const router = useRouter();
  const { image } = resolveEventMediaImage(item);
  const dateLabel = getDateRibbonLabel(item);
  const meta = [dateLabel, item.city].filter(Boolean).join(' · ');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
      onPress={() => router.push(getEventDetailHref(item) as never)}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbFallback]} />
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.typePill}>
            <Text style={styles.typePillText}>{item.type === 'special' ? 'Special' : 'Event'}</Text>
          </View>
          {meta ? <Text style={styles.metaText} numberOfLines={1}>{meta}</Text> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward-outline" size={16} color={businessDetailColors.textSubtle} />
    </Pressable>
  );
}

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={[styles.thumb, styles.skeletonThumb]} />
      <View style={styles.cardInfo}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonMeta} />
      </View>
    </View>
  );
}

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

      <View style={styles.list}>
        {isLoading ? (
          [1, 2, 3].map((n) => <SkeletonCard key={`skel-${n}`} />)
        ) : error ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Could not load related listings.</Text>
            <Text style={styles.messageText}>{error}</Text>
          </View>
        ) : (
          items.map((item) => (
            <RelatedCard key={`${item.type}-${item.id}`} item={item} />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: businessDetailSpacing.pageGutter,
    gap: 16,
  },
  heading: {
    color: businessDetailColors.charcoal,
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: businessDetailSpacing.cardRadius,
    backgroundColor: businessDetailColors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: businessDetailColors.borderSoft,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.75,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: businessDetailColors.cardBg,
    flexShrink: 0,
    overflow: 'hidden',
  },
  thumbFallback: {
    backgroundColor: 'rgba(125,155,118,0.40)',
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    color: businessDetailColors.charcoal,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  typePill: {
    borderRadius: 999,
    backgroundColor: 'rgba(229,224,229,0.80)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: businessDetailColors.textMuted,
  },
  metaText: {
    color: businessDetailColors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  skeletonThumb: {
    backgroundColor: 'rgba(45,45,45,0.08)',
  },
  skeletonTitle: {
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(45,45,45,0.08)',
    width: '70%',
    marginBottom: 6,
  },
  skeletonMeta: {
    height: 11,
    borderRadius: 4,
    backgroundColor: 'rgba(45,45,45,0.06)',
    width: '45%',
  },
  messageCard: {
    borderRadius: businessDetailSpacing.cardRadius,
    backgroundColor: businessDetailColors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: businessDetailColors.borderSoft,
    gap: 6,
  },
  messageTitle: {
    color: businessDetailColors.charcoal,
    fontSize: 15,
    fontWeight: '700',
  },
  messageText: {
    color: businessDetailColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});
