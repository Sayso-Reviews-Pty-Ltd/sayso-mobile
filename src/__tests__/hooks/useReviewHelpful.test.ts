import { act, renderHook } from '@testing-library/react-native';
import { apiFetch } from '../../lib/api';
import { useReviewHelpful } from '../../hooks/useReviewHelpful';
import { useAuth } from '../../providers/AuthProvider';

jest.mock('../../lib/api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../providers/AuthProvider', () => ({
  useAuth: jest.fn(() => ({ user: { id: 'user-1' } })),
}));

const mockApiFetch = apiFetch as unknown as jest.Mock;
const mockUseAuth = useAuth as unknown as jest.Mock;

describe('useReviewHelpful', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('initialises with the provided helpfulCount', () => {
    const { result } = renderHook(() => useReviewHelpful('review-1', 7));
    expect(result.current.count).toBe(7);
  });

  it('initialises isHelpful as false', () => {
    const { result } = renderHook(() => useReviewHelpful('review-1', 2));
    expect(result.current.isHelpful).toBe(false);
  });

  it('increments count optimistically on toggle', async () => {
    mockApiFetch.mockResolvedValueOnce({});
    const { result } = renderHook(() => useReviewHelpful('review-1', 2));

    await act(async () => {
      await result.current.toggle();
    });

    expect(result.current.count).toBe(3);
    expect(result.current.isHelpful).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith('/api/reviews/review-1/helpful', { method: 'POST' });
  });

  it('decrements count optimistically on second toggle', async () => {
    mockApiFetch.mockResolvedValueOnce({}).mockResolvedValueOnce({});
    const { result } = renderHook(() => useReviewHelpful('review-1', 2));

    await act(async () => {
      await result.current.toggle();
    });
    await act(async () => {
      await result.current.toggle();
    });

    expect(result.current.count).toBe(2);
    expect(result.current.isHelpful).toBe(false);
    expect(mockApiFetch).toHaveBeenLastCalledWith('/api/reviews/review-1/helpful', {
      method: 'DELETE',
    });
  });

  it('rolls back count on API error', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useReviewHelpful('review-1', 2));

    await act(async () => {
      await result.current.toggle();
    });

    expect(result.current.count).toBe(2);
    expect(result.current.isHelpful).toBe(false);
  });

  it('does not toggle when user is null', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { result } = renderHook(() => useReviewHelpful('review-1', 2));

    await act(async () => {
      await result.current.toggle();
    });

    expect(mockApiFetch).not.toHaveBeenCalled();
    expect(result.current.count).toBe(2);
    expect(result.current.isHelpful).toBe(false);
  });
});
