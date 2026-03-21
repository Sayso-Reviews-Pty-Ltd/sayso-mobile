import { useEffect, type Dispatch, type SetStateAction } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../../lib/api';
import {
  filterKnownInterestIds,
  normalizePreferencesFromApi,
  parseStoredIds,
} from './helpers';
import type { PreferencesResponseDto } from './types';

type UseSubcategoriesHydrationParams = {
  setInterestIds: Dispatch<SetStateAction<string[]>>;
  setSelected: Dispatch<SetStateAction<Set<string>>>;
};

export function useSubcategoriesHydration({
  setInterestIds,
  setSelected,
}: UseSubcategoriesHydrationParams) {
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const [storedInterestsRaw, storedSubcategoriesRaw] = await Promise.all([
          AsyncStorage.getItem('onboarding_interests'),
          AsyncStorage.getItem('onboarding_subcategories'),
        ]);

        const parsedInterests = parseStoredIds(storedInterestsRaw);
        const parsedSubcategories = parseStoredIds(storedSubcategoriesRaw);

        if (!cancelled && parsedInterests.length > 0) {
          setInterestIds(filterKnownInterestIds(parsedInterests));
        }
        if (!cancelled && parsedSubcategories.length > 0) {
          setSelected(new Set(parsedSubcategories));
        }

        if (parsedInterests.length > 0 && parsedSubcategories.length > 0) {
          return;
        }

        const preferences = await apiFetch<PreferencesResponseDto>('/api/user/preferences');
        const { apiInterestIds, apiSubcategories } = normalizePreferencesFromApi(preferences);

        if (!cancelled && parsedInterests.length === 0 && apiInterestIds.length > 0) {
          setInterestIds(apiInterestIds);
          await AsyncStorage.setItem('onboarding_interests', JSON.stringify(apiInterestIds));
        }

        if (!cancelled && parsedSubcategories.length === 0 && apiSubcategories.length > 0) {
          setSelected(new Set(apiSubcategories));
          await AsyncStorage.setItem('onboarding_subcategories', JSON.stringify(apiSubcategories));
        }
      } catch {
        // Ignore hydration errors; users can continue selecting in-session.
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [setInterestIds, setSelected]);
}
