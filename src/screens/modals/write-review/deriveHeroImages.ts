import { isPlaceholderImage } from './helpers';

export function deriveHeroImages(
  isBusinessReview: boolean,
  businessDetail: Record<string, unknown> | null | undefined,
  eventSpecial: Record<string, unknown> | null | undefined,
): string[] {
  if (isBusinessReview && businessDetail) {
    const allImages: string[] = [];
    const pushIfValid = (candidate: unknown) => {
      if (typeof candidate !== 'string') return;
      const trimmed = candidate.trim();
      if (!trimmed || isPlaceholderImage(trimmed)) return;
      if (!allImages.includes(trimmed)) allImages.push(trimmed);
    };
    const uploaded = businessDetail.uploaded_images;
    if (Array.isArray(uploaded)) uploaded.forEach((url) => pushIfValid(url));
    pushIfValid(businessDetail.image_url);
    if (Array.isArray(businessDetail.images)) {
      businessDetail.images.forEach((url: unknown) => pushIfValid(url));
    }
    pushIfValid(businessDetail.image);
    return allImages;
  }

  if (eventSpecial) {
    const firstArrayImage = Array.isArray(eventSpecial.images) ? eventSpecial.images[0] : null;
    const candidate = eventSpecial.image ?? eventSpecial.imageUrl ?? eventSpecial.image_url ?? firstArrayImage ?? null;
    if (typeof candidate !== 'string') return [];
    const trimmed = candidate.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}
