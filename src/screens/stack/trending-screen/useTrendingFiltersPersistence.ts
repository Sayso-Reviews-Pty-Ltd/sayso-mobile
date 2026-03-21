import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FilterState } from './types-extra';

type UseTrendingFiltersPersistenceParams = {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
};

export function useTrendingFiltersPersistence({
  filters,
  setFilters,
}: UseTrendingFiltersPersistenceParams) {
  const hydratedRef = useRef(false);

  useEffect(() => {
    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem('user_filters');
        if (raw) {
          const parsed: { minRating?: number | null; distanceKm?: number | null } = JSON.parse(raw);
          setFilters((previous) => ({
            minRating: parsed.minRating != null ? parsed.minRating : previous.minRating,
            radiusKm: parsed.distanceKm != null ? parsed.distanceKm : previous.radiusKm,
          }));
        }
      } catch {
        // no-op
      }
      hydratedRef.current = true;
    };

    void restore();
  }, [setFilters]);

  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }

    const save = async () => {
      try {
        await AsyncStorage.setItem(
          'user_filters',
          JSON.stringify({ minRating: filters.minRating, distanceKm: filters.radiusKm })
        );
      } catch {
        // no-op
      }
    };

    void save();
  }, [filters]);
}
