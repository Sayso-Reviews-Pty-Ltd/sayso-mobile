import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  InteractionManager,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type UserBadgeDto } from '../../../hooks/useUserBadges';
import { ApiError, apiFetch } from '../../../lib/api';
import { compressImageForUpload } from '../../../lib/compressImage';
import { ENV } from '../../../lib/env';
import { StackPageHeader } from '../../../components/StackPageHeader';
import {
  BusinessHeroCarousel,
  type BusinessHeaderRightAction,
} from '../../../components/business-detail';
import { normalizeBusinessRating } from '../../../components/business-detail/utils';
import { useAuth } from '../../../providers/AuthProvider';
import { useSecurity } from '../../../providers/SecurityProvider';
import { useBusinessDetail } from '../../../hooks/useBusinessDetail';
import { useEventSpecialDetail } from '../../../hooks/useEventSpecialDetail';
import { useGlobalScrollToTop } from '../../../hooks/useGlobalScrollToTop';
import { useRealtimeQueryInvalidation } from '../../../hooks/useRealtimeQueryInvalidation';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useSavedBusinesses } from '../../../hooks/useSavedBusinesses';
import { useBusinessReviews } from '../../../hooks/useBusinessReviews';
import { useEventReviews } from '../../../hooks/useEventReviews';
import type { WriteReviewParams } from '../../../navigation/types';
import { routes } from '../../../navigation/routes';
import { C, FALLBACK_TAGS, MAX_PHOTOS, MAX_TITLE_CHARS, MAX_CHARS, MIN_CHARS, REVIEW_ERROR_MESSAGES, WRITING_PROMPTS } from './constants';
import { getErrorMessage, isPlaceholderImage, relativeDate, toSingleParam } from './helpers';
import type { CommunityReview, ExistingReviewDto, FeedbackNotice, FeedbackVariant } from './types';
import { styles } from './screenStyles';
import {
  CommunityReviewsSection,
  ImagePreviewOverlay,
  ReviewConfettiOverlay,
  ReviewContextCard,
  ReviewFormCard,
  ReviewHeroCarousel,
  ReviewStatusFeedback,
  ReviewTargetCard,
} from './components';

