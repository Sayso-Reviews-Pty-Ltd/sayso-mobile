import type { BusinessListItemDto } from '@sayso/contracts';
import { ApiError, apiFetch } from './api';
import type { ForYouLocation } from '../hooks/useForYouLocation';

type PreferenceIds = {
  interests: string[];
  subcategories: string[];
  dealbreakers: string[];
};

type ForYouFetchParams = {
  limit: number;
  cursor?: string | null;
  preferenceIds: PreferenceIds;
  location: ForYouLocation;
};

type ForYouMeta = {
  sparse?: boolean;
  active_tiers?: string[];
  location_source?: string;
  radius_km?: number;
};

export type ForYouFeedPage = {
  items: BusinessListItemDto[];
  nextCursor: string | null;
  meta?: ForYouMeta | Record<string, unknown>;
  usedLegacyFallback: boolean;
};

const UNSUPPORTED_RANKED_STATUSES = new Set([400, 404, 422]);

function appendPreferenceParams(params: URLSearchParams, preferenceIds: PreferenceIds) {
  if (preferenceIds.interests.length > 0) {
    params.set('interest_ids', preferenceIds.interests.join(','));
  }
  if (preferenceIds.subcategories.length > 0) {
    params.set('sub_interest_ids', preferenceIds.subcategories.join(','));
  }
  if (preferenceIds.dealbreakers.length > 0) {
    params.set('dealbreakers', preferenceIds.dealbreakers.join(','));
  }
}

function normalizeForYouResponse(payload: unknown): Omit<ForYouFeedPage, 'usedLegacyFallback'> {
  if (Array.isArray(payload)) {
    return {
      items: payload as BusinessListItemDto[],
      nextCursor: null,
      meta: undefined,
    };
  }

  if (!payload || typeof payload !== 'object') {
    return {
      items: [],
      nextCursor: null,
      meta: undefined,
    };
  }

  const response = payload as {
    items?: BusinessListItemDto[];
    businesses?: BusinessListItemDto[];
    data?: BusinessListItemDto[];
    nextCursor?: string | null;
    cursorId?: string | null;
    meta?: ForYouMeta | Record<string, unknown>;
  };

  return {
    items: response.items ?? response.businesses ?? response.data ?? [],
    nextCursor:
      typeof response.nextCursor === 'string'
        ? response.nextCursor
        : response.nextCursor === null
          ? null
          : typeof response.cursorId === 'string'
            ? response.cursorId
            : null,
    meta: response.meta,
  };
}

function buildRankedParams({ limit, cursor, preferenceIds, location }: ForYouFetchParams) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('feed_strategy', 'for_you_ranked');
  params.set('lat', String(location.lat));
  params.set('lng', String(location.lng));
  params.set('radius_km', '50');
  if (cursor) {
    params.set('cursor', cursor);
  }
  appendPreferenceParams(params, preferenceIds);
  return params;
}

function buildMixedParams({ limit, cursor, preferenceIds }: Omit<ForYouFetchParams, 'location'>) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('feed_strategy', 'mixed');
  if (cursor) {
    params.set('cursor', cursor);
  }
  appendPreferenceParams(params, preferenceIds);
  return params;
}

export async function fetchForYouFeedPage(input: ForYouFetchParams): Promise<ForYouFeedPage> {
  const rankedParams = buildRankedParams(input);

  try {
    const rankedPayload = await apiFetch<unknown>(`/api/businesses?${rankedParams.toString()}`);
    return {
      ...normalizeForYouResponse(rankedPayload),
      usedLegacyFallback: false,
    };
  } catch (error) {
    if (!(error instanceof ApiError) || !UNSUPPORTED_RANKED_STATUSES.has(error.status)) {
      throw error;
    }
  }

  const mixedParams = buildMixedParams(input);
  const mixedPayload = await apiFetch<unknown>(`/api/businesses?${mixedParams.toString()}`);
  return {
    ...normalizeForYouResponse(mixedPayload),
    usedLegacyFallback: true,
  };
}
