import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import type { FeaturedBusinessDto } from '@sayso/contracts';
import { useFeaturedBusinesses } from '../../../hooks/useFeaturedBusinesses';
import { useGlobalScrollToTop } from '../../../hooks/useGlobalScrollToTop';
import { useRealtimeQueryInvalidation } from '../../../hooks/useRealtimeQueryInvalidation';
import { useTopReviewers } from '../../../hooks/useTopReviewers';
import { markScreenReady } from '../../../lib/perf/perfMarkers';
import { normalizeInterestId } from './helpers';

const INITIAL_VISIBLE = 5;

type LeaderboardTab = 'contributors' | 'businesses';

export function useLeaderboardController(tabParam?: LeaderboardTab) {
  const initialTab: LeaderboardTab = tabParam === 'businesses' ? 'businesses' : 'contributors';

  const [activeTab, setActiveTab] = useState<LeaderboardTab>(initialTab);
  const [showAllContributors, setShowAllContributors] = useState(false);
  const [showAllBusinesses, setShowAllBusinesses] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState('all');
  const [businessesEnabled, setBusinessesEnabled] = useState(initialTab === 'businesses');

  useEffect(() => {
    if (tabParam === 'businesses' || tabParam === 'contributors') {
      setActiveTab(tabParam);
      if (tabParam === 'businesses') {
        setBusinessesEnabled(true);
      }
    }
  }, [tabParam]);

  const {
    reviewers,
    isLoading: loadingReviewers,
    error: reviewersError,
    refetch: refetchReviewers,
  } = useTopReviewers(20);
  const { featuredBusinesses, isLoading: loadingBusinesses } = useFeaturedBusinesses(
    50,
    null,
    businessesEnabled
  );

  const realtimeTargets = useMemo(
    () => [
      {
        key: 'leaderboard-reviews',
        table: 'reviews',
        queryKeys: [['top-reviewers'], ['featured-businesses']],
      },
      {
        key: 'leaderboard-review-helpful-votes',
        table: 'review_helpful_votes',
        queryKeys: [['top-reviewers']],
      },
      {
        key: 'leaderboard-businesses',
        table: 'businesses',
        queryKeys: [['featured-businesses']],
      },
    ],
    []
  );

  useRealtimeQueryInvalidation(realtimeTargets);

  useEffect(() => {
    if (!loadingReviewers && reviewers.length > 0) {
      markScreenReady('leaderboard');
    }
  }, [loadingReviewers, reviewers.length]);

  const scrollRef = useRef<ScrollView | null>(null);
  const scrollTopVisibleRef = useRef(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const setScrollTopVisible = useCallback((visible: boolean) => {
    if (scrollTopVisibleRef.current === visible) {
      return;
    }
    scrollTopVisibleRef.current = visible;
    setShowScrollTop(visible);
  }, []);

  const handleScrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  useGlobalScrollToTop({
    visible: showScrollTop,
    enabled: true,
    onScrollToTop: handleScrollToTop,
  });

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      setScrollTopVisible(y > 300);
    },
    [setScrollTopVisible]
  );

  const availableInterestIds = useMemo(() => {
    const ids = new Set<string>(
      featuredBusinesses.map((business) =>
        normalizeInterestId((business as any).interestId ?? (business as any).interest_id)
      )
    );
    return Array.from(ids).sort();
  }, [featuredBusinesses]);

  const sortedBusinesses = useMemo(() => {
    const filtered =
      selectedInterest === 'all'
        ? featuredBusinesses
        : featuredBusinesses.filter(
            (business) =>
              normalizeInterestId(
                (business as any).interestId ?? (business as any).interest_id
              ) === selectedInterest
          );

    return [...filtered].sort((businessA: FeaturedBusinessDto, businessB: FeaturedBusinessDto) => {
      const ratingA = businessA.totalRating ?? businessA.rating ?? 0;
      const ratingB = businessB.totalRating ?? businessB.rating ?? 0;
      return ratingB - ratingA;
    });
  }, [featuredBusinesses, selectedInterest]);

  const visibleContributors = showAllContributors
    ? reviewers
    : reviewers.slice(0, INITIAL_VISIBLE);
  const visibleBusinesses = showAllBusinesses
    ? sortedBusinesses
    : sortedBusinesses.slice(0, INITIAL_VISIBLE);

  const handleTabChange = useCallback(
    (tab: LeaderboardTab) => {
      setActiveTab(tab);
      if (tab === 'businesses' && !businessesEnabled) {
        setBusinessesEnabled(true);
      }
    },
    [businessesEnabled]
  );

  return {
    activeTab,
    availableInterestIds,
    handleScroll,
    handleTabChange,
    loadingBusinesses,
    loadingReviewers,
    refetchReviewers,
    reviewers,
    reviewersError,
    scrollRef,
    selectedInterest,
    setSelectedInterest,
    setShowAllBusinesses,
    setShowAllContributors,
    showAllBusinesses,
    showAllContributors,
    sortedBusinesses,
    visibleBusinesses,
    visibleContributors,
  };
}
