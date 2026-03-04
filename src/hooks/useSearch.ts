import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import type { BusinessListItemDto } from '@sayso/contracts';

interface SearchResponse {
  businesses?: BusinessListItemDto[];
  data?: BusinessListItemDto[];
  meta?: { usedFallback?: boolean; query?: string };
}

export function useSearch(query: string, limit = 20) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ['search', normalizedQuery, limit],
    queryFn: () =>
      apiFetch<SearchResponse>(`/api/businesses?q=${encodeURIComponent(normalizedQuery)}&limit=${limit}`),
    select: (response) => ({
      businesses: response.businesses ?? response.data ?? [],
      meta: response.meta,
    }),
    enabled: normalizedQuery.length >= 2,
    staleTime: 10_000,
  });
}
