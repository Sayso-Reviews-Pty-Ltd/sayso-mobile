import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../lib/api';
import { GRID } from './constants';
import type { ApiResponse } from './types';

export function useReviewerProfileController() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [imgError, setImgError] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(GRID * 2)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(GRID * 2)).current;

  const { data, isLoading, error } = useQuery({
    queryKey: ['reviewer-profile', id],
    queryFn: () => apiFetch<ApiResponse>(`/api/reviewers/${id}`),
    enabled: Boolean(id),
    staleTime: 60_000,
  });

  const reviewer = data?.reviewer ?? null;

  useEffect(() => {
    if (!reviewer) {
      return;
    }

    const ease = Easing.out(Easing.cubic);
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 260,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(headerY, {
        toValue: 0,
        duration: 260,
        easing: ease,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 280,
          easing: ease,
          useNativeDriver: true,
        }),
        Animated.timing(contentY, {
          toValue: 0,
          duration: 280,
          easing: ease,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [contentOpacity, contentY, headerOpacity, headerY, reviewer]);

  const displayedReviews = useMemo(() => {
    if (!reviewer) {
      return [];
    }

    return showAllReviews ? reviewer.reviews : reviewer.reviews.slice(0, 2);
  }, [reviewer, showAllReviews]);

  return {
    contentOpacity,
    contentY,
    displayedReviews,
    error,
    handleBack: () => router.back(),
    headerOpacity,
    headerY,
    imgError,
    insets,
    isLoading,
    onImageError: () => setImgError(true),
    reviewer,
    showAllReviews,
    toggleShowAllReviews: () => setShowAllReviews((value) => !value),
  };
}
