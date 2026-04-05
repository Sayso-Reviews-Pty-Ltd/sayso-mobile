import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../../lib/api';
import { useAuthSession } from '../../../hooks/useSession';
import { useUserPreferences } from '../../../hooks/useUserPreferences';
import { haptics } from '../../../lib/haptics';
import { INTERESTS } from '../InterestsScreen';
import { SUBCATEGORY_MAP } from '../subcategories/constants';
import { DEALBREAKERS } from '../deal-breakers/constants';

export { INTERESTS, SUBCATEGORY_MAP, DEALBREAKERS };

export const MIN_INTERESTS = 3;
export const MAX_INTERESTS = 6;
export const MAX_SUBCATEGORIES = 10;
export const MAX_DEALBREAKERS = 3;

export function useEditPreferencesController() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthSession();

  const {
    interests: saved,
    subcategories: savedSubs,
    dealbreakers: savedDB,
    isLoading,
  } = useUserPreferences();

  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());
  const [selectedDB, setSelectedDB] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !hydrated) {
      setSelectedInterests(new Set(saved.map((i) => i.id)));
      setSelectedSubs(new Set(savedSubs.map((s) => s.id)));
      setSelectedDB(new Set(savedDB.map((d) => d.id)));
      setHydrated(true);
    }
  }, [isLoading, hydrated, saved, savedSubs, savedDB]);

  const toggleInterest = useCallback((id: string) => {
    haptics.navigation();
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        const group = SUBCATEGORY_MAP[id];
        if (group) {
          setSelectedSubs((prevSubs) => {
            const nextSubs = new Set(prevSubs);
            group.items.forEach((item) => nextSubs.delete(item.id));
            return nextSubs;
          });
        }
      } else if (next.size < MAX_INTERESTS) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSubcategory = useCallback((id: string) => {
    haptics.navigation();
    setSelectedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_SUBCATEGORIES) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleDealbreaker = useCallback((id: string) => {
    haptics.navigation();
    setSelectedDB((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_DEALBREAKERS) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const canSave =
    selectedInterests.size >= MIN_INTERESTS &&
    selectedSubs.size >= 1 &&
    selectedDB.size >= 1 &&
    !saving;

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    haptics.complete();
    setSaving(true);
    setError(null);
    try {
      const interestIds = Array.from(selectedInterests);
      const subcategoryIds = Array.from(selectedSubs);
      const dealBreakerIds = Array.from(selectedDB);

      // Save interests + dealbreakers first so subcategories endpoint
      // can validate against the updated interest set.
      await apiFetch('/api/user/preferences', {
        method: 'PUT',
        body: JSON.stringify({ interests: interestIds, dealBreakers: dealBreakerIds }),
      });

      await apiFetch('/api/onboarding/subcategories', {
        method: 'POST',
        body: JSON.stringify({ subcategories: subcategoryIds }),
      });

      queryClient.invalidateQueries({ queryKey: ['user-preferences', user?.id] });
      haptics.confirm();
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  }, [canSave, selectedInterests, selectedSubs, selectedDB, queryClient, user?.id, router]);

  return {
    selectedInterests,
    selectedSubs,
    selectedDB,
    isLoading,
    hydrated,
    saving,
    error,
    canSave,
    toggleInterest,
    toggleSubcategory,
    toggleDealbreaker,
    handleSave,
  };
}
