import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export interface ReviewItem {
  id: string;
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  rating: number;
  body?: string;
  created_at: string;
  images?: { url: string }[];
}

interface ReviewsResponse {
  data: ReviewItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function useBusinessReviews(businessId: string) {
  return useInfiniteQuery({
    queryKey: ['business-reviews', businessId],
    queryFn: ({ pageParam = 1 }) =>
      apiFetch<ReviewsResponse>(
        `/api/businesses/${businessId}/reviews?page=${pageParam}&pageSize=10`
      ),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.page + 1 : undefined,
    enabled: !!businessId,
    staleTime: 30_000,
  });
}
