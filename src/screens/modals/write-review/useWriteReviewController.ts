import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../lib/api';
import { useAuth } from '../../../providers/AuthProvider';
import { useSecurity } from '../../../providers/SecurityProvider';
import { useBusinessDetail } from '../../../hooks/useBusinessDetail';
import { useEventSpecialDetail } from '../../../hooks/useEventSpecialDetail';
import { useRealtimeQueryInvalidation } from '../../../hooks/useRealtimeQueryInvalidation';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useSavedBusinesses } from '../../../hooks/useSavedBusinesses';
import type { WriteReviewParams } from '../../../navigation/types';
import {
  C,
  FALLBACK_TAGS,
  MAX_CHARS,
  MAX_PHOTOS,
  MAX_TITLE_CHARS,
  MIN_CHARS,
} from './constants';
import { toSingleParam } from './helpers';
import type { ExistingReviewDto } from './types';
import { deriveDisplayMeta } from './deriveDisplayMeta';
import { deriveHeroImages } from './deriveHeroImages';
import { useWriteReviewAnimations } from './useWriteReviewAnimations';
import { useWriteReviewCommunityReviews } from './useWriteReviewCommunityReviews';
import { useWriteReviewHeaderActions } from './useWriteReviewHeaderActions';
import { useWriteReviewImages } from './useWriteReviewImages';
import {
  useNonCriticalReady,
  useWriteReviewDealBreakerTags,
  useWriteReviewPromptRotation,
} from './useWriteReviewLifecycle';
import { useWriteReviewBackHandler, useWriteReviewScrollTop } from './useWriteReviewNavigation';
import { hasWriteReviewContent, useWriteReviewPrefill } from './useWriteReviewPrefill';
import { useWriteReviewRealtimeTargets } from './writeReviewRealtimeTargets';
import { useWriteReviewSubmit } from './useWriteReviewSubmit';

