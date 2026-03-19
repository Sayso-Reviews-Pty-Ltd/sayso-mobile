import { waitFor } from '@testing-library/react-native';
import { apiFetch } from '../../lib/api';
import { useUserBadges, useAllUserBadges } from '../../hooks/useUserBadges';
import { useAuthSession } from '../../hooks/useSession';
import { renderHookWithQuery } from '../utils/renderWithProviders';

jest.mock('../../lib/api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../hooks/useSession', () => ({
  useAuthSession: jest.fn(),
}));

const mockApiFetch = apiFetch as unknown as jest.Mock;
const mockUseAuthSession = useAuthSession as jest.Mock;

const BADGE_EARNED = {
  id: 'badge-001',
  name: 'New Voice',
  description: 'Wrote their first review',
  badge_group: 'milestone',
  earned: true,
  awarded_at: '2024-06-01T00:00:00Z',
};

const BADGE_LOCKED = {
  id: 'badge-002',
  name: 'Rookie Reviewer',
  description: 'Wrote 5 reviews',
  badge_group: 'milestone',
  earned: false,
  awarded_at: null,
};

const API_RESPONSE = { ok: true, badges: [BADGE_EARNED, BADGE_LOCKED] };

// ─── useUserBadges ─────────────────────────────────────────────────────────────

describe('useUserBadges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockResolvedValue(API_RESPONSE);
  });

  it('is disabled when user is null', () => {
    mockUseAuthSession.mockReturnValue({ user: null, isLoading: false });
    const { result } = renderHookWithQuery(() => useUserBadges());
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('is disabled while auth is loading', () => {
    mockUseAuthSession.mockReturnValue({ user: null, isLoading: true });
    const { result } = renderHookWithQuery(() => useUserBadges());
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('fetches /api/badges/user when authenticated', async () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const { result } = renderHookWithQuery(() => useUserBadges());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith('/api/badges/user?user_id=user-1');
  });

  it('uses query key [user-badges, userId]', () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-abc' }, isLoading: false });
    const { queryClient } = renderHookWithQuery(() => useUserBadges());
    const query = queryClient.getQueryCache().find({ queryKey: ['user-badges', 'user-abc'] });
    expect(query).toBeDefined();
  });

  it('returns only earned badges', async () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const { result } = renderHookWithQuery(() => useUserBadges());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].id).toBe('badge-001');
  });

  it('returns empty array when API returns no badges', async () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    mockApiFetch.mockResolvedValueOnce({ ok: true, badges: [] });
    const { result } = renderHookWithQuery(() => useUserBadges());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('staleTime is 60 seconds', () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const { queryClient } = renderHookWithQuery(() => useUserBadges());
    const query = queryClient.getQueryCache().find({ queryKey: ['user-badges', 'user-1'] });
    expect((query?.options as { staleTime?: number })?.staleTime).toBe(60_000);
  });
});

// ─── useAllUserBadges ──────────────────────────────────────────────────────────

describe('useAllUserBadges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockResolvedValue(API_RESPONSE);
  });

  it('is disabled when user is null', () => {
    mockUseAuthSession.mockReturnValue({ user: null, isLoading: false });
    const { result } = renderHookWithQuery(() => useAllUserBadges());
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('is disabled while auth is loading', () => {
    mockUseAuthSession.mockReturnValue({ user: null, isLoading: true });
    const { result } = renderHookWithQuery(() => useAllUserBadges());
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('fetches /api/badges/user when authenticated', async () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const { result } = renderHookWithQuery(() => useAllUserBadges());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiFetch).toHaveBeenCalledWith('/api/badges/user?user_id=user-1');
  });

  it('uses query key [user-badges-all, userId]', () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-abc' }, isLoading: false });
    const { queryClient } = renderHookWithQuery(() => useAllUserBadges());
    const query = queryClient.getQueryCache().find({ queryKey: ['user-badges-all', 'user-abc'] });
    expect(query).toBeDefined();
  });

  it('returns both earned and locked badges', async () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const { result } = renderHookWithQuery(() => useAllUserBadges());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.some((b) => b.earned)).toBe(true);
    expect(result.current.data?.some((b) => !b.earned)).toBe(true);
  });

  it('returns empty array when API returns no badges', async () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    mockApiFetch.mockResolvedValueOnce({ ok: true, badges: [] });
    const { result } = renderHookWithQuery(() => useAllUserBadges());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('staleTime is 60 seconds', () => {
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' }, isLoading: false });
    const { queryClient } = renderHookWithQuery(() => useAllUserBadges());
    const query = queryClient.getQueryCache().find({ queryKey: ['user-badges-all', 'user-1'] });
    expect((query?.options as { staleTime?: number })?.staleTime).toBe(60_000);
  });
});
