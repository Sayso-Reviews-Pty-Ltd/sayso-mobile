import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { apiFetch } from '../../lib/api';
import {
  useNotificationsList,
  useMarkAllRead,
  useMarkOneRead,
  useDismissNotification,
} from '../../hooks/useNotificationsList';
import {
  createTestQueryClient,
  renderHookWithQuery,
} from '../utils/renderWithProviders';

jest.mock('../../lib/api', () => ({ apiFetch: jest.fn() }));
const mockApiFetch = apiFetch as unknown as jest.Mock;

describe('useNotificationsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockImplementation((path: string) => {
      if (path.includes('/api/notifications/user')) {
        return Promise.resolve({ notifications: [] });
      }
      return Promise.resolve({ ok: true });
    });
  });

  it('fetches notifications on mount', async () => {
    mockApiFetch.mockResolvedValueOnce({ notifications: [] });
    const { result } = renderHookWithQuery(() => useNotificationsList());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/notifications/user?limit=30');
  });

  it('uses default limit of 30', async () => {
    mockApiFetch.mockResolvedValueOnce({ notifications: [] });
    renderHookWithQuery(() => useNotificationsList());

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/api/notifications/user?limit=30');
    });
  });

  it('accepts a custom limit param', async () => {
    mockApiFetch.mockResolvedValueOnce({ notifications: [] });
    renderHookWithQuery(() => useNotificationsList(10));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/api/notifications/user?limit=10');
    });
  });

  it('staleTime is 15 seconds', () => {
    mockApiFetch.mockResolvedValueOnce({ notifications: [] });
    const { queryClient } = renderHookWithQuery(() => useNotificationsList());
    const query = queryClient.getQueryCache().find({ queryKey: ['notifications-list', 30] });
    expect((query?.options as { staleTime?: number } | undefined)?.staleTime).toBe(15_000);
  });
});

describe('useMarkAllRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockImplementation((path: string) => {
      if (path.includes('/api/notifications/user')) {
        return Promise.resolve({ notifications: [] });
      }
      return Promise.resolve({ ok: true });
    });
  });

  it('calls POST /api/notifications/user/mark-all-read', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useMarkAllRead(), { wrapper });

    mockApiFetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/notifications/user/mark-all-read', {
      method: 'POST',
    });
  });

  it('invalidates notifications-list query on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(['notifications-list', 30], { notifications: [] });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useMarkAllRead(), { wrapper });

    mockApiFetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(queryClient.getQueryState(['notifications-list', 30])?.isInvalidated).toBe(true);
  });
});

describe('useMarkOneRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls POST /api/notifications/user/{id}/mark-read', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useMarkOneRead(), { wrapper });

    mockApiFetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      await result.current.mutateAsync('notif-42');
    });

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/notifications/user/notif-42/mark-read',
      { method: 'POST' }
    );
  });

  it('invalidates notifications-list query on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(['notifications-list', 30], { notifications: [] });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useMarkOneRead(), { wrapper });

    mockApiFetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      await result.current.mutateAsync('notif-42');
    });

    expect(queryClient.getQueryState(['notifications-list', 30])?.isInvalidated).toBe(true);
  });
});

describe('useDismissNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls DELETE /api/notifications/user/{id}', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useDismissNotification(), { wrapper });

    mockApiFetch.mockResolvedValueOnce(null);

    await act(async () => {
      await result.current.mutateAsync('notif-99');
    });

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/notifications/user/notif-99',
      { method: 'DELETE' }
    );
  });

  it('invalidates notifications-list query on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(['notifications-list', 30], { notifications: [] });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useDismissNotification(), { wrapper });

    mockApiFetch.mockResolvedValueOnce(null);

    await act(async () => {
      await result.current.mutateAsync('notif-99');
    });

    expect(queryClient.getQueryState(['notifications-list', 30])?.isInvalidated).toBe(true);
  });
});
