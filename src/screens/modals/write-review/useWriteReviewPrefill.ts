import { useEffect, useRef } from 'react';
import type { ExistingReviewDto } from './types';

export type OriginalReviewValues = {
  rating: number;
  reviewTitle: string;
  reviewText: string;
  selectedTags: string[];
};

type UseWriteReviewPrefillParams = {
  reviewId?: string | null;
  isEditMode: boolean;
  review: ExistingReviewDto | undefined;
  reviewLoading: boolean;
  setRating: (value: number) => void;
  setReviewTitle: (value: string) => void;
  setReviewText: (value: string) => void;
  setSelectedTags: (value: string[]) => void;
};

export function useWriteReviewPrefill({
  reviewId,
  isEditMode,
  review,
  reviewLoading,
  setRating,
  setReviewTitle,
  setReviewText,
  setSelectedTags,
}: UseWriteReviewPrefillParams) {
  const reviewPrefilledRef = useRef(false);
  const originalValuesRef = useRef<OriginalReviewValues | null>(null);

  useEffect(() => {
    reviewPrefilledRef.current = false;
  }, [reviewId]);

  useEffect(() => {
    if (!isEditMode || reviewPrefilledRef.current || !review) {
      return;
    }

    const nextRating = typeof review.rating === 'number' ? review.rating : 0;
    const nextTitle = (review.title ?? '').trim();
    const nextBody = (review.content ?? review.body ?? '').trim();
    const nextTags = Array.isArray(review.tags)
      ? review.tags
          .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
          .slice(0, 4)
      : [];

    setRating(nextRating);
    setReviewTitle(nextTitle);
    setReviewText(nextBody);
    setSelectedTags(nextTags);

    originalValuesRef.current = {
      rating: nextRating,
      reviewTitle: nextTitle,
      reviewText: nextBody,
      selectedTags: nextTags,
    };

    reviewPrefilledRef.current = true;
  }, [isEditMode, review, setRating, setReviewText, setReviewTitle, setSelectedTags]);

  const existingReviewLoading = isEditMode && !reviewPrefilledRef.current && reviewLoading;

  return { existingReviewLoading, originalValuesRef };
}

type HasWriteReviewContentParams = {
  isEditMode: boolean;
  originalValues: OriginalReviewValues | null;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  selectedTags: string[];
  selectedImagesCount: number;
};

export function hasWriteReviewContent({
  isEditMode,
  originalValues,
  rating,
  reviewTitle,
  reviewText,
  selectedTags,
  selectedImagesCount,
}: HasWriteReviewContentParams): boolean {
  if (isEditMode && originalValues) {
    return (
      rating !== originalValues.rating ||
      reviewTitle.trim() !== originalValues.reviewTitle ||
      reviewText.trim() !== originalValues.reviewText ||
      selectedTags.join(',') !== originalValues.selectedTags.join(',')
    );
  }

  return (
    rating > 0 ||
    reviewText.trim().length > 0 ||
    reviewTitle.trim().length > 0 ||
    selectedTags.length > 0 ||
    selectedImagesCount > 0
  );
}
