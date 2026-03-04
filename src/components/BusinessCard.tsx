import { memo, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import type { BusinessListItemDto } from '@sayso/contracts';
import { formatDistanceAway } from '../lib/distance';
import { useAuthSession } from '../hooks/useSession';
import { routes } from '../navigation/routes';
import { getOverlayShadowStyle } from '../styles/overlayShadow';
import { CardSurface } from './CardSurface';
import { Text } from './Typography';
import { useBusinessCardLocation, isValidCoordinate } from '../hooks/useBusinessCardLocation';
import { BusinessCardBadges } from './business-card/BusinessCardBadges';
import { BusinessCardCategory } from './business-card/BusinessCardCategory';
import { BusinessCardImage } from './business-card/BusinessCardImage';
import { BusinessCardPercentiles } from './business-card/BusinessCardPercentiles';
import {
  getBusinessIdentifier,
  getDisplayCategoryLabel,
  normalizeCategorySlug,
  normalizeRating,
  resolveDisplayImage,
} from './business-card/businessCardUtils';

type Props = {
  business: BusinessListItemDto;
  style?: StyleProp<ViewStyle>;
};

const ctaShadowStyle = getOverlayShadowStyle(999);

function BusinessCardComponent({ business, style }: Props) {
  const router = useRouter();
  const { user } = useAuthSession();
  const { status: locationStatus, requestLocation, getDistanceKm } = useBusinessCardLocation();
  const businessIdentifier = getBusinessIdentifier(business);
  const displayCategoryLabel = getDisplayCategoryLabel(business);
  const categorySlug = normalizeCategorySlug(business);
  const { hasRating, displayRating, totalReviews } = normalizeRating(business);
  const { image, isPlaceholder, placeholderImage } = resolveDisplayImage(business);
  const hasCoordinates = isValidCoordinate(business.lat) && isValidCoordinate(business.lng);

  const distanceBadgeText = useMemo(() => {
    if (!hasCoordinates) return null;

    if (locationStatus === 'granted') {
      const distanceKm = getDistanceKm(business.lat as number, business.lng as number);
      if (distanceKm === null) return 'Calculating...';
      return formatDistanceAway(distanceKm);
    }

    if (locationStatus === 'loading') return 'Calculating...';
    if (locationStatus === 'denied') return 'Location off';

    return 'Enable location';
  }, [business.lat, business.lng, getDistanceKm, hasCoordinates, locationStatus]);

  const handleReviewPress = () => {
    if (!user) {
      router.push(routes.login() as never);
      return;
    }

    router.push(routes.writeReview('business', business.id) as never);
  };

  return (
    <CardSurface
      radius={24}
      material="frosted"
      style={style}
      contentStyle={Platform.OS !== 'web' ? styles.frostedSurface : undefined}
      interactive
      onPress={() => router.push(routes.businessDetail(businessIdentifier) as never)}
    >
      <View style={styles.media}>
        <BusinessCardImage imageUri={image} placeholderUri={placeholderImage} isPlaceholder={isPlaceholder} />
        <BusinessCardBadges
          verified={business.verified}
          hasRating={hasRating}
          rating={displayRating}
          distanceBadgeText={distanceBadgeText}
          onPressDistance={
            hasCoordinates && locationStatus !== 'granted'
              ? () => {
                  void requestLocation();
                }
              : undefined
          }
        />
      </View>

      <View style={[styles.body, Platform.OS !== 'web' ? styles.bodyFrosted : null]}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {business.name}
        </Text>
        <BusinessCardCategory
          category={displayCategoryLabel}
          subInterestId={business.sub_interest_id ?? business.subInterestId ?? categorySlug}
          subInterestLabel={business.subInterestLabel ?? displayCategoryLabel}
        />
        {business.location ? (
          <Text style={styles.location} numberOfLines={1}>
            {business.location}
          </Text>
        ) : null}
        {hasRating ? (
          <Text style={styles.reviewCount}>
            {`${totalReviews} ${totalReviews === 1 ? 'Review' : 'Reviews'}`}
          </Text>
        ) : null}
        <BusinessCardPercentiles percentiles={business.percentiles} />

        <Pressable
          style={({ pressed }) => [styles.reviewButton, ctaShadowStyle, pressed ? styles.reviewButtonPressed : null]}
          onPress={(event) => {
            event.stopPropagation();
            handleReviewPress();
          }}
        >
          <Text style={styles.reviewButtonText}>
            {hasRating ? 'Write a Review' : 'Be the First to Review'}
          </Text>
        </Pressable>
      </View>
    </CardSurface>
  );
}

export const BusinessCard = memo(
  BusinessCardComponent,
  (prev, next) => prev.business === next.business && prev.style === next.style
);

const styles = StyleSheet.create({
  frostedSurface: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: 'rgba(255,255,255,0.34)',
  },
  media: {
    width: '100%',
    height: 208,
    backgroundColor: '#F3F4F6',
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    alignItems: 'center',
  },
  bodyFrosted: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.34)',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 22,
    width: '100%',
  },
  location: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 7,
  },
  reviewCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 9,
    textAlign: 'center',
  },
  reviewButton: {
    marginTop: 12,
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: '#722F37',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  reviewButtonPressed: {
    opacity: 0.92,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
