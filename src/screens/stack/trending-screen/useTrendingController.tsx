import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useNavigation } from 'expo-router';
import type { BusinessListItemDto } from '@sayso/contracts';
import { businessDetailColors } from '../../../components/business-detail/styles';
import { useBusinessSearch } from '../../../hooks/useBusinessSearch';
import { useGlobalScrollToTop } from '../../../hooks/useGlobalScrollToTop';
import { useRealtimeQueryInvalidation } from '../../../hooks/useRealtimeQueryInvalidation';
import { useTrending } from '../../../hooks/useTrending';
import { NAVBAR_BG_COLOR } from '../../../styles/colors';
import {
  BACK_TO_TOP_THRESHOLD,
  SCROLL_COLOR_THRESHOLD,
  VISIBLE_CHUNK,
} from './constants';
import { trendingKeyExtractor, trendingRenderItem } from './renderers';
import type { FilterState, TrendingControllerState } from './types-extra';
import { useTrendingAppStateRefresh } from './useTrendingAppStateRefresh';
import { useTrendingFiltersPersistence } from './useTrendingFiltersPersistence';

export function useTrendingController() {
  const navigation = useNavigation();
  const headerCollapsedRef = useRef(false);
  const pendingScrollYRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filters, setFilters] = useState<FilterState>({ minRating: null, radiusKm: null });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [isMapMode, setIsMapMode] = useState(false);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_CHUNK);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const listRef = useRef<FlatList<BusinessListItemDto>>(null);

  const isSearching = debouncedQuery.trim().length >= 1;
  const hasFilters = filters.minRating !== null || filters.radiusKm !== null;

  const trendingQuery = useTrending(50, !isSearching);
  const searchQuery = useBusinessSearch({
    query: debouncedQuery,
    minRating: filters.minRating,
    radiusKm: filters.radiusKm,
    lat: userLocation?.lat ?? null,
    lng: userLocation?.lng ?? null,
  });

  const allBusinesses = useMemo(
    () => (isSearching ? (searchQuery.data ?? []) : (trendingQuery.data?.businesses ?? [])),
    [isSearching, searchQuery.data, trendingQuery.data]
  );

  const isLoading = isSearching ? searchQuery.isLoading : trendingQuery.isLoading;
  const isError = isSearching ? searchQuery.isError : trendingQuery.isError;
  const isRefetching = (trendingQuery.isRefetching || searchQuery.isRefetching) && !isLoading;

  const visibleBusinesses = useMemo(
    () => allBusinesses.slice(0, visibleCount),
    [allBusinesses, visibleCount]
  );

  const hasMore = visibleCount < allBusinesses.length;

  const mapBusinesses = useMemo(
    () => allBusinesses.filter((business) => business.lat != null && business.lng != null),
    [allBusinesses]
  );

  const realtimeTargets = useMemo(
    () => [
      {
        key: 'trending-businesses',
        table: 'businesses',
        queryKeys: [['trending'], ['business-search']],
      },
      {
        key: 'trending-reviews',
        table: 'reviews',
        queryKeys: [['trending'], ['business-search']],
      },
      {
        key: 'trending-review-helpful-votes',
        table: 'review_helpful_votes',
        queryKeys: [['trending']],
      },
    ],
    []
  );

  useRealtimeQueryInvalidation(realtimeTargets);
  useTrendingFiltersPersistence({ filters, setFilters });

  useEffect(() => {
    setVisibleCount(VISIBLE_CHUNK);
  }, [isSearching, debouncedQuery]);

  useTrendingAppStateRefresh({
    isSearching,
    refetchSearch: searchQuery.refetch,
    refetchTrending: trendingQuery.refetch,
  });

  const handleInputChange = useCallback((text: string) => {
    setInputValue(text);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(text);
      setVisibleCount(VISIBLE_CHUNK);
    }, 300);
  }, []);

  const handleClearSearch = useCallback(() => {
    setInputValue('');
    setDebouncedQuery('');
    setVisibleCount(VISIBLE_CHUNK);
  }, []);

  const handleDistanceSelect = useCallback(
    (km: number) => {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // no-op
      }

      const next = filters.radiusKm === km ? null : km;
      setFilters((previous) => ({ ...previous, radiusKm: next }));

      if (next !== null && !userLocation) {
        void (async () => {
          const { granted } = await Location.requestForegroundPermissionsAsync();
          if (!granted) {
            return;
          }
          const pos = await Location.getCurrentPositionAsync({});
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        })();
      }
    },
    [filters.radiusKm, userLocation]
  );

  const handleRatingSelect = useCallback((rating: number) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // no-op
    }
    setFilters((previous) => ({
      ...previous,
      minRating: previous.minRating === rating ? null : rating,
    }));
  }, []);

  const clearRatingFilter = useCallback(() => {
    setFilters((previous) => ({ ...previous, minRating: null }));
  }, []);

  const clearRadiusFilter = useCallback(() => {
    setFilters((previous) => ({ ...previous, radiusKm: null }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ minRating: null, radiusKm: null });
    setUserLocation(null);
  }, []);

  const handleRefresh = useCallback(() => {
    setVisibleCount(VISIBLE_CHUNK);
    if (isSearching) {
      void searchQuery.refetch();
    } else {
      void trendingQuery.refetch();
    }
  }, [isSearching, searchQuery, trendingQuery]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((previous) => Math.min(previous + VISIBLE_CHUNK, allBusinesses.length));
  }, [allBusinesses.length]);

  const applyScrollState = useCallback(
    (y: number) => {
      const shouldShowBackToTop = y > BACK_TO_TOP_THRESHOLD;
      setShowBackToTop((current) =>
        current === shouldShowBackToTop ? current : shouldShowBackToTop
      );

      const collapsed = y > SCROLL_COLOR_THRESHOLD;
      if (collapsed === headerCollapsedRef.current) {
        return;
      }
      headerCollapsedRef.current = collapsed;
      navigation.setOptions({
        headerStyle: {
          backgroundColor: NAVBAR_BG_COLOR,
        },
        headerTintColor: businessDetailColors.white,
      });
    },
    [navigation]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      pendingScrollYRef.current = event.nativeEvent.contentOffset.y;
      if (scrollRafRef.current != null) {
        return;
      }
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        applyScrollState(pendingScrollYRef.current);
      });
    },
    [applyScrollState]
  );

  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  useGlobalScrollToTop({
    visible: showBackToTop,
    enabled: !isMapMode,
    onScrollToTop: handleScrollToTop,
  });

  useEffect(() => {
    if (isMapMode) {
      setShowBackToTop(false);
    }
  }, [isMapMode]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current != null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const state: TrendingControllerState = {
    debouncedQuery,
    filters,
    hasFilters,
    hasMore,
    inputValue,
    isError,
    isLoading,
    isMapMode,
    isRefetching,
    isSearching,
    mapBusinesses,
    searchIsFetching: searchQuery.isFetching,
    userLocation,
    visibleBusinesses,
  };

  return {
    clearRatingFilter,
    clearRadiusFilter,
    handleClearFilters,
    handleClearSearch,
    handleDistanceSelect,
    handleInputChange,
    handleLoadMore,
    handleRatingSelect,
    handleRefresh,
    handleScroll,
    keyExtractor: trendingKeyExtractor,
    listRef,
    renderItem: trendingRenderItem,
    setIsMapMode,
    state,
  };
}
