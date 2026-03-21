import { useMemo } from 'react';

type UseWriteReviewRealtimeTargetsParams = {
  id: string;
  isBusinessReview: boolean;
  nonCriticalReady: boolean;
};

export function useWriteReviewRealtimeTargets({
  id,
  isBusinessReview,
  nonCriticalReady,
}: UseWriteReviewRealtimeTargetsParams) {
  return useMemo(
    () =>
      isBusinessReview
        ? [
            {
              key: `write-review-biz-reviews-${id}`,
              table: 'reviews',
              filter: `business_id=eq.${id}`,
              queryKeys: [['business-reviews', id], ['business', id]],
              enabled: nonCriticalReady && Boolean(id),
            },
          ]
        : [
            {
              key: `write-review-event-reviews-${id}`,
              table: 'reviews',
              filter: `event_id=eq.${id}`,
              queryKeys: [
                ['event-reviews', id],
                ['event-ratings', id],
                ['event-special-detail', id],
              ],
              enabled: nonCriticalReady && Boolean(id),
            },
          ],
    [id, isBusinessReview, nonCriticalReady]
  );
}
