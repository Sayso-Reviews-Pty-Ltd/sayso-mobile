import { memo, useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import type { EventSpecialListItemDto } from '@sayso/contracts';
import { CardSurface } from './CardSurface';
import { getOverlayShadowStyle } from '../styles/overlayShadow';
import { Text } from './Typography';
import { EventCardImage } from './event-card/EventCardImage';
import { EventCountdownBadge } from './event-card/EventCountdownBadge';
import { EventDateRibbon } from './event-card/EventDateRibbon';
import { EventRatingBadge } from './event-card/EventRatingBadge';
import { EventStatusPills } from './event-card/EventStatusPills';
import {
  getDateRibbonLabel,
  getEventCountdownState,
  getEventDescription,
  getEventDetailHref,
  normalizeEventRating,
  resolveEventMediaImage,
  type EventCountdownState,
} from './event-card/eventCardUtils';

type Props = {
  item: EventSpecialListItemDto;
  style?: StyleProp<ViewStyle>;
};

const ctaShadowStyle = getOverlayShadowStyle(999);

function EventCardComponent({ item, style }: Props) {
  const router = useRouter();
  const { image, isFallbackArtwork } = resolveEventMediaImage(item);
  const { hasRating, displayRating, reviews } = normalizeEventRating(item);
  const [countdown, setCountdown] = useState<EventCountdownState>(() => getEventCountdownState(item));
  const detailLabel = item.type === 'event' ? 'View Event' : 'View Special';

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getEventCountdownState(item));
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 60_000);

    return () => clearInterval(intervalId);
  }, [item]);

  return (
    <CardSurface
      radius={24}
      material="frosted"
      style={style}
      interactive
      onPress={() => router.push(getEventDetailHref(item) as never)}
    >
      <View style={styles.media}>
        <EventCardImage imageUri={image} isFallbackArtwork={isFallbackArtwork} />
        <View style={styles.mediaOverlay} pointerEvents="none" />
        <EventDateRibbon label={getDateRibbonLabel(item)} />
        {hasRating && displayRating !== undefined ? <EventRatingBadge rating={displayRating} /> : null}
        {countdown.show ? <EventCountdownBadge countdown={countdown} /> : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {getEventDescription(item)}
        </Text>

        <EventStatusPills item={item} />

        {hasRating && reviews > 0 ? (
          <Text style={styles.reviewCount}>
            {`${reviews} ${reviews === 1 ? 'Review' : 'Reviews'}`}
          </Text>
        ) : null}

        <View style={[styles.ctaButton, ctaShadowStyle]} pointerEvents="none">
          <Text style={styles.ctaText}>{detailLabel}</Text>
        </View>
      </View>
    </CardSurface>
  );
}

export const EventCard = memo(
  EventCardComponent,
  (prev, next) => prev.item === next.item && prev.style === next.style
);

const styles = StyleSheet.create({
  media: {
    position: 'relative',
    width: '100%',
    height: 208,
    backgroundColor: '#F7FAFC',
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3748',
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(45, 55, 72, 0.72)',
    marginTop: 7,
  },
  reviewCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginTop: 10,
  },
  ctaButton: {
    marginTop: 12,
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: '#722F37',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
