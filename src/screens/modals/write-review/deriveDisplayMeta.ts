import type { WriteReviewParams } from '../../../navigation/types';

export type DisplayMeta = {
  displayTitle: string;
  displayImage: string | null;
  businessName: string | null;
  displayDate: string | null;
  displayVenue: string | null;
  displayValidUntil: string | null;
};

export function deriveDisplayMeta(
  isBusinessReview: boolean,
  businessDetail: Record<string, unknown> | null | undefined,
  eventSpecial: Record<string, unknown> | null | undefined,
  type: WriteReviewParams['type'],
): DisplayMeta {
  let displayTitle = '';
  let displayImage: string | null = null;
  let businessName: string | null = null;
  let displayDate: string | null = null;
  let displayVenue: string | null = null;
  let displayValidUntil: string | null = null;

  if (isBusinessReview && businessDetail) {
    displayTitle = String(businessDetail.name ?? '');
    const candidate = businessDetail.image_url ?? (businessDetail.images as unknown[])?.[0] ?? businessDetail.image ?? null;
    displayImage = typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
  } else if (eventSpecial) {
    displayTitle = String(eventSpecial.name ?? eventSpecial.title ?? '');
    const firstArrayImage = Array.isArray(eventSpecial.images) ? eventSpecial.images[0] : null;
    const imgCandidate = eventSpecial.image ?? eventSpecial.imageUrl ?? eventSpecial.image_url ?? firstArrayImage ?? null;
    displayImage = typeof imgCandidate === 'string' && imgCandidate.trim() ? imgCandidate.trim() : null;
    businessName = String(eventSpecial.businessName ?? eventSpecial.business_name ?? '') || null;

    if (type === 'event') {
      displayDate = typeof eventSpecial.startDate === 'string' ? eventSpecial.startDate : null;
      displayVenue = String(eventSpecial.venue ?? eventSpecial.venue_name ?? '') || null;
    } else {
      const validUntil = eventSpecial.valid_until ?? eventSpecial.validUntil ?? null;
      if (validUntil) {
        try {
          displayValidUntil = new Date(String(validUntil)).toLocaleDateString();
        } catch {
          displayValidUntil = null;
        }
      }
    }
  }

  return { displayTitle, displayImage, businessName, displayDate, displayVenue, displayValidUntil };
}
