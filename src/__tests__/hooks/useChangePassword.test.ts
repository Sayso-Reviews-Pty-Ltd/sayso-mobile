import { act, renderHook } from '@testing-library/react-native';
import { apiFetch } from '../../lib/api';
import { useChangePassword } from '../../hooks/useChangePassword';

jest.mock('../../lib/api', () => ({ apiFetch: jest.fn() }));

const mockApiFetch = apiFetch as unknown as jest.Mock;

// Minimal React Query wrapper required for useMutation
const React = require('react');
const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useChangePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls apiFetch with POST and correct body', async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true });
    const { result } = renderHook(() => useChangePassword(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ newPassword: 'newpass123' });
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/user/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword: 'newpass123' }),
    });
  });

  it('resolves with success response', async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true });
    const { result } = renderHook(() => useChangePassword(), { wrapper });

    let response: unknown;
    await act(async () => {
      response = await result.current.mutateAsync({ newPassword: 'newpass123' });
    });

    expect(response).toEqual({ success: true });
  });

  it('surfaces API errors by re-throwing from mutateAsync', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Unauthorized'));
    const { result } = renderHook(() => useChangePassword(), { wrapper });

    let thrown: Error | undefined;
    await act(async () => {
      await result.current.mutateAsync({ newPassword: 'newpass123' }).catch((e: Error) => {
        thrown = e;
      });
    });

    expect(thrown).toBeDefined();
    expect(thrown?.message).toBe('Unauthorized');
  });

  it('is idle before any mutation is triggered', () => {
    const { result } = renderHook(() => useChangePassword(), { wrapper });
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });
});
