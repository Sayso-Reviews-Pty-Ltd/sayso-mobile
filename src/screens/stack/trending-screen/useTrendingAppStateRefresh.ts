import { useEffect } from 'react';
import { AppState } from 'react-native';

type UseTrendingAppStateRefreshParams = {
  isSearching: boolean;
  refetchSearch: () => Promise<unknown>;
  refetchTrending: () => Promise<unknown>;
};

export function useTrendingAppStateRefresh({
  isSearching,
  refetchSearch,
  refetchTrending,
}: UseTrendingAppStateRefreshParams) {
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        return;
      }

      if (isSearching) {
        void refetchSearch();
      } else {
        void refetchTrending();
      }
    });

    return () => sub.remove();
  }, [isSearching, refetchSearch, refetchTrending]);
}
