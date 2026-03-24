import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { type UserBadgeDto } from '../../../hooks/useUserBadges';
import { ApiError, apiFetch } from '../../../lib/api';
import { haptics } from '../../../lib/haptics';
import { track } from '../../../lib/telemetry';
import { routes } from '../../../navigation/routes';
import type { WriteReviewParams } from '../../../navigation/types';
import { getErrorMessage } from './helpers';
import { REVIEW_ERROR_MESSAGES } from './constants';
import type { FeedbackNotice, FeedbackVariant } from './types';

type SelectedImage = { uri: string; name: string; mimeType: string };

type Params = {
  id: string;
  isEditMode: boolean;
  reviewId: string | undefined;
  type: WriteReviewParams['type'];
  isBusinessReview: boolean;
  businessDetail: Record<string, unknown> | null | undefined;
  eventSpecial: Record<string, unknown> | null | undefined;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  selectedTags: string[];
  selectedImages: SelectedImage[];
  isFormValid: boolean;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  setFormError: (v: string | null) => void;
  setShowSuccessConfetti: (v: boolean) => void;
  setShowShareMoment: (v: boolean) => void;
  reducedMotion: boolean;
  guardSensitiveAction: (action: 'write_review' | 'account_action') => { allowed: boolean; reason?: string };
  userId: string | undefined;
};

