import { BusinessHeroCarousel } from '../../../../components/business-detail';
import { normalizeBusinessRating } from '../../../../components/business-detail/utils';
import type { BusinessDetail } from '../../../../hooks/useBusinessDetail';
import { ReviewHeroCarousel, ReviewTargetCard } from '../components';

type Props = {
  businessDetail: Record<string, unknown> | null | undefined;
  businessName: string | null;
  displayDate?: string | null;
  displayImage: string | null;
  displayTitle: string | null;
  displayValidUntil?: string | null;
  displayVenue?: string | null;
  heroImages: string[];
  isBusinessReview: boolean;
  isLoading: boolean;
};

export function HeroSection({
  businessDetail,
  businessName,
  displayDate,
  displayImage,
  displayTitle,
  displayValidUntil,
  displayVenue,
  heroImages,
  isBusinessReview,
  isLoading,
}: Props) {
  if (isLoading) {
    return null;
  }

  return (
    <>
      {isBusinessReview && businessDetail ? (
        <BusinessHeroCarousel
          businessName={displayTitle ?? ''}
          images={heroImages}
          rating={normalizeBusinessRating(businessDetail as unknown as BusinessDetail).rating}
          verified={(businessDetail as any).verified ?? undefined}
          subcategorySlug={
            (businessDetail as any).primary_subcategory_slug ??
            (businessDetail as any).sub_interest_id ??
            (businessDetail as any).subInterestId
          }
          interestId={
            (businessDetail as any).primary_category_slug ??
            (businessDetail as any).interest_id ??
            (businessDetail as any).interestId
          }
        />
      ) : (
        <ReviewHeroCarousel images={heroImages} subcategorySlug={undefined} />
      )}

      {displayTitle && !isBusinessReview ? (
        <ReviewTargetCard
          displayTitle={displayTitle}
          businessName={businessName}
          heroImages={heroImages}
          displayImage={displayImage}
          displayDate={displayDate ?? null}
          displayVenue={displayVenue ?? null}
          displayValidUntil={displayValidUntil ?? null}
        />
      ) : null}
    </>
  );
}