export default function WriteReviewScreen() {
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
  const qc = useQueryClient();
  const { user } = useAuth();
  const { guardSensitiveAction } = useSecurity();
  const savedQuery = useSavedBusinesses();
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollTopVisibleRef = useRef(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<Array<{ uri: string; name: string; mimeType: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [quickTags, setQuickTags] = useState<string[]>(FALLBACK_TAGS);
  const [promptIndex, setPromptIndex] = useState(0);
  const [textFocused, setTextFocused] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [showSuccessConfetti, setShowSuccessConfetti] = useState(false);
  const [notificationNotice, setNotificationNotice] = useState<FeedbackNotice | null>(null);
  const [toastNotice, setToastNotice] = useState<FeedbackNotice | null>(null);
  const [nonCriticalReady, setNonCriticalReady] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const thumbScales = useRef([0, 1].map(() => new Animated.Value(1))).current;
  const successRedirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackSeqRef = useRef(0);

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(20)).current;

  const sectionDelays = [100, 150, 200, 200, 250, 300];
  const sectionAnims = useRef(
    sectionDelays.map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(-20),
    }))
  ).current;

  const titleScale = useRef(new Animated.Value(1)).current;
  const bodyScale = useRef(new Animated.Value(1)).current;
  const validationOpacity = useRef(new Animated.Value(0)).current;
  const validationTranslateY = useRef(new Animated.Value(-4)).current;
  const wasShowingValidation = useRef(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const reviewPrefilledRef = useRef(false);
  const submitAbortRef = useRef<AbortController | null>(null);
  const originalValuesRef = useRef<{ rating: number; reviewTitle: string; reviewText: string; selectedTags: string[] } | null>(null);
  const imagePickingRef = useRef(false);

  const isBusinessReview = type === 'business';
  const { data: businessDetail, isLoading: bizLoading } = useBusinessDetail(isBusinessReview ? id : '');
  const { data: eventSpecial, isLoading: esLoading } = useEventSpecialDetail(!isBusinessReview ? id : null);
  const isLoading = isBusinessReview ? bizLoading : esLoading;

  const businessReviewsQuery = useBusinessReviews(isBusinessReview && nonCriticalReady ? id : '');
  const eventReviewsResult = useEventReviews(!isBusinessReview && nonCriticalReady ? id : null);

  const communityReviews: CommunityReview[] = useMemo(() => {
    if (isBusinessReview) {
      const firstPage = businessReviewsQuery.data?.pages?.[0]?.data ?? [];
      return firstPage.map((reviewItem) => ({
        id: reviewItem.id,
        userName: reviewItem.display_name ?? reviewItem.username ?? 'Anonymous',
        avatarUrl: reviewItem.avatar_url ?? null,
        rating: reviewItem.rating,
        text: reviewItem.body ?? '',
        date: relativeDate(reviewItem.created_at),
      }));
    }
    return eventReviewsResult.reviews.map((reviewItem) => ({
      id: reviewItem.id,
      userName: reviewItem.user.name,
      avatarUrl: reviewItem.user.avatarUrl ?? null,
      rating: reviewItem.rating,
      text: reviewItem.content,
      date: relativeDate(reviewItem.createdAt),
    }));
  }, [isBusinessReview, businessReviewsQuery.data, eventReviewsResult.reviews]);

  const communityReviewsLoading = isBusinessReview
    ? businessReviewsQuery.isLoading
    : eventReviewsResult.isLoading;

  const reviewDetailQuery = useQuery({
    queryKey: ['review-detail', reviewId],
    queryFn: () => apiFetch<{ review?: ExistingReviewDto }>(`/api/reviews/${reviewId}`),
    enabled: Boolean(reviewId),
    staleTime: 30_000,
  });

  const existingReviewLoading = isEditMode && !reviewPrefilledRef.current && reviewDetailQuery.isLoading;

  const realtimeTargets = useMemo(
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
              queryKeys: [['event-reviews', id], ['event-ratings', id], ['event-special-detail', id]],
              enabled: nonCriticalReady && Boolean(id),
            },
          ],
    [id, isBusinessReview, nonCriticalReady]
  );

  useRealtimeQueryInvalidation(realtimeTargets);

  const heroImages: string[] =
    isBusinessReview && businessDetail
      ? (() => {
          const allImages: string[] = [];
          const pushIfValid = (candidate: unknown) => {
            if (typeof candidate !== 'string') return;
            const trimmed = candidate.trim();
            if (!trimmed || isPlaceholderImage(trimmed)) return;
            if (!allImages.includes(trimmed)) allImages.push(trimmed);
          };
          const uploaded = (businessDetail as any).uploaded_images;
          if (Array.isArray(uploaded)) uploaded.forEach((url) => pushIfValid(url));
          pushIfValid((businessDetail as any).image_url);
          if (Array.isArray((businessDetail as any).images)) {
            (businessDetail as any).images.forEach((url: unknown) => pushIfValid(url));
          }
          pushIfValid((businessDetail as any).image);
          return allImages;
        })()
      : eventSpecial
        ? (() => {
            const es = eventSpecial as unknown as Record<string, unknown>;
            const firstArrayImage = Array.isArray(es.images) ? es.images[0] : null;
            const candidate = es.image ?? es.imageUrl ?? es.image_url ?? firstArrayImage ?? null;
            if (typeof candidate !== 'string') return [];
            const trimmed = candidate.trim();
            return trimmed ? [trimmed] : [];
          })()
        : [];

  const charCount = reviewText.length;
  const charProgress = Math.min(1, charCount / MIN_CHARS);
  const showValidation = reviewText.trim().length > 0 && reviewText.trim().length < MIN_CHARS;

  useEffect(() => {
    reviewPrefilledRef.current = false;
  }, [reviewId]);

  useEffect(() => {
    if (reducedMotion) {
      formOpacity.setValue(1);
      formTranslateY.setValue(0);
      sectionAnims.forEach((anim) => {
        anim.opacity.setValue(1);
        anim.translateX.setValue(0);
      });
      return;
    }
    Animated.parallel([
      Animated.timing(formOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(formTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    sectionAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(sectionDelays[index]),
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim.translateX, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start();
    });
  }, [formOpacity, formTranslateY, reducedMotion, sectionAnims, sectionDelays]);

  useEffect(() => {
    if (reducedMotion) return;
    Animated.timing(titleScale, {
      toValue: titleFocused ? 1.01 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [reducedMotion, titleFocused, titleScale]);

  useEffect(() => {
    if (reducedMotion) return;
    Animated.timing(bodyScale, {
      toValue: textFocused ? 1.01 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [bodyScale, reducedMotion, textFocused]);

  useEffect(() => {
    if (showValidation && !wasShowingValidation.current) {
      wasShowingValidation.current = true;
      if (reducedMotion) {
        validationOpacity.setValue(1);
        validationTranslateY.setValue(0);
        return;
      }
      validationOpacity.setValue(0);
      validationTranslateY.setValue(-4);
      Animated.parallel([
        Animated.timing(validationOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(validationTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    } else if (!showValidation) {
      wasShowingValidation.current = false;
      validationOpacity.setValue(0);
      validationTranslateY.setValue(-4);
    }
  }, [reducedMotion, showValidation, validationOpacity, validationTranslateY]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: charProgress,
      duration: reducedMotion ? 0 : 300,
      useNativeDriver: false,
    }).start();
  }, [charProgress, progressAnim, reducedMotion]);

  useEffect(() => {
    if (reviewText.length === 0 && !textFocused) {
      const timer = setInterval(() => setPromptIndex((i) => (i + 1) % WRITING_PROMPTS.length), 4000);
      return () => clearInterval(timer);
    }
  }, [reviewText.length, textFocused]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setNonCriticalReady(true);
    });
    return () => task.cancel();
  }, []);

  useEffect(() => {
    return () => {
      if (successRedirectTimerRef.current) clearTimeout(successRedirectTimerRef.current);
      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      submitAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!nonCriticalReady) return;
    let active = true;
    apiFetch<{ dealBreakers?: Array<{ label?: string }> }>('/api/deal-breakers')
      .then((payload) => {
        if (!active || !payload) return;
        const labels = (payload.dealBreakers ?? [])
          .map((item) => (item?.label ?? '').trim())
          .filter(Boolean);
        if (labels.length > 0) setQuickTags([...new Set(labels)] as string[]);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [nonCriticalReady]);

  useEffect(() => {
    if (!isEditMode || reviewPrefilledRef.current) return;
    const review = reviewDetailQuery.data?.review;
    if (!review) return;

    const reviewRating = typeof review.rating === 'number' ? review.rating : 0;
    const prefilledTitle = (review.title ?? '').trim();
    const prefilledText = (review.content ?? review.body ?? '').trim();
    const prefilledTags = Array.isArray(review.tags)
      ? review.tags
          .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
          .slice(0, 4)
      : [];

    setRating(reviewRating);
    setReviewTitle(prefilledTitle);
    setReviewText(prefilledText);
    setSelectedTags(prefilledTags);

    originalValuesRef.current = {
      rating: reviewRating,
      reviewTitle: prefilledTitle,
      reviewText: prefilledText,
      selectedTags: prefilledTags,
    };
    reviewPrefilledRef.current = true;
  }, [isEditMode, reviewDetailQuery.data?.review]);

  useEffect(() => {
    if (!isEditMode || !reviewDetailQuery.error) return;
    if (reviewDetailQuery.error instanceof ApiError) {
      setFormError(
        getErrorMessage({
          message: reviewDetailQuery.error.message,
          code: reviewDetailQuery.error.code,
        })
      );
      return;
    }
    setFormError('Failed to load review details for editing.');
  }, [isEditMode, reviewDetailQuery.error]);

  const hasContent = (() => {
    if (isEditMode && originalValuesRef.current) {
      const original = originalValuesRef.current;
      return (
        rating !== original.rating ||
        reviewTitle.trim() !== original.reviewTitle ||
        reviewText.trim() !== original.reviewText ||
        selectedTags.join(',') !== original.selectedTags.join(',')
      );
    }
    return (
      rating > 0 ||
      reviewText.trim().length > 0 ||
      reviewTitle.trim().length > 0 ||
      selectedTags.length > 0 ||
      selectedImages.length > 0
    );
  })();

  const isFormValid =
    rating > 0 &&
    reviewText.trim().length >= MIN_CHARS &&
    !existingReviewLoading &&
    !isLoading;
  const isSubmitDisabled = !isFormValid || submitting;
  const controlsDisabled = submitting || existingReviewLoading;

  const effectiveQuickTags = useMemo(() => {
    const extra = selectedTags.filter((tag) => !quickTags.includes(tag));
    return extra.length > 0 ? [...extra, ...quickTags] : quickTags;
  }, [quickTags, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : prev.length < 4 ? [...prev, tag] : prev
    );
  };

  const handleBack = useCallback(() => {
    if (!hasContent) {
      router.back();
      return;
    }
    Alert.alert('Discard Review?', 'You have unsaved changes. Are you sure you want to leave?', [
      { text: 'Keep Editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  }, [hasContent, router]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const showScrollTop = y > 320;
    if (scrollTopVisibleRef.current !== showScrollTop) {
      scrollTopVisibleRef.current = showScrollTop;
      setShowScrollTopButton(showScrollTop);
    }
  }, []);

  const handleScrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  useGlobalScrollToTop({
    visible: showScrollTopButton,
    enabled: true,
    onScrollToTop: handleScrollToTop,
  });

  const processPickedAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    const compressed = await compressImageForUpload(asset.uri);
    const filename = asset.fileName ?? `photo_${Date.now()}.jpg`;
    setSelectedImages((prev) => [...prev, { uri: compressed.uri, name: filename, mimeType: compressed.mimeType }]);
  };

  const handlePickFromLibrary = async () => {
    imagePickingRef.current = true;
    try {
      if (selectedImages.length >= MAX_PHOTOS) return;
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Photo library access is needed to attach images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]) return;
      try {
        await processPickedAsset(result.assets[0]);
      } catch {
        Alert.alert('Unable to process image', 'Please try a different photo.');
      }
    } finally {
      imagePickingRef.current = false;
    }
  };

  const handleTakePhoto = async () => {
    imagePickingRef.current = true;
    try {
      if (selectedImages.length >= MAX_PHOTOS) return;
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Camera access is needed to take a photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]) return;
      try {
        await processPickedAsset(result.assets[0]);
      } catch {
        Alert.alert('Unable to process image', 'Please try a different photo.');
      }
    } finally {
      imagePickingRef.current = false;
    }
  };

  const handleAddPhoto = () => {
    if (imagePickingRef.current) return;
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Library', onPress: handlePickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

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
          {
            method: 'PUT',
            body: JSON.stringify({
              rating,
              title: reviewTitle.trim() || null,
              content: reviewText.trim(),
              tags: selectedTags,
            }),
            timeoutMs: 20_000,
            signal: abortController.signal,
          }
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
          formData.append('business_id', businessDetail?.id ?? id);
        } else {
          formData.append('target_id', id);
          formData.append('type', type);
        }
        formData.append('rating', String(rating));
        formData.append('content', reviewText.trim());
        if (reviewTitle.trim()) formData.append('title', reviewTitle.trim());
        selectedTags.forEach((tag) => formData.append('tags', tag));
        selectedImages.forEach((img, index) => {
          formData.append('images', {
            uri: img.uri,
            name: img.name || `photo_${Date.now()}_${index}.jpg`,
            type: img.mimeType || 'image/jpeg',
          } as unknown as Blob);
        });

        const result = await apiFetch<{ message?: string; code?: string; error?: string; success?: boolean; review?: { id: string } }>(
          '/api/reviews',
          {
            method: 'POST',
            body: formData,
            includeAnonymousIdOnMissingAuth: true,
            timeoutMs: 20_000,
            signal: abortController.signal,
          }
        );
        if (result.success === false) {
          const message = getErrorMessage(result);
          const isImageUploadPartialSuccess =
            result.code === 'IMAGE_UPLOAD_FAILED' || message === REVIEW_ERROR_MESSAGES.IMAGE_UPLOAD_FAILED;
          if (isImageUploadPartialSuccess) {
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
        qc.invalidateQueries({ queryKey: ['business-reviews', businessDetail?.id ?? id] });
        qc.invalidateQueries({ queryKey: ['business', businessDetail?.id ?? id] });
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
      const successMessage = isEditMode
        ? 'Your review changes were saved.'
        : 'Thanks for sharing your experience.';
      if (partialSuccessWarningMessage) {
        showSubmissionFeedback('warning', 'Review submitted', partialSuccessWarningMessage);
      } else {
        showSubmissionFeedback('success', successTitle, successMessage);
      }

      if (!partialSuccessWarningMessage) {
        try {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // Non-blocking celebratory haptic.
        }
      }

      if (!isEditMode && !partialSuccessWarningMessage) {
        setShowSuccessConfetti(true);
      }

      if (user?.id && !isEditMode) {
        apiFetch<{ ok?: boolean; newBadges?: UserBadgeDto[] }>(
          '/api/badges/check-and-award',
          { method: 'POST', timeoutMs: 10_000, signal: abortController.signal }
        )
          .then((badgeResult) => {
            if ((badgeResult?.newBadges ?? []).length > 0) {
              void qc.refetchQueries({ queryKey: ['user-badges', user.id] });
            }
          })
          .catch(() => {});
      }

      const redirectBusinessId = (() => {
        if (isBusinessReview) {
          if (typeof businessDetail?.id === 'string' && businessDetail.id.trim().length > 0) {
            return businessDetail.id;
          }
          return id;
        }
        const eventPayload = eventSpecial as Record<string, unknown> | null;
        const camelBusinessId =
          eventPayload && typeof eventPayload.businessId === 'string'
            ? eventPayload.businessId.trim()
            : '';
        if (camelBusinessId) return camelBusinessId;
        const snakeBusinessId =
          eventPayload && typeof eventPayload.business_id === 'string'
            ? eventPayload.business_id.trim()
            : '';
        if (snakeBusinessId) return snakeBusinessId;
        return null;
      })();

      const reviewParam =
        redirectBusinessId && submittedReviewId
          ? `?newReviewId=${encodeURIComponent(submittedReviewId)}`
          : '';
      const redirectTarget = redirectBusinessId
        ? routes.businessDetail(redirectBusinessId) + reviewParam
        : routes.home();

      if (successRedirectTimerRef.current) clearTimeout(successRedirectTimerRef.current);
      successRedirectTimerRef.current = setTimeout(() => {
        successRedirectTimerRef.current = null;
        setShowSuccessConfetti(false);
        router.replace(redirectTarget as never);
      }, reducedMotion ? 2000 : 1100);
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.details && typeof err.details === 'object'
          ? (err.details as Record<string, unknown>)
          : null;
        const detailsMessage =
          details && typeof details.message === 'string' ? details.message : undefined;
        const detailsError =
          details && typeof details.error === 'string' ? details.error : undefined;
        const message = getErrorMessage({
          message: detailsMessage || err.message,
          code: err.code,
          error: detailsError,
        });
        showSubmissionFeedback(
          'error',
          isEditMode ? 'Review update failed' : 'Review submission failed',
          message
        );
        setFormError(message);
        return;
      }
      const fallbackMessage = err instanceof Error ? err.message : 'Failed to submit your review.';
      showSubmissionFeedback(
        'error',
        isEditMode ? 'Review update failed' : 'Review submission failed',
        fallbackMessage
      );
      setFormError(fallbackMessage);
    } finally {
      setSubmitting(false);
    }
  };

  let displayTitle = '';
  let displayImage: string | null = null;
  let businessName: string | null = null;
  let displayDate: string | null = null;
  let displayVenue: string | null = null;
  let displayValidUntil: string | null = null;

  if (isBusinessReview && businessDetail) {
    displayTitle = businessDetail.name ?? '';
    displayImage =
      (businessDetail as any).image_url ??
      (businessDetail as any).images?.[0] ??
      (businessDetail as any).image ??
      null;
  } else if (eventSpecial) {
    const es = eventSpecial as unknown as Record<string, unknown>;
    displayTitle = String(es.name ?? es.title ?? '');
    const firstArrayImage = Array.isArray(es.images) ? es.images[0] : null;
    const displayImageCandidate = es.image ?? es.imageUrl ?? es.image_url ?? firstArrayImage ?? null;
    displayImage =
      typeof displayImageCandidate === 'string' && displayImageCandidate.trim().length > 0
        ? displayImageCandidate.trim()
        : null;
    businessName = String(es.businessName ?? es.business_name ?? '') || null;
    if (type === 'event') {
      displayDate = eventSpecial.startDate ?? null;
      displayVenue = String(es.venue ?? es.venue_name ?? '') || null;
    } else {
      const validUntil = es.valid_until ?? es.validUntil ?? null;
      if (validUntil) {
        try {
          displayValidUntil = new Date(String(validUntil)).toLocaleDateString();
        } catch {
          displayValidUntil = null;
        }
      }
    }
  }

  const linkedBusinessId = useMemo(() => {
    if (isBusinessReview) {
      if (typeof businessDetail?.id === 'string' && businessDetail.id.trim().length > 0) return businessDetail.id;
      return typeof id === 'string' && id.trim().length > 0 ? id : null;
    }
    const es = eventSpecial as unknown as Record<string, unknown> | null;
    const camelId = es && typeof es.businessId === 'string' ? es.businessId.trim() : '';
    if (camelId) return camelId;
    const snakeId = es && typeof es.business_id === 'string' ? es.business_id.trim() : '';
    return snakeId || null;
  }, [businessDetail?.id, eventSpecial, id, isBusinessReview]);

  const savedBusinessIds = useMemo(() => {
    const ids = ((savedQuery.data?.businesses ?? []) as Array<{ id?: string | null }>)
      .map((savedItem) => savedItem?.id)
      .filter((savedId: string | null | undefined): savedId is string => typeof savedId === 'string' && savedId.trim().length > 0);
    return new Set(ids);
  }, [savedQuery.data?.businesses]);

  const isLinkedBusinessSaved = Boolean(linkedBusinessId && savedBusinessIds.has(linkedBusinessId));

  const handleHeaderShare = useCallback(async () => {
    const origin = ENV.apiBaseUrl || 'https://www.sayso.co.za';
    const shareTitle = displayTitle || 'Sayso';
    const targetPath = isBusinessReview
      ? routes.businessDetail((businessDetail?.id ?? id) || id)
      : type === 'special'
        ? routes.specialDetail(id)
        : routes.eventDetail(id);

    try {
      await Share.share({
        title: shareTitle,
        message: `Check out ${shareTitle} on Sayso\n${origin}${targetPath}`,
      });
    } catch {
      // Non-blocking.
    }
  }, [businessDetail?.id, displayTitle, id, isBusinessReview, type]);

  const handleHeaderSave = useCallback(async () => {
    if (!linkedBusinessId) {
      Alert.alert('Save unavailable', 'Saving is unavailable for this listing.');
      return;
    }
    if (!user) {
      router.push(routes.onboarding() as never);
      return;
    }
    if (saveBusy) return;

    setSaveBusy(true);
    try {
      if (savedBusinessIds.has(linkedBusinessId)) {
        await apiFetch<{ success?: boolean; message?: string }>(`/api/user/saved?business_id=${linkedBusinessId}`, {
          method: 'DELETE',
        });
      } else {
        await apiFetch<{ success?: boolean; message?: string }>('/api/user/saved', {
          method: 'POST',
          body: JSON.stringify({ business_id: linkedBusinessId }),
        });
      }
      await savedQuery.refetch();
    } catch (error) {
      Alert.alert(
        'Save unavailable',
        error instanceof Error ? error.message : 'Unable to update saved items right now.'
      );
    } finally {
      setSaveBusy(false);
    }
  }, [linkedBusinessId, router, saveBusy, savedBusinessIds, savedQuery, user]);

  const headerRightActions = useMemo<BusinessHeaderRightAction[]>(
    () => [
      {
        key: 'share',
        icon: 'share-social-outline',
        onPress: () => {
          void handleHeaderShare();
        },
        accessibilityLabel: 'Share listing',
      },
      {
        key: 'save',
        icon: isLinkedBusinessSaved ? 'bookmark' : 'bookmark-outline',
        onPress: () => {
          void handleHeaderSave();
        },
        accessibilityLabel: linkedBusinessId
          ? isLinkedBusinessSaved
            ? 'Unsave business'
            : 'Save business'
          : 'Save unavailable',
        disabled: saveBusy,
      },
    ],
    [handleHeaderSave, handleHeaderShare, isLinkedBusinessSaved, linkedBusinessId, saveBusy]
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.safeAreaInner}>
        {!isBusinessReview ? (
          <LinearGradient
            colors={['rgba(125,155,118,0.12)', C.offWhite, 'rgba(114,47,55,0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        ) : null}

        <Stack.Screen
          options={{
            headerShown: true,
            headerShadowVisible: false,
            header: (props) => (
              <StackPageHeader {...props} onPressBack={handleBack} rightActions={headerRightActions} />
            ),
            headerStyle: { backgroundColor: C.coral },
            headerTintColor: '#FFFFFF',
          }}
        />

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {!isLoading && (
              isBusinessReview && businessDetail ? (
                <BusinessHeroCarousel
                  businessName={displayTitle}
                  images={heroImages}
                  rating={normalizeBusinessRating(businessDetail).rating}
                  verified={businessDetail.verified ?? undefined}
                  subcategorySlug={
                    businessDetail.primary_subcategory_slug ??
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
              )
            )}

            {!isLoading && displayTitle && !isBusinessReview ? (
              <ReviewTargetCard
                displayTitle={displayTitle}
                businessName={businessName}
                heroImages={heroImages}
                displayImage={displayImage}
                displayDate={displayDate}
                displayVenue={displayVenue}
                displayValidUntil={displayValidUntil}
              />
            ) : null}

            <ReviewFormCard
              user={user}
              isEditMode={isEditMode}
              displayTitle={displayTitle}
              existingReviewLoading={existingReviewLoading}
              controlsDisabled={controlsDisabled}
              formOpacity={formOpacity}
              formTranslateY={formTranslateY}
              sectionAnims={sectionAnims}
              rating={rating}
              onRatingChange={(value) => {
                setFormError(null);
                setRating(value);
              }}
              effectiveQuickTags={effectiveQuickTags}
              selectedTags={selectedTags}
              onTagToggle={(tag) => {
                setFormError(null);
                handleTagToggle(tag);
              }}
              reviewTitle={reviewTitle}
              onReviewTitleChange={(value) => {
                setFormError(null);
                setReviewTitle(value);
              }}
              onTitleFocus={() => setTitleFocused(true)}
              onTitleBlur={() => setTitleFocused(false)}
              titleScale={titleScale}
              maxTitleChars={MAX_TITLE_CHARS}
              reviewText={reviewText}
              onReviewTextChange={(value) => {
                setFormError(null);
                setReviewText(value);
              }}
              onTextFocus={() => setTextFocused(true)}
              onTextBlur={() => setTextFocused(false)}
              textFocused={textFocused}
              bodyScale={bodyScale}
              charCount={charCount}
              maxChars={MAX_CHARS}
              showValidation={showValidation}
              minCharsRemaining={MIN_CHARS - reviewText.trim().length}
              validationOpacity={validationOpacity}
              validationTranslateY={validationTranslateY}
              progressAnim={progressAnim}
              reducedMotion={reducedMotion}
              promptIndex={promptIndex}
              selectedImages={selectedImages}
              thumbScales={thumbScales}
              onPreviewImage={setPreviewUri}
              onRemoveImage={handleRemoveImage}
              onAddPhoto={handleAddPhoto}
              maxPhotos={MAX_PHOTOS}
              formError={formError}
              isFormValid={isFormValid}
              isSubmitDisabled={isSubmitDisabled}
              submitting={submitting}
              onSubmit={handleSubmit}
            />

            <CommunityReviewsSection reviews={communityReviews} isLoading={communityReviewsLoading} />

            {!isLoading && displayTitle && !isBusinessReview ? (
              <ReviewContextCard
                type={type === 'event' ? 'event' : 'special'}
                displayImage={displayImage}
                displayTitle={displayTitle}
                businessName={businessName}
                displayDate={displayDate}
                displayVenue={displayVenue}
                displayValidUntil={displayValidUntil}
              />
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>

        <ReviewConfettiOverlay visible={showSuccessConfetti} />
        <ReviewStatusFeedback notificationNotice={notificationNotice} toastNotice={toastNotice} />
      </View>

      <ImagePreviewOverlay previewUri={previewUri} onClose={() => setPreviewUri(null)} />
    </SafeAreaView>
  );
}
