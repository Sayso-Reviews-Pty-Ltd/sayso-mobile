import { useMemo } from 'react';
import { useBusinessReviews } from '../../../hooks/useBusinessReviews';
import { useEventReviews } from '../../../hooks/useEventReviews';
import { relativeDate } from './helpers';
import type { CommunityReview } from './types';

type UseWriteReviewCommunityReviewsParams = {
  id: string;
  isBusinessReview: boolean;
  nonCriticalReady: boolean;
};

export function useWriteReviewCommunityReviews({
  id,
  isBusinessReview,
  nonCriticalReady,
}: UseWriteReviewCommunityReviewsParams) {
  const businessReviewsQuery = useBusinessReviews(isBusinessReview && nonCriticalReady ? id : '');
  const eventReviewsResult = useEventReviews(!isBusinessReview && nonCriticalReady ? id : null);

  const communityReviews: CommunityReview[] = useMemo(() => {
    if (isBusinessReview) {
      return (businessReviewsQuery.data?.pages?.[0]?.data ?? []).map((review) => ({
        id: review.id,
        userName: review.display_name ?? review.username ?? 'Anonymous',
        avatarUrl: review.avatar_url ?? null,
        rating: review.rating,
        text: review.body ?? '',
        date: relativeDate(review.created_at),
      }));
    }

    return eventReviewsResult.reviews.map((review) => ({
      id: review.id,
      userName: review.user.name,
      avatarUrl: review.user.avatarUrl ?? null,
      rating: review.rating,
      text: review.content,
      date: relativeDate(review.createdAt),
    }));
  }, [businessReviewsQuery.data, eventReviewsResult.reviews, isBusinessReview]);

  const communityReviewsLoading = isBusinessReview
    ? businessReviewsQuery.isLoading
    : eventReviewsResult.isLoading;

  return { communityReviews, communityReviewsLoading };
}
