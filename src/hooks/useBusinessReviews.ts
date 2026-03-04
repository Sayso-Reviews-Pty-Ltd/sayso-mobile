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

interface RawReviewItem {
  id: string;
  user_id: string;
  rating: number;
  content?: string;
  created_at: string;
  user?: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
  images?: {
    url?: string;
    image_url?: string;
  }[];
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
  const pageSize = 10;

  return useInfiniteQuery({
    queryKey: ['business-reviews', businessId],
    queryFn: async ({ pageParam = 1 }) => {
      const offset = (pageParam - 1) * pageSize;
      const response = await apiFetch<{
        reviews?: RawReviewItem[];
        count?: number;
      }>(`/api/reviews?business_id=${businessId}&limit=${pageSize}&offset=${offset}`);

      const data = (response.reviews ?? []).map((review) => ({
        id: review.id,
        user_id: review.user_id,
        username: review.user?.username ?? undefined,
        display_name: review.user?.display_name ?? undefined,
        avatar_url: review.user?.avatar_url ?? undefined,
        rating: review.rating,
        body: review.content,
        created_at: review.created_at,
        images: review.images?.map((image) => ({
          url: image.url ?? image.image_url ?? '',
        })),
      }));
      const hasMore = data.length === pageSize;

      return {
        data,
        pagination: {
          page: pageParam,
          pageSize,
          total: offset + data.length,
          totalPages: hasMore ? pageParam + 1 : pageParam,
          hasMore,
        },
      } satisfies ReviewsResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.page + 1 : undefined,
    enabled: !!businessId,
    staleTime: 30_000,
  });
}
