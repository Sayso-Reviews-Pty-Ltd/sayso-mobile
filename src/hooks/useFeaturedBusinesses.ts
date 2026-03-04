import { useQuery } from '@tanstack/react-query';
import type { FeaturedBusinessDto, FeaturedBusinessesResponseDto } from '@sayso/contracts';
import { ENV } from '../lib/env';
import { supabase } from '../lib/supabase';

async function fetchWithAuth(path: string): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  return fetch(`${ENV.apiBaseUrl}${path}`, { headers });
}

type BusinessesFallbackResponse = {
  businesses?: FeaturedBusinessDto[];
  data?: FeaturedBusinessDto[];
};

export function useFeaturedBusinesses(limit = 12, region: string | null = null, enabled = true) {
  const query = useQuery({
    queryKey: ['featured-businesses', limit, region],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      if (region) params.set('region', region);

      let response = await fetchWithAuth(`/api/featured?${params.toString()}`);
      let source: 'primary' | 'fallback' = 'primary';

      if (response.status === 404) {
        source = 'fallback';
        const fallbackParams = new URLSearchParams();
        fallbackParams.set('limit', String(limit));
        fallbackParams.set('feed_strategy', 'standard');
        fallbackParams.set('sort_by', 'total_rating');
        fallbackParams.set('sort_order', 'desc');
        if (region) fallbackParams.set('location', region);
        response = await fetchWithAuth(`/api/businesses?${fallbackParams.toString()}`);
      }

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        const error = new Error(body || `HTTP ${response.status}`) as Error & { statusCode?: number };
        error.statusCode = response.status;
        throw error;
      }

      if (source === 'fallback') {
        const fallbackData = (await response.json()) as BusinessesFallbackResponse;
        const fallbackList = fallbackData.businesses ?? fallbackData.data ?? [];
        return fallbackList.map((business, index) => ({
          ...business,
          badge: 'featured' as const,
          rank: business.rank ?? index + 1,
          reviewCount: business.reviewCount ?? business.reviews ?? 0,
          monthAchievement: business.monthAchievement ?? 'Featured in the community',
          description: business.description ?? 'Featured in the community',
          category: business.category ?? business.category_label ?? 'miscellaneous',
          verified: Boolean(business.verified),
        }));
      }

      const payload = (await response.json()) as FeaturedBusinessesResponseDto | FeaturedBusinessDto[];
      if (Array.isArray(payload)) return payload;
      return payload.data ?? payload.businesses ?? [];
    },
    staleTime: 60_000,
  });

  const error = query.error as (Error & { statusCode?: number }) | null;

  return {
    featuredBusinesses: query.data ?? [],
    isLoading: enabled && query.isLoading,
    error: error?.message ?? null,
    statusCode: error?.statusCode ?? null,
    refetch: query.refetch,
  };
}