export function useWriteReviewController() {
  const params = useLocalSearchParams<WriteReviewParams>();
  const id = toSingleParam(params.id) ?? '';
  const typeParam = toSingleParam(params.type);
  const reviewId = toSingleParam(params.reviewId);
  const type: WriteReviewParams['type'] =
    typeParam === 'business' || typeParam === 'event' || typeParam === 'special'
      ? typeParam
      : 'business';
  const isEditMode = Boolean(reviewId);

  const router = useRouter();
  const { user } = useAuth();
  const { guardSensitiveAction } = useSecurity();
  const savedQuery = useSavedBusinesses();
  const reducedMotion = useReducedMotion();

  const scrollRef = useRef<ScrollView | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<
    Array<{ uri: string; name: string; mimeType: string }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [quickTags, setQuickTags] = useState<string[]>(FALLBACK_TAGS);
  const [promptIndex, setPromptIndex] = useState(0);
  const [textFocused, setTextFocused] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [showSuccessConfetti, setShowSuccessConfetti] = useState(false);
  const [showShareMoment, setShowShareMoment] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const nonCriticalReady = useNonCriticalReady();
  const isBusinessReview = type === 'business';
  const { data: businessDetail, isLoading: bizLoading } = useBusinessDetail(
    isBusinessReview ? id : ''
  );
  const { data: eventSpecial, isLoading: esLoading } = useEventSpecialDetail(
    !isBusinessReview ? id : null
  );
  const isLoading = isBusinessReview ? bizLoading : esLoading;

  const { communityReviews, communityReviewsLoading } = useWriteReviewCommunityReviews({
    id,
    isBusinessReview,
    nonCriticalReady,
  });

  const reviewDetailQuery = useQuery({
    queryKey: ['review-detail', reviewId],
    queryFn: () => apiFetch<{ review?: ExistingReviewDto }>(`/api/reviews/${reviewId}`),
    enabled: Boolean(reviewId),
    staleTime: 30_000,
  });

  const { existingReviewLoading, originalValuesRef } = useWriteReviewPrefill({
    reviewId,
    isEditMode,
    review: reviewDetailQuery.data?.review,
    reviewLoading: reviewDetailQuery.isLoading,
    setRating,
    setReviewTitle,
    setReviewText,
    setSelectedTags,
  });

  const realtimeTargets = useWriteReviewRealtimeTargets({ id, isBusinessReview, nonCriticalReady });

  useRealtimeQueryInvalidation(realtimeTargets);

  const bd = businessDetail as Record<string, unknown> | null | undefined;
  const es = eventSpecial as unknown as Record<string, unknown> | null | undefined;

  const heroImages = deriveHeroImages(isBusinessReview, bd, es);
  const {
    displayTitle,
    displayImage,
    businessName,
    displayDate,
    displayVenue,
    displayValidUntil,
  } = deriveDisplayMeta(isBusinessReview, bd, es, type);

  const charCount = reviewText.length;
  const charProgress = Math.min(1, charCount / MIN_CHARS);
  const showValidation = reviewText.trim().length > 0 && reviewText.trim().length < MIN_CHARS;

  const animations = useWriteReviewAnimations(
    reducedMotion,
    titleFocused,
    textFocused,
    showValidation,
    charProgress
  );

  const { handleAddPhoto, handleRemoveImage } = useWriteReviewImages({
    selectedImages,
    setSelectedImages,
    maxPhotos: MAX_PHOTOS,
  });

  const hasContent = hasWriteReviewContent({
    isEditMode,
    originalValues: originalValuesRef.current,
    rating,
    reviewTitle,
    reviewText,
    selectedTags,
    selectedImagesCount: selectedImages.length,
  });

  const isFormValid =
    rating > 0 &&
    reviewText.trim().length >= MIN_CHARS &&
    !existingReviewLoading &&
    !isLoading;

  const isSubmitDisabled = !isFormValid || submitting;
  const controlsDisabled = submitting || existingReviewLoading;

  const { handleSubmit, notificationNotice, toastNotice, cleanup } = useWriteReviewSubmit({
    id,
    isEditMode,
    reviewId,
    type,
    isBusinessReview,
    businessDetail: bd,
    eventSpecial: es,
    rating,
    reviewTitle,
    reviewText,
    selectedTags,
    selectedImages,
    isFormValid,
    submitting,
    setSubmitting,
    setFormError,
    setShowSuccessConfetti,
    setShowShareMoment,
    reducedMotion,
    guardSensitiveAction,
    userId: user?.id,
  });

  const { headerRightActions } = useWriteReviewHeaderActions({
    isBusinessReview,
    businessDetail: bd,
    eventSpecial: es,
    id,
    type,
    displayTitle,
    user,
    savedQuery,
  });

  const effectiveQuickTags = useMemo(() => {
    const extra = selectedTags.filter((tag) => !quickTags.includes(tag));
    return extra.length > 0 ? [...extra, ...quickTags] : quickTags;
  }, [quickTags, selectedTags]);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((previous) =>
      previous.includes(tag)
        ? previous.filter((value) => value !== tag)
        : previous.length < 4
          ? [...previous, tag]
          : previous
    );
  }, []);

  const handleBack = useWriteReviewBackHandler({
    hasContent,
    onBack: () => router.back(),
  });
  const { handleScroll, showScrollTopButton } = useWriteReviewScrollTop(scrollRef);

  useWriteReviewPromptRotation({
    reviewTextLength: reviewText.length,
    textFocused,
    setPromptIndex,
  });
  useWriteReviewDealBreakerTags({ nonCriticalReady, setQuickTags });
  useEffect(() => cleanup, [cleanup]);

  return {
    C,
    MAX_CHARS,
    MAX_PHOTOS,
    MAX_TITLE_CHARS,
    MIN_CHARS,
    animations,
    businessDetail: bd,
    businessName,
    charCount,
    communityReviews,
    communityReviewsLoading,
    controlsDisabled,
    displayDate,
    displayImage,
    displayTitle,
    displayValidUntil,
    displayVenue,
    effectiveQuickTags,
    eventSpecial: es,
    existingReviewLoading,
    formError,
    handleAddPhoto,
    handleBack,
    handleRemoveImage,
    handleScroll,
    handleSubmit,
    handleTagToggle,
    headerRightActions,
    heroImages,
    id,
    isBusinessReview,
    isEditMode,
    isFormValid,
    isLoading,
    isSubmitDisabled,
    nonCriticalReady,
    notificationNotice,
    onRatingChange: (value: number) => {
      setFormError(null);
      setRating(value);
    },
    onReviewTextChange: (value: string) => {
      setFormError(null);
      setReviewText(value);
    },
    onReviewTitleChange: (value: string) => {
      setFormError(null);
      setReviewTitle(value);
    },
    previewUri,
    promptIndex,
    rating,
    reducedMotion,
    reviewText,
    reviewTitle,
    scrollRef,
    selectedImages,
    selectedTags,
    setPreviewUri,
    setShowShareMoment,
    setTextFocused,
    setTitleFocused,
    showScrollTopButton,
    showShareMoment,
    showSuccessConfetti,
    showValidation,
    submitting,
    textFocused,
    titleFocused,
    toastNotice,
    type,
    user,
  };
}
