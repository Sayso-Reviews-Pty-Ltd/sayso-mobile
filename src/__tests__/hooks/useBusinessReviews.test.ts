import { waitFor } from '@testing-library/react-native';
import { apiFetch } from '../../lib/api';
import { useBusinessReviews } from '../../hooks/useBusinessReviews';
import { renderHookWithQuery } from '../utils/renderWithProviders';

jest.mock('../../lib/api', () => ({ apiFetch: jest.fn() }));

const mockApiFetch = apiFetch as unknown as jest.Mock;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeRawReview(overrides: Record<string, unknown> = {}) {
  return {
    id: 'rev-1',
    user_id: 'user-1',
    rating: 4,
    content: 'Great place!',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeReviewsResponse(count: number, overrides: Record<string, unknown> = {}) {
  return {
    reviews: Array.from({ length: count }, (_, i) =>
      makeRawReview({ id: `rev-${i + 1}`, user_id: `user-${i + 1}` })
    ),
    ...overrides,
  };
}

// ─── useBusinessReviews ────────────────────────────────────────────────────────

describe('useBusinessReviews', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches from /api/reviews with business_id parameter', async () => {
    mockApiFetch.mockResolvedValueOnce(makeReviewsResponse(0));
    const { result } = renderHookWithQuery(() => useBusinessReviews('biz-1'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/reviews?business_id=biz-1')
    );
  });

  it('fetches page 1 with offset 0 on first load', async () => {
    mockApiFetch.mockResolvedValueOnce(makeReviewsResponse(0));
    const { result } = renderHookWithQuery(() => useBusinessReviews('biz-1'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('offset=0')
    );
  });

  it('is disabled when businessId is empty', () => {
    const { result } = renderHookWithQuery(() => useBusinessReviews(''));
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('normalizes review data: maps content to body', async () => {
    mockApiFetch.mockResolvedValueOnce({
      reviews: [
        makeRawReview({
          id: 'rev-1',
          user_id: 'user-1',
          rating: 5,
          content: 'Amazing food!',
          created_at: '2024-06-01T10:00:00Z',
        }),
      ],
    });

    const { result } = renderHookWithQuery(() => useBusinessReviews('biz-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const firstItem = result.current.data?.pages[0].data[0];
    expect(firstItem?.id).toBe('rev-1');
    expect(firstItem?.rating).toBe(5);
    expect(firstItem?.body).toBe('Amazing food!');
    expect(firstItem?.created_at).toBe('2024-06-01T10:00:00Z');
  });

  it('normalizes nested user fields (username, display_name, avatar_url)', async () => {
    mockApiFetch.mockResolvedValueOnce({
      reviews: [
        makeRawReview({
          user: {
            username: 'johndoe',
            display_name: 'John Doe',
            avatar_url: 'https://cdn.test/av.jpg',
          },
        }),
      ],
    });

    const { result } = renderHookWithQuery(() => useBusinessReviews('biz-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const firstItem = result.current.data?.pages[0].data[0];
    expect(firstItem?.username).toBe('johndoe');
    expect(firstItem?.display_name).toBe('John Doe');
    expect(firstItem?.avatar_url).toBe('https://cdn.test/av.jpg');
  });

  it('handles missing user object gracefully', async () => {
    mockApiFetch.mockResolvedValueOnce({ reviews: [makeRawReview({ user: null })] });

    const { result } = renderHookWithQuery(() => useBusinessReviews('biz-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const firstItem = result.current.data?.pages[0].data[0];
    expect(firstItem?.username).toBeUndefined();
    expect(firstItem?.display_name).toBeUndefined();
  });

  it('normalizes review images from url field', async () => {
    mockApiFetch.mockResolvedValueOnce({
      reviews: [
        makeRawReview({
          images: [{ url: 'https://img.test/photo.jpg' }],
        }),
      ],
    });

    const { result } = renderHookWithQuery(() => useBusinessReviews('biz-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const images = result.current.data?.pages[0].data[0].images;
    expect(images?.[0].url).toBe('https://img.test/photo.jpg');
  });

  it('normalizes review images from image_url fallback', async () => {
    mockApiFetch.mockResolvedValueOnce({
      reviews: [
        makeRawReview({
          images: [{ image_url: 'https://img.test/fallback.jpg' }],
        }),
      ],
    });

    const { result } = renderHookWithQuery(() => useBusinessReviews('biz-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const images = result.current.data?.pages[0].data[0].images;
    expect(images?.[0].url).toBe('https://img.test/fallback.jpg');
  });

  it('handles missing reviews array by returning empty data', async () => {
    mockApiFetch.mockResolvedValueOnce({ reviews: undefined });

    const { result } = renderHookWithQuery(() => useBusinessReviews('biz-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages[0].data).toEqual([]);
  });

  // ── Pagination ─────────────────────────────────────────────────────────────

  it('hasMore is true when page is exactly full (10 items)', async () => {
    mockApiFetch.mockResolvedValueOnce(makeReviewsResponse(10));
    const { result } = renderHookWithQuery(() => useBusinessReviews('biz-1'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].pagination.hasMore).toBe(true);
  });

  it('hasMore is false when page has fewer than 10 items', async () => {
    mockApiFetch.mockResolvedValueOnce(makeReviewsResponse(3));
    const { result } = renderHookWithQuery(() => useBusinessReviews('biz-1'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].pagination.hasMore).toBe(false);
  });

  it('hasMore is false for an empty page', async () => {
    mockApiFetch.mockResolvedValueOnce(makeReviewsResponse(0));
    const { result } = renderHookWithQuery(() => useBusinessReviews('biz-1'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].pagination.hasMore).toBe(false);
  });

  it('page number is 1 for the initial page', async () => {
    mockApiFetch.mockResolvedValueOnce(makeReviewsResponse(5));
    const { result } = renderHookWithQuery(() => useBusinessReviews('biz-1'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].pagination.page).toBe(1);
  });

  it('staleTime is 30 seconds', () => {
    mockApiFetch.mockResolvedValueOnce(makeReviewsResponse(0));
    const { queryClient } = renderHookWithQuery(() => useBusinessReviews('biz-1'));
    const query = queryClient.getQueryCache().find({
      queryKey: ['business-reviews', 'biz-1'],
    });
    expect((query?.options as { staleTime?: number })?.staleTime).toBe(30_000);
  });
});
