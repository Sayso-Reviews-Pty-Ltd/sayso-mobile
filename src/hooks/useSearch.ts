import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import type { BusinessListItemDto } from '@sayso/contracts';

interface SearchResponse {
  businesses: BusinessListItemDto[];
  meta?: { usedFallback?: boolean; query?: string };
}

export function useSearch(query: string, limit = 20) {
  return useQuery({
    queryKey: ['search', query, limit],
    queryFn: () =>
      apiFetch<SearchResponse>(
        `/api/businesses/search?query=${encodeURIComponent(query)}&limit=${limit}`
      ),
    enabled: query.trim().length >= 2,
    staleTime: 10_000,
  });
}
