import { TrendingListShell } from './trending-screen/TrendingListShell';
import { useTrendingController } from './trending-screen/useTrendingController';

export default function TrendingScreen() {
  const {
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
    keyExtractor,
    listRef,
    renderItem,
    setIsMapMode,
    state,
  } = useTrendingController();

  return (
    <TrendingListShell
      clearRatingFilter={clearRatingFilter}
      clearRadiusFilter={clearRadiusFilter}
      handleClearFilters={handleClearFilters}
      handleClearSearch={handleClearSearch}
      handleDistanceSelect={handleDistanceSelect}
      handleInputChange={handleInputChange}
      handleLoadMore={handleLoadMore}
      handleRatingSelect={handleRatingSelect}
      handleRefresh={handleRefresh}
      handleScroll={handleScroll}
      keyExtractor={keyExtractor}
      listRef={listRef}
      renderItem={renderItem}
      setIsMapMode={setIsMapMode}
      state={state}
    />
  );
}
