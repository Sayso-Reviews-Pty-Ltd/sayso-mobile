import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { useUserReviews, useDeleteUserReview } from '../../hooks/useUserReviews';
import { useAuthSession } from '../../hooks/useSession';
import { createTestQueryClient, renderHookWithQuery } from '../utils/renderWithProviders';

jest.mock('../../lib/api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../hooks/useSession', () => ({
  useAuthSession: jest.fn(),
}));

const mockApiFetch = apiFetch as unknown as jest.Mock;
const mockUseAuthSession = useAuthSession as jest.Mock;

const EMPTY_RESPONSE = {
  data: { data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0, hasMore: false } },
  error: null,
};

// ─── useUserReviews ────────────────────────────────────────────────────────────

describe('useUserReviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockResolvedValue(EMPTY_RESPONSE);
  });

  it('is disabled when user is null', () => {
    mockUseAuthSession.mockReturnValue({ user: null, isLoading: false });
    const { result } = renderHookWithQuery(() => useUserReviews());
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('is disabled while auth is loading', () => {
    mockUseAuthSession.mockReturnValue({ user: null, isLoading: true });
    const { result } = renderHookWithQuery(() => useUserReviews());
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('fetches /api/user/reviews when user is authenticated', async () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const { result } = renderHookWithQuery(() => useUserReviews());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith('/api/user/reviews?page=1&pageSize=20');
  });

  it('includes user id in the query key', () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-abc' }, isLoading: false });
    const { queryClient } = renderHookWithQuery(() => useUserReviews());
    const query = queryClient.getQueryCache().find({
      queryKey: ['user-reviews', 'user-abc'],
    });
    expect(query).toBeDefined();
  });

  it('staleTime is 30 seconds', () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const { queryClient } = renderHookWithQuery(() => useUserReviews());
    const query = queryClient.getQueryCache().find({ queryKey: ['user-reviews', 'user-1'] });
    expect((query?.options as { staleTime?: number })?.staleTime).toBe(30_000);
  });

  it('returns fetched review data', async () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const review = {
      id: 'rev-1',
      business_id: 'biz-1',
      rating: 5,
      body: 'Loved it',
      created_at: '2024-01-01T00:00:00Z',
    };
    mockApiFetch.mockResolvedValueOnce({
      data: {
        data: [review],
        pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1, hasMore: false },
      },
      error: null,
    });

    const { result } = renderHookWithQuery(() => useUserReviews());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data?.data[0]).toMatchObject({ id: 'rev-1', rating: 5 });
  });
});

// ─── useDeleteUserReview ───────────────────────────────────────────────────────

describe('useDeleteUserReview', () => {
  beforeEach(() => jest.clearAllMocks());

  function renderWithClient(queryClient?: QueryClient) {
    const client = queryClient ?? createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client }, children);
    const rendered = renderHook(() => useDeleteUserReview(), { wrapper });
    return { ...rendered, queryClient: client };
  }

  it('calls DELETE /api/reviews/{reviewId}', async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true });
    const { result } = renderWithClient();

    await act(async () => {
      await result.current.mutateAsync('rev-123');
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/reviews/rev-123', { method: 'DELETE' });
  });

  it('invalidates user-reviews query on success', async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true });
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['user-reviews', 'user-1'], EMPTY_RESPONSE);

    const { result } = renderWithClient(queryClient);

    await act(async () => {
      await result.current.mutateAsync('rev-abc');
    });

    expect(queryClient.getQueryState(['user-reviews', 'user-1'])?.isInvalidated).toBe(true);
  });

  it('invalidates user-stats query on success', async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true });
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['user-stats'], { totalReviews: 5 });

    const { result } = renderWithClient(queryClient);

    await act(async () => {
      await result.current.mutateAsync('rev-abc');
    });

    expect(queryClient.getQueryState(['user-stats'])?.isInvalidated).toBe(true);
  });

  it('invalidates user-badges query on success', async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true });
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['user-badges'], { badges: [] });

    const { result } = renderWithClient(queryClient);

    await act(async () => {
      await result.current.mutateAsync('rev-abc');
    });

    expect(queryClient.getQueryState(['user-badges'])?.isInvalidated).toBe(true);
  });

  it('invalidates profile query on success', async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true });
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['profile'], { username: 'test' });

    const { result } = renderWithClient(queryClient);

    await act(async () => {
      await result.current.mutateAsync('rev-abc');
    });

    expect(queryClient.getQueryState(['profile'])?.isInvalidated).toBe(true);
  });

  it('surfaces error when DELETE fails', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Server error'));
    const { result } = renderWithClient();

    await expect(
      act(async () => {
        await result.current.mutateAsync('rev-bad');
      })
    ).rejects.toThrow('Server error');
  });
});