export function useWriteReviewSubmit(params: Params) {
  const {
    id, isEditMode, reviewId, type, isBusinessReview, businessDetail, eventSpecial,
    rating, reviewTitle, reviewText, selectedTags, selectedImages,
    isFormValid, submitting, setSubmitting, setFormError,
    setShowSuccessConfetti, setShowShareMoment, reducedMotion,
    guardSensitiveAction, userId,
  } = params;

  const qc = useQueryClient();
  const router = useRouter();

  const [notificationNotice, setNotificationNotice] = useState<FeedbackNotice | null>(null);
  const [toastNotice, setToastNotice] = useState<FeedbackNotice | null>(null);

  const feedbackSeqRef = useRef(0);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successRedirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareMomentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitAbortRef = useRef<AbortController | null>(null);

  const cleanup = useCallback(() => {
    if (successRedirectTimerRef.current) clearTimeout(successRedirectTimerRef.current);
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (shareMomentTimerRef.current) clearTimeout(shareMomentTimerRef.current);
    submitAbortRef.current?.abort();
  }, []);

  const showSubmissionFeedback = useCallback((variant: FeedbackVariant, title: string, message: string) => {
    const feedbackId = feedbackSeqRef.current + 1;
    feedbackSeqRef.current = feedbackId;
    const payload: FeedbackNotice = { id: feedbackId, variant, title, message };
    setNotificationNotice(payload);
    setToastNotice(payload);
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    notificationTimerRef.current = setTimeout(() => {
      notificationTimerRef.current = null;
      setNotificationNotice((prev) => (prev?.id === feedbackId ? null : prev));
    }, 2600);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      toastTimerRef.current = null;
      setToastNotice((prev) => (prev?.id === feedbackId ? null : prev));
    }, 2200);
  }, []);

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;
    if (!id.trim()) {
      const message = 'This listing could not be identified. Please go back and try again.';
      setFormError(message);
      showSubmissionFeedback('error', 'Review submission failed', message);
      return;
    }
    const gate = guardSensitiveAction('write_review');
    if (!gate.allowed) {
      const message = gate.reason || 'This action is temporarily unavailable on this device.';
      setFormError(message);
      showSubmissionFeedback('error', 'Review submission failed', message);
      return;
    }

    const abortController = new AbortController();
    submitAbortRef.current = abortController;
    setFormError(null);
    setSubmitting(true);
    let partialSuccessWarningMessage: string | null = null;
    let submittedReviewId: string | null = null;

    try {
      if (isEditMode && reviewId) {
        const result = await apiFetch<{ message?: string; code?: string; error?: string; success?: boolean }>(
          `/api/reviews/${reviewId}`,
          { method: 'PUT', body: JSON.stringify({ rating, title: reviewTitle.trim() || null, content: reviewText.trim(), tags: selectedTags }), timeoutMs: 20_000, signal: abortController.signal }
        );
        if (result.success === false) {
          const message = getErrorMessage(result);
          setFormError(message);
          showSubmissionFeedback('error', 'Review update failed', message);
          return;
        }
        submittedReviewId = reviewId;
      } else {
        const formData = new FormData();
        if (isBusinessReview) {
          formData.append('business_id', String(businessDetail?.id ?? id));
        } else {
          formData.append('target_id', id);
          formData.append('type', type);
        }
        formData.append('rating', String(rating));
        formData.append('content', reviewText.trim());
        if (reviewTitle.trim()) formData.append('title', reviewTitle.trim());
        selectedTags.forEach((tag) => formData.append('tags', tag));
        selectedImages.forEach((img, index) => {
          formData.append('images', { uri: img.uri, name: img.name || `photo_${Date.now()}_${index}.jpg`, type: img.mimeType || 'image/jpeg' } as unknown as Blob);
        });

        const result = await apiFetch<{ message?: string; code?: string; error?: string; success?: boolean; review?: { id: string } }>(
          '/api/reviews',
          { method: 'POST', body: formData, includeAnonymousIdOnMissingAuth: true, timeoutMs: 20_000, signal: abortController.signal }
        );
        if (result.success === false) {
          const message = getErrorMessage(result);
          const isPartial = result.code === 'IMAGE_UPLOAD_FAILED' || message === REVIEW_ERROR_MESSAGES.IMAGE_UPLOAD_FAILED;
          if (isPartial) {
            partialSuccessWarningMessage = REVIEW_ERROR_MESSAGES.IMAGE_UPLOAD_FAILED;
          } else {
            setFormError(message);
            showSubmissionFeedback('error', 'Review submission failed', message);
            return;
          }
        }
        if (isBusinessReview) submittedReviewId = result.review?.id ?? null;
      }

      if (isBusinessReview) {
        qc.invalidateQueries({ queryKey: ['business-reviews', String(businessDetail?.id ?? id)] });
        qc.invalidateQueries({ queryKey: ['business', String(businessDetail?.id ?? id)] });
      } else {
        qc.invalidateQueries({ queryKey: ['event-special-detail', id] });
        qc.invalidateQueries({ queryKey: ['event-reviews', id] });
        qc.invalidateQueries({ queryKey: ['event-ratings', id] });
        qc.invalidateQueries({ queryKey: ['event-related', id] });
      }
      qc.invalidateQueries({ queryKey: ['user-reviews'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['user-stats'] });
      qc.invalidateQueries({ queryKey: ['user-badges'] });
      qc.invalidateQueries({ queryKey: ['user-badges-all'] });

      const successTitle = isEditMode ? 'Review updated' : 'Review submitted';
      const successMessage = isEditMode ? 'Your review changes were saved.' : 'Thanks for sharing your experience.';
      if (partialSuccessWarningMessage) {
        showSubmissionFeedback('warning', 'Review submitted', partialSuccessWarningMessage);
      } else {
        showSubmissionFeedback('success', successTitle, successMessage);
      }

      if (!partialSuccessWarningMessage) haptics.complete();

      if (!isEditMode && !partialSuccessWarningMessage) {
        setShowSuccessConfetti(true);
        track('prestige.review_written');
        shareMomentTimerRef.current = setTimeout(() => setShowShareMoment(true), 800);
      }

      if (userId && !isEditMode) {
        apiFetch<{ ok?: boolean; newBadges?: UserBadgeDto[] }>(
          '/api/badges/check-and-award',
          { method: 'POST', timeoutMs: 10_000, signal: abortController.signal }
        )
          .then((badgeResult) => {
            if ((badgeResult?.newBadges ?? []).length > 0) {
              void qc.refetchQueries({ queryKey: ['user-badges', userId] });
            }
          })
          .catch(() => {});
      }

      const redirectBusinessId = (() => {
        if (isBusinessReview) {
          return typeof businessDetail?.id === 'string' && businessDetail.id.trim() ? businessDetail.id : id;
        }
        const camelId = eventSpecial && typeof eventSpecial.businessId === 'string' ? eventSpecial.businessId.trim() : '';
        if (camelId) return camelId;
        const snakeId = eventSpecial && typeof eventSpecial.business_id === 'string' ? eventSpecial.business_id.trim() : '';
        return snakeId || null;
      })();

      const reviewParam = redirectBusinessId && submittedReviewId ? `?newReviewId=${encodeURIComponent(submittedReviewId)}` : '';
      const redirectTarget = redirectBusinessId ? routes.businessDetail(redirectBusinessId) + reviewParam : routes.home();

      if (successRedirectTimerRef.current) clearTimeout(successRedirectTimerRef.current);
      successRedirectTimerRef.current = setTimeout(() => {
        successRedirectTimerRef.current = null;
        setShowSuccessConfetti(false);
        router.replace(redirectTarget as never);
      }, reducedMotion ? 2000 : 1100);
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.details && typeof err.details === 'object' ? (err.details as Record<string, unknown>) : null;
        const message = getErrorMessage({
          message: (details && typeof details.message === 'string' ? details.message : undefined) || err.message,
          code: err.code,
          error: details && typeof details.error === 'string' ? details.error : undefined,
        });
        showSubmissionFeedback('error', isEditMode ? 'Review update failed' : 'Review submission failed', message);
        setFormError(message);
        return;
      }
      const fallbackMessage = err instanceof Error ? err.message : 'Failed to submit your review.';
      showSubmissionFeedback('error', isEditMode ? 'Review update failed' : 'Review submission failed', fallbackMessage);
      setFormError(fallbackMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return { handleSubmit, showSubmissionFeedback, notificationNotice, toastNotice, cleanup };
}
