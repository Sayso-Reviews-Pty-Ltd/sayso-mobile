import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { BusinessListItemDto } from '@sayso/contracts';
import { hasSparseForYouFallback } from '../lib/discoveryRecovery';
import { fetchForYouFeedPage } from '../lib/forYouFeed';
import { useForYouLocation } from './useForYouLocation';
import { useAuthSession } from './useSession';
import { useUserPreferences } from './useUserPreferences';

export function useForYouBusinesses(limit = 20, enabled = true) {
  const { user } = useAuthSession();
  const preferences = useUserPreferences(enabled);
  const location = useForYouLocation(enabled && Boolean(user?.id));

  const preferenceIds = useMemo(
    () => ({
      interests: preferences.interests.map((item) => item.id),
      subcategories: preferences.subcategories.map((item) => item.id),
      dealbreakers: preferences.dealbreakers.map((item) => item.id),
    }),
    [preferences.dealbreakers, preferences.interests, preferences.subcategories]
  );

  const hasPreferences =
    preferenceIds.interests.length > 0 ||
    preferenceIds.subcategories.length > 0 ||
    preferenceIds.dealbreakers.length > 0;

  const query = useQuery({
    queryKey: ['for-you', user?.id, limit, preferenceIds, location],
    enabled: enabled && Boolean(user?.id) && !preferences.isLoading && hasPreferences,
    queryFn: async () => {
      const response = await fetchForYouFeedPage({
        limit,
        cursor: null,
        preferenceIds,
        location,
      });
      return response.items;
    },
    staleTime: 120_000,
    refetchOnReconnect: true,
  });

  return {
    businesses: query.data ?? [],
    hasSparseFallback: hasSparseForYouFallback(query.data ?? []),
    isLoading: enabled && Boolean(user?.id) && (preferences.isLoading || query.isLoading),
    error: query.error instanceof Error ? query.error.message : null,
    hasPreferences,
    refetch: async () => {
      await preferences.refetch();
      return query.refetch();
    },
  };
}
