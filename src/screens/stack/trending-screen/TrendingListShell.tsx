import { useMemo } from 'react';
import { View } from 'react-native';
import { EmptyState } from '../../../components/EmptyState';
import { ScreenTransitionScope } from '../../../components/motion/TransitionScope';
import { SkeletonBusinessCard } from '../../../components/feed/SkeletonBusinessCard';
import { LoadMoreButton } from '../../../components/feed/LoadMoreButton';
import { resolveDiscoveryZeroResults } from '../../../lib/discoveryRecovery';
import { TrendingScreenView } from './TrendingScreenView';
import { ActiveFilterBadges } from './ActiveFilterBadges';
import { TrendingFilters } from './TrendingFilters';
import { TrendingSearchHeader } from './TrendingSearchHeader';
import { ViewModeToggle } from './ViewModeToggle';
import { styles } from './trendingStyles';
import type { TrendingControllerState } from './types-extra';
import type { TrendingScreenViewProps } from './types';

type Props = {
  clearRatingFilter: () => void;
  clearRadiusFilter: () => void;
  handleClearEverything: () => void;
  handleBrowseTrendingReset: () => void;
  handleClearFilters: () => void;
  handleClearSearch: () => void;
  handleDistanceSelect: (km: number) => void;
  handleInputChange: (text: string) => void;
  handleLoadMore: () => void;
  handleRatingSelect: (rating: number) => void;
  handleRefresh: () => void;
  handleScroll: TrendingScreenViewProps['handleScroll'];
  keyExtractor: TrendingScreenViewProps['keyExtractor'];
  listRef: TrendingScreenViewProps['listRef'];
  renderItem: TrendingScreenViewProps['renderItem'];
  setIsMapMode: (isMapMode: boolean) => void;
  state: TrendingControllerState;
};

export function TrendingListShell({
  clearRatingFilter,
  clearRadiusFilter,
  handleClearEverything,
  handleBrowseTrendingReset,
  handleClearFilters,
  handleClearSearch,
  handleDistanceSelect,
  handleInputChange,
  handleLoadMore,
  handleRatingSelect,
  handleRefresh,
  handleScroll,
  keyExtractor,
  listRef,
  renderItem,
  setIsMapMode,
  state,
}: Props) {
  const {
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
    searchIsFetching,
    userLocation,
    visibleBusinesses,
  } = state;
  const activeFilterCount = Number(filters.minRating !== null) + Number(filters.radiusKm !== null);
  const hasSearchAndFilters = inputValue.trim().length > 0 && hasFilters;
  const searchRecovery = resolveDiscoveryZeroResults({
    query: debouncedQuery,
    minRating: filters.minRating,
    radiusKm: filters.radiusKm,
  });

  const handleSearchRecovery = () => {
    switch (searchRecovery.action) {
      case 'expand_radius':
        if (searchRecovery.nextRadiusKm !== null) {
          handleDistanceSelect(searchRecovery.nextRadiusKm);
        }
        break;
      case 'clear_radius':
        clearRadiusFilter();
        break;
      case 'lower_rating':
        if (searchRecovery.nextMinRating !== null) {
          handleRatingSelect(searchRecovery.nextMinRating);
        }
        break;
      case 'clear_rating':
        clearRatingFilter();
        break;
      case 'clear_search':
        handleClearSearch();
        break;
      case 'browse_trending':
        handleBrowseTrendingReset();
        break;
      default:
        break;
    }
  };

  const listHeader = useMemo(
    () => (
      <View>
        <TrendingSearchHeader
          activeFilterCount={activeFilterCount}
          hasSearchAndFilters={hasSearchAndFilters}
          inputValue={inputValue}
          isFetching={isSearching && searchIsFetching}
          onClear={handleClearSearch}
          onClearEverything={handleClearEverything}
          onInputChange={handleInputChange}
        />

        {isSearching ? (
          <TrendingFilters
            filters={filters}
            onSelectDistance={handleDistanceSelect}
            onSelectRating={handleRatingSelect}
          />
        ) : null}

        {hasFilters ? (
          <ActiveFilterBadges
            minRating={filters.minRating}
            radiusKm={filters.radiusKm}
            clearAllLabel={hasSearchAndFilters ? 'Clear everything' : 'Clear all'}
            onClearAll={hasSearchAndFilters ? handleClearEverything : handleClearFilters}
            onClearRating={clearRatingFilter}
            onClearRadius={clearRadiusFilter}
          />
        ) : null}

        <ViewModeToggle isMapMode={isMapMode} onSetMapMode={setIsMapMode} />
      </View>
    ),
    [
      activeFilterCount,
      clearRadiusFilter,
      clearRatingFilter,
      handleClearEverything,
      filters,
      handleClearFilters,
      handleClearSearch,
      handleDistanceSelect,
      handleInputChange,
      handleRatingSelect,
      hasSearchAndFilters,
      hasFilters,
      inputValue,
      isMapMode,
      isSearching,
      searchIsFetching,
      setIsMapMode,
    ]
  );

  const listFooter = useMemo(() => {
    if (isLoading) {
      return null;
    }

    if (hasMore) {
      return <LoadMoreButton onPress={handleLoadMore} />;
    }

    return <View style={styles.footerSpacer} />;
  }, [handleLoadMore, hasMore, isLoading]);

  const listEmpty = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.skeletonStack}>
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBusinessCard key={index} />
          ))}
        </View>
      );
    }

    if (isError) {
      return (
        <EmptyState
          icon="wifi-outline"
          title="Couldn't load businesses"
          message="Pull to refresh and try again."
        />
      );
    }

    if (isSearching) {
      return (
        <EmptyState
          icon="search-outline"
          title={`No results for "${debouncedQuery}"`}
          message={searchRecovery.message}
          actionLabel={searchRecovery.actionLabel}
          onAction={handleSearchRecovery}
        />
      );
    }

    return (
      <EmptyState
        icon="storefront-outline"
        title="No trending businesses yet"
        message="Check back shortly for updated recommendations."
      />
    );
  }, [
    debouncedQuery,
    handleSearchRecovery,
    isError,
    isLoading,
    isSearching,
    searchRecovery.actionLabel,
    searchRecovery.message,
  ]);

  return (
    <ScreenTransitionScope>
      <TrendingScreenView
        isMapMode={isMapMode}
        listHeader={listHeader}
        mapBusinesses={mapBusinesses}
        userLocation={userLocation}
        isLoading={isLoading}
        visibleBusinesses={visibleBusinesses}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        listEmpty={listEmpty}
        listFooter={listFooter}
        isRefetching={isRefetching}
        handleRefresh={handleRefresh}
        handleScroll={handleScroll}
        listRef={listRef}
      />
    </ScreenTransitionScope>
  );
}
