import { Animated, Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { C } from './constants';
import { StarRating } from './StarRating';
import { styles } from './styles';
import type { ReviewerProfile, ReviewerReview } from './types';

function ReviewCard({ review }: { review: ReviewerReview }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewBizInfo}>
          {review.businessImageUrl ? (
            <Image source={{ uri: review.businessImageUrl }} style={styles.reviewBizImg} />
          ) : (
            <View style={[styles.reviewBizImg, styles.reviewBizImgFallback]}>
              <Ionicons name="storefront-outline" size={14} color={C.charcoal50} />
            </View>
          )}
          <View style={styles.reviewBizText}>
            <Text style={styles.reviewBizName}>{review.businessName}</Text>
            <Text style={styles.reviewBizType}>{review.businessType}</Text>
          </View>
        </View>
        <View style={styles.reviewRatingWrap}>
          <StarRating rating={review.rating} size={12} />
        </View>
      </View>

      <Text style={styles.reviewText} numberOfLines={4}>{review.text}</Text>

      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>{review.date}</Text>
        {review.likes > 0 ? (
          <View style={styles.reviewLikes}>
            <Ionicons name="thumbs-up-outline" size={12} color={C.charcoal50} />
            <Text style={styles.reviewLikesText}>{review.likes}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

type Props = {
  contentOpacity: Animated.Value;
  contentY: Animated.Value;
  displayedReviews: ReviewerReview[];
  reviewer: ReviewerProfile;
  showAllReviews: boolean;
  onToggleShowAll: () => void;
};

export function ReviewerReviewsSection({
  contentOpacity,
  contentY,
  displayedReviews,
  reviewer,
  showAllReviews,
  onToggleShowAll,
}: Props) {
  return (
    <Animated.View style={[styles.section, { opacity: contentOpacity, transform: [{ translateY: contentY }] }]}>
      <Text style={styles.sectionTitle}>Reviews by {reviewer.name}</Text>

      {reviewer.reviews.length === 0 ? (
        <View style={styles.emptyReviews}>
          <Text style={styles.emptyReviewsText}>No reviews yet.</Text>
        </View>
      ) : (
        <>
          {displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {reviewer.reviews.length > 2 ? (
            <Pressable
              style={({ pressed }) => [styles.showMoreBtn, pressed ? styles.showMoreBtnPressed : null]}
              onPress={onToggleShowAll}
            >
              <Text style={styles.showMoreBtnText}>
                {showAllReviews ? 'Show less' : `Show all ${reviewer.reviews.length} reviews`}
              </Text>
              <Ionicons
                name={showAllReviews ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={C.wine}
              />
            </Pressable>
          ) : null}
        </>
      )}
    </Animated.View>
  );
}
