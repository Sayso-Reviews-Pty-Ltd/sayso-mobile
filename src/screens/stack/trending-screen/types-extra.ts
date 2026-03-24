import type { BusinessListItemDto } from '@sayso/contracts';

export type FilterState = {
  minRating: number | null;
  radiusKm: number | null;
};

export type TrendingControllerState = {
  debouncedQuery: string;
  filters: FilterState;
  hasFilters: boolean;
  hasMore: boolean;
  inputValue: string;
  isError: boolean;
  isLoading: boolean;
  isMapMode: boolean;
  isRefetching: boolean;
  isSearching: boolean;
  mapBusinesses: BusinessListItemDto[];
  searchIsFetching: boolean;
  userLocation: { lat: number; lng: number } | null;
  visibleBusinesses: BusinessListItemDto[];
};
