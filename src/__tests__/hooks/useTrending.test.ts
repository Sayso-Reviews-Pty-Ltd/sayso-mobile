import { waitFor } from '@testing-library/react-native';
import { apiFetch } from '../../lib/api';
import { useTrending } from '../../hooks/useTrending';
import { renderHookWithQuery } from '../utils/renderWithProviders';

jest.mock('@sayso/contracts', () => ({}));
jest.mock('../../lib/api', () => ({ apiFetch: jest.fn() }));

const mockApiFetch = apiFetch as jest.Mock;

const TRENDING_RESPONSE = {
  businesses: [{ id: 'biz-1', name: 'Trending Spot' }],
  meta: { count: 1 },
};

describe('useTrending', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockResolvedValue(TRENDING_RESPONSE);
  });

  // ─── Endpoint ─────────────────────────────────────────────────────────────

  it('fetches /api/trending with the default limit of 20', async () => {
    renderHookWithQuery(() => useTrending());
    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled());
    expect(mockApiFetch).toHaveBeenCalledWith('/api/trending?limit=20');
  });

  it('uses the provided limit', async () => {
    renderHookWithQuery(() => useTrending(5));
    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled());
    expect(mockApiFetch).toHaveBeenCalledWith('/api/trending?limit=5');
  });

  // ─── Query key ────────────────────────────────────────────────────────────

  it('uses ["trending", 20] as the query key (default)', () => {
    const { queryClient } = renderHookWithQuery(() => useTrending());
    expect(
      queryClient.getQueryCache().find({ queryKey: ['trending', 20] }),
    ).toBeDefined();
  });

  it('includes the limit in the query key', () => {
    const { queryClient } = renderHookWithQuery(() => useTrending(7));
    expect(
      queryClient.getQueryCache().find({ queryKey: ['trending', 7] }),
    ).toBeDefined();
  });

  // ─── staleTime ────────────────────────────────────────────────────────────

  it('staleTime is 120 000ms', () => {
    const { queryClient } = renderHookWithQuery(() => useTrending());
    const query = queryClient.getQueryCache().find({ queryKey: ['trending', 20] });
    expect((query?.options as { staleTime?: number })?.staleTime).toBe(120_000);
  });

  // ─── enabled flag ─────────────────────────────────────────────────────────

  it('does not fetch when enabled=false', () => {
    renderHookWithQuery(() => useTrending(20, false));
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('is idle when enabled=false', () => {
    const { result } = renderHookWithQuery(() => useTrending(20, false));
    expect(result.current.fetchStatus).toBe('idle');
  });

  // ─── Return value ─────────────────────────────────────────────────────────

  it('returns data on success', async () => {
    const { result } = renderHookWithQuery(() => useTrending());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(TRENDING_RESPONSE);
  });

  it('isLoading is true before response resolves', async () => {
    let resolveRequest!: (v: unknown) => void;
    mockApiFetch.mockReturnValueOnce(
      new Promise((res) => { resolveRequest = res; }),
    );

    const { result } = renderHookWithQuery(() => useTrending());
    expect(result.current.isLoading).toBe(true);

    resolveRequest(TRENDING_RESPONSE);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('exposes error on fetch failure', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Server error'));
    const { result } = renderHookWithQuery(() => useTrending());
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
