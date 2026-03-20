import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonBlock } from '../../../../components/SkeletonBlock';
import { Text } from '../../../../components/Typography';
import { ProfileReviewItem } from '../../../../components/profile/ProfileReviewItem';
import type { UserReviewDto } from '../../../../hooks/useUserReviews';
import { CORAL, CHARCOAL, CONTRIBUTIONS_INITIAL_COUNT } from '../constants';
import { normalizeLocalSearchParam } from '../helpers';
import { ProfileSectionCard } from './ProfileSectionCard';

type Props = {
  reviews: UserReviewDto[];
  isLoading: boolean;
  showAllContributions: boolean;
  onToggleShowAll: () => void;
  onViewBusiness: (businessSlugOrId: string) => void;
  onEditReview: (reviewId: string, businessId?: string | null) => void;
  onDeleteReview: (reviewId: string) => void;
};

export function ProfileContributionsSection({
  reviews,
  isLoading,
  showAllContributions,
  onToggleShowAll,
  onViewBusiness,
  onEditReview,
  onDeleteReview,
}: Props) {
  const displayedReviews = showAllContributions
    ? reviews
    : reviews.slice(0, CONTRIBUTIONS_INITIAL_COUNT);

  return (
    <ProfileSectionCard>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionIconCircle}>
            <Ionicons name="document-text-outline" size={14} color="rgba(45,45,45,0.84)" />
          </View>
          <Text style={styles.sectionTitle}>Your Contributions</Text>
        </View>

        {reviews.length > CONTRIBUTIONS_INITIAL_COUNT ? (
          <Pressable style={styles.inlineLink} onPress={onToggleShowAll}>
            <Text style={styles.inlineLinkText}>{showAllContributions ? 'Hide' : 'See all'}</Text>
            <Ionicons
              name={showAllContributions ? 'chevron-up' : 'chevron-forward'}
              size={14}
              color={CORAL}
            />
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.reviewsSkeletonList}>
          {[0, 1].map((index) => (
            <View key={`review-skeleton-${index}`} style={styles.reviewSkeletonRow}>
              <SkeletonBlock style={{ width: 48, height: 48, borderRadius: 12 }} />
              <View style={{ flex: 1, gap: 7 }}>
                <SkeletonBlock style={{ width: '58%', height: 13, borderRadius: 7 }} />
                <SkeletonBlock style={{ width: '72%', height: 11, borderRadius: 6 }} />
                <SkeletonBlock style={{ width: '40%', height: 11, borderRadius: 6 }} />
              </View>
            </View>
          ))}
        </View>
      ) : displayedReviews.length === 0 ? (
        <View style={styles.emptyStateWrap}>
          <Text style={styles.emptyStateText}>You haven&apos;t written any reviews yet.</Text>
        </View>
      ) : (
        <View>
          {displayedReviews.map((review) => {
            const businessSlugOrId =
              review.business?.slug ||
              review.business?.id ||
              normalizeLocalSearchParam(review.business_id) ||
              '';

            return (
              <ProfileReviewItem
                key={review.id}
                businessName={review.business?.name || 'Unknown Business'}
                businessImageUrl={review.business?.image_url || null}
                businessCategorySlug={
                  review.business?.primary_subcategory_slug || review.business?.category || null
                }
                rating={review.rating}
                reviewText={review.body || review.content || null}
                reviewTitle={review.title || null}
                tags={review.tags || null}
                createdAt={review.created_at}
                onViewClick={() => {
                  if (!businessSlugOrId) return;
                  onViewBusiness(businessSlugOrId);
                }}
                onEdit={() => onEditReview(review.id, review.business?.id || review.business_id)}
                onDelete={() => onDeleteReview(review.id)}
              />
            );
          })}
        </View>
      )}
    </ProfileSectionCard>
  );
}

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  sectionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(229,224,229,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    color: CHARCOAL,
    fontWeight: '700',
  },
  inlineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  inlineLinkText: {
    color: CORAL,
    fontSize: 12,
    fontWeight: '700',
  },
  reviewsSkeletonList: {
    gap: 10,
  },
  reviewSkeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  emptyStateWrap: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: 'rgba(45,45,45,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
