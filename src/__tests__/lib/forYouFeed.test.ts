import { ApiError, apiFetch } from '../../lib/api';
import { fetchForYouFeedPage } from '../../lib/forYouFeed';

jest.mock('../../lib/api', () => {
  class MockApiError extends Error {
    status: number;
    code: string;
    requestId: string | null;
    retriable: boolean;
    details: unknown;

    constructor({
      status,
      code,
      message,
      requestId,
      retriable,
      details,
    }: {
      status: number;
      code: string;
      message: string;
      requestId?: string | null;
      retriable?: boolean;
      details?: unknown;
    }) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.code = code;
      this.requestId = requestId ?? null;
      this.retriable = Boolean(retriable);
      this.details = details;
    }
  }

  return {
    apiFetch: jest.fn(),
    ApiError: MockApiError,
  };
});

const mockApiFetch = apiFetch as jest.Mock;

describe('fetchForYouFeedPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls ranked strategy first with location and radius', async () => {
    mockApiFetch.mockResolvedValueOnce({
      items: [{ id: 'biz-1', fallback_tier: 'tier_1' }],
      nextCursor: null,
      meta: { sparse: false },
    });

    await fetchForYouFeedPage({
      limit: 20,
      cursor: null,
      preferenceIds: {
        interests: ['int-1'],
        subcategories: ['sub-1'],
        dealbreakers: ['db-1'],
      },
      location: { lat: -33.9249, lng: 18.4241, source: 'fallback' },
    });

    const url: string = mockApiFetch.mock.calls[0][0];
    expect(url).toContain('/api/businesses');
    expect(url).toContain('feed_strategy=for_you_ranked');
    expect(url).toContain('lat=-33.9249');
    expect(url).toContain('lng=18.4241');
    expect(url).toContain('radius_km=50');
    expect(url).toContain('interest_ids=int-1');
    expect(url).toContain('sub_interest_ids=sub-1');
    expect(url).toContain('dealbreakers=db-1');
  });

  it('falls back to mixed strategy on unsupported ranked status', async () => {
    mockApiFetch
      .mockRejectedValueOnce(
        new ApiError({
          status: 404,
          code: 'HTTP_404',
          message: 'Not found',
        })
      )
      .mockResolvedValueOnce({ businesses: [{ id: 'biz-2' }] });

    const result = await fetchForYouFeedPage({
      limit: 20,
      cursor: null,
      preferenceIds: {
        interests: ['int-1'],
        subcategories: [],
        dealbreakers: [],
      },
      location: { lat: -33.9249, lng: 18.4241, source: 'fallback' },
    });

    expect(mockApiFetch).toHaveBeenCalledTimes(2);
    const firstUrl: string = mockApiFetch.mock.calls[0][0];
    const secondUrl: string = mockApiFetch.mock.calls[1][0];
    expect(firstUrl).toContain('feed_strategy=for_you_ranked');
    expect(secondUrl).toContain('feed_strategy=mixed');
    expect(result.usedLegacyFallback).toBe(true);
    expect(result.items).toHaveLength(1);
  });

  it('rethrows non-unsupported ranked errors', async () => {
    mockApiFetch.mockRejectedValueOnce(
      new ApiError({
        status: 500,
        code: 'HTTP_500',
        message: 'Server error',
      })
    );

    await expect(
      fetchForYouFeedPage({
        limit: 20,
        cursor: null,
        preferenceIds: {
          interests: ['int-1'],
          subcategories: [],
          dealbreakers: [],
        },
        location: { lat: -33.9249, lng: 18.4241, source: 'fallback' },
      })
    ).rejects.toBeInstanceOf(ApiError);
  });
});
