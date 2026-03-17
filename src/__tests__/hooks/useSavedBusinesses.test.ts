import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { useSavedBusinesses, useUnsaveBusiness } from '../../hooks/useSavedBusinesses';
import { useAuthSession } from '../../hooks/useSession';
import { createTestQueryClient, renderHookWithQuery } from '../utils/renderWithProviders';

jest.mock('@sayso/contracts', () => ({}));
jest.mock('../../lib/api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../hooks/useSession', () => ({
  useAuthSession: jest.fn(),
}));

const mockApiFetch = apiFetch as unknown as jest.Mock;
const mockUseAuthSession = useAuthSession as jest.Mock;

// ─── useSavedBusinesses ────────────────────────────────────────────────────────

describe('useSavedBusinesses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockResolvedValue({ data: [] });
  });

  it('does not fetch when user is null', () => {
    mockUseAuthSession.mockReturnValue({ user: null, isLoading: false });
    const { result } = renderHookWithQuery(() => useSavedBusinesses());
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('does not fetch while auth is still loading', () => {
    mockUseAuthSession.mockReturnValue({ user: null, isLoading: true });
    const { result } = renderHookWithQuery(() => useSavedBusinesses());
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('fetches /api/user/saved when user is authenticated', async () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const { result } = renderHookWithQuery(() => useSavedBusinesses());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith('/api/user/saved');
  });

  it('uses "saved-businesses" as the query key', () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const { queryClient } = renderHookWithQuery(() => useSavedBusinesses());
    const query = queryClient.getQueryCache().find({ queryKey: ['saved-businesses'] });
    expect(query).toBeDefined();
  });

  it('staleTime is 30 seconds', () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const { queryClient } = renderHookWithQuery(() => useSavedBusinesses());
    const query = queryClient.getQueryCache().find({ queryKey: ['saved-businesses'] });
    expect((query?.options as { staleTime?: number })?.staleTime).toBe(30_000);
  });

  it('returns the API response data', async () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const saved = { data: [{ id: 'biz-1', name: 'Cafe Luna' }] };
    mockApiFetch.mockResolvedValueOnce(saved);

    const { result } = renderHookWithQuery(() => useSavedBusinesses());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(saved);
  });
});

// ─── useUnsaveBusiness ─────────────────────────────────────────────────────────

describe('useUnsaveBusiness', () => {
  beforeEach(() => jest.clearAllMocks());

  function renderWithClient() {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    const rendered = renderHook(() => useUnsaveBusiness(), { wrapper });
    return { ...rendered, queryClient };
  }

  it('calls DELETE /api/user/saved?business_id={id}', async () => {
    mockApiFetch.mockResolvedValueOnce({ ok: true });
    const { result } = renderWithClient();

    await act(async () => {
      await result.current.mutateAsync('biz-123');
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/user/saved?business_id=biz-123', {
      method: 'DELETE',
    });
  });

  it('invalidates the saved-businesses query on success', async () => {
    mockApiFetch.mockResolvedValueOnce({ ok: true });
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['saved-businesses'], { data: [] });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useUnsaveBusiness(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('biz-abc');
    });

    expect(queryClient.getQueryState(['saved-businesses'])?.isInvalidated).toBe(true);
  });

  it('accepts any businessId string', async () => {
    mockApiFetch.mockResolvedValueOnce({ ok: true });
    const { result } = renderWithClient();

    await act(async () => {
      await result.current.mutateAsync('some-business-uuid-here');
    });

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/user/saved?business_id=some-business-uuid-here',
      { method: 'DELETE' }
    );
  });
});
