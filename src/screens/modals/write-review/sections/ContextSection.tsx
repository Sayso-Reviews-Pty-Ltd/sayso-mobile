import { CommunityReviewsSection, ReviewContextCard } from '../components';
import type { CommunityReview } from '../types';
import type { WriteReviewParams } from '../../../../navigation/types';

type Props = {
  businessName: string | null;
  communityReviews: CommunityReview[];
  communityReviewsLoading: boolean;
  displayDate?: string | null;
  displayImage: string | null;
  displayTitle: string | null;
  displayValidUntil?: string | null;
  displayVenue?: string | null;
  isBusinessReview: boolean;
  isLoading: boolean;
  type: WriteReviewParams['type'];
};

export function ContextSection({
  businessName,
  communityReviews,
  communityReviewsLoading,
  displayDate,
  displayImage,
  displayTitle,
  displayValidUntil,
  displayVenue,
  isBusinessReview,
  isLoading,
  type,
}: Props) {
  return (
    <>
      <CommunityReviewsSection reviews={communityReviews} isLoading={communityReviewsLoading} />

      {!isLoading && displayTitle && !isBusinessReview ? (
        <ReviewContextCard
          type={type === 'event' ? 'event' : 'special'}
          displayImage={displayImage}
          displayTitle={displayTitle}
          businessName={businessName}
          displayDate={displayDate ?? null}
          displayVenue={displayVenue ?? null}
          displayValidUntil={displayValidUntil ?? null}
        />
      ) : null}
    </>
  );
}
