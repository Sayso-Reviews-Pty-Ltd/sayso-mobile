import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import { Text } from '../Typography';
import { ReviewsList } from '../review-card/ReviewsList';
import type { ReviewCardData } from '../review-card/ReviewCard';
import { useBusinessReviews } from '../../hooks/useBusinessReviews';
import { businessDetailColors, businessDetailSpacing } from './styles';

type Props = {
  businessId: string;
  onPressWriteReview: () => void;
};

const COLLAPSED_VISIBLE_REVIEWS = 3;
const REVIEWS_LAYOUT_DURATION = 260;

const runReviewsLayoutAnimation = () => {
  LayoutAnimation.configureNext({
    duration: REVIEWS_LAYOUT_DURATION,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: { type: LayoutAnimation.Types.easeInEaseOut },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
};

export function BusinessReviewsSection({ businessId, onPressWriteReview }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } =
    useBusinessReviews(businessId);
  const reviews = data?.pages.flatMap((page) => page.data) ?? [];
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleChevron = useRef(new Animated.Value(0)).current;
  const previousLoadedCount = useRef(0);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    setIsExpanded(false);
  }, [businessId]);

  useEffect(() => {
    Animated.timing(toggleChevron, {
      toValue: isExpanded ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isExpanded, toggleChevron]);

  const normalized: ReviewCardData[] = useMemo(
    () =>
      reviews.map((r) => ({
        id: r.id,
        userId: r.user_id,
        rating: r.rating,
        content: r.body ?? '',
        helpfulCount: 0,
        createdAt: r.created_at,
        user: {
          id: r.user_id,
          name: r.display_name ?? r.username ?? 'Anonymous',
          avatarUrl: r.avatar_url,
        },
        images: r.images?.map((i) => i.url).filter((u): u is string => !!u) ?? [],
      })),
    [reviews]
  );

  const canToggleReviews = normalized.length > COLLAPSED_VISIBLE_REVIEWS;
  const hiddenLoadedCount = Math.max(0, normalized.length - COLLAPSED_VISIBLE_REVIEWS);
  const visibleReviews = isExpanded ? normalized : normalized.slice(0, COLLAPSED_VISIBLE_REVIEWS);

  const viewMoreLabel =
    hiddenLoadedCount > 0
      ? `View ${hiddenLoadedCount}${hasNextPage ? '+' : ''} more reviews`
      : 'View more reviews';
  const chevronRotate = toggleChevron.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  useEffect(() => {
    if (!isExpanded) {
      previousLoadedCount.current = normalized.length;
      return;
    }

    if (normalized.length > previousLoadedCount.current) {
      runReviewsLayoutAnimation();
    }
    previousLoadedCount.current = normalized.length;
  }, [isExpanded, normalized.length]);

  const handleToggleReviews = () => {
    runReviewsLayoutAnimation();
    setIsExpanded((current) => !current);
  };

  const handleLoadMoreReviews = () => {
    runReviewsLayoutAnimation();
    void fetchNextPage();
  };

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Community Reviews</Text>

      <ReviewsList
        reviews={visibleReviews}
        loading={isLoading}
        error={isError ? (error instanceof Error ? error.message : 'Failed to load reviews') : null}
        emptyMessage="No reviews yet. Be the first to review this business!"
        realtimeTarget={{ type: 'business', id: businessId }}
        onUpdate={() => {
          void refetch();
        }}
        emptyStateAction={{ label: 'Write First Review', onPress: onPressWriteReview }}
      />

      {canToggleReviews && (
        <Pressable
          style={({ pressed }) => [styles.toggleButton, pressed && styles.toggleButtonPressed]}
          onPress={handleToggleReviews}
        >
          <Text style={styles.toggleText}>{isExpanded ? 'Show fewer reviews' : viewMoreLabel}</Text>
          <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
            <Ionicons name="chevron-down-outline" size={15} color={businessDetailColors.charcoal} />
          </Animated.View>
        </Pressable>
      )}

      {isExpanded && hasNextPage && (
        <Pressable
          style={[styles.loadMoreButton, isFetchingNextPage && styles.loadMoreDisabled]}
          onPress={handleLoadMoreReviews}
          disabled={isFetchingNextPage}
        >
          <Text style={styles.loadMoreText}>
            {isFetchingNextPage ? 'Loading...' : 'Load more reviews'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    gap: 16,
    paddingHorizontal: businessDetailSpacing.pageGutter,
  },
  label: {
    color: businessDetailColors.charcoal,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginVertical: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(45,45,45,0.06)',
  },
  toggleButtonPressed: {
    opacity: 0.75,
  },
  loadMoreDisabled: {
    opacity: 0.7,
  },
  toggleText: {
    color: businessDetailColors.charcoal,
    fontSize: 13,
    fontWeight: '700',
  },
  loadMoreText: {
    color: businessDetailColors.coral,
    fontSize: 13,
    fontWeight: '700',
  },
});
