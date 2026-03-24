import { waitFor } from '@testing-library/react-native';
import { apiFetch } from '../../lib/api';
import { useForYouBusinesses } from '../../hooks/useForYou';
import { useAuthSession } from '../../hooks/useSession';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { renderHookWithQuery } from '../utils/renderWithProviders';

jest.mock('@sayso/contracts', () => ({}));
jest.mock('../../lib/api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../hooks/useSession', () => ({ useAuthSession: jest.fn() }));
jest.mock('../../hooks/useUserPreferences', () => ({ useUserPreferences: jest.fn() }));

const mockApiFetch = apiFetch as jest.Mock;
const mockUseAuthSession = useAuthSession as jest.Mock;
const mockUseUserPreferences = useUserPreferences as jest.Mock;

// ─── Preference fixtures ──────────────────────────────────────────────────────

const PREFS_LOADED = {
  interests: [{ id: 'int-1' }],
  subcategories: [],
  dealbreakers: [],
  isLoading: false,
  error: null,
  refetch: jest.fn().mockResolvedValue(undefined),
};

const PREFS_EMPTY = {
  interests: [],
  subcategories: [],
  dealbreakers: [],
  isLoading: false,
  error: null,
  refetch: jest.fn().mockResolvedValue(undefined),
};

const PREFS_LOADING = { ...PREFS_LOADED, isLoading: true };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useForYouBusinesses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' } });
    mockUseUserPreferences.mockReturnValue(PREFS_LOADED);
    mockApiFetch.mockResolvedValue({ businesses: [] });
  });

  // ─── Auth / enabled guards ─────────────────────────────────────────────

  it('does not fetch when user is null', () => {
    mockUseAuthSession.mockReturnValue({ user: null });
    renderHookWithQuery(() => useForYouBusinesses());
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('is not loading when user is null', () => {
    mockUseAuthSession.mockReturnValue({ user: null });
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    expect(result.current.isLoading).toBe(false);
  });

  it('does not fetch while preferences are loading', () => {
    mockUseUserPreferences.mockReturnValue(PREFS_LOADING);
    renderHookWithQuery(() => useForYouBusinesses());
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('does not fetch when there are no preferences', () => {
    mockUseUserPreferences.mockReturnValue(PREFS_EMPTY);
    renderHookWithQuery(() => useForYouBusinesses());
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('does not fetch when enabled=false', () => {
    renderHookWithQuery(() => useForYouBusinesses(20, false));
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  // ─── URL construction ──────────────────────────────────────────────────

  it('hits /api/businesses with feed_strategy=mixed', async () => {
    renderHookWithQuery(() => useForYouBusinesses());
    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled());
    const url: string = mockApiFetch.mock.calls[0][0];
    expect(url).toContain('/api/businesses');
    expect(url).toContain('feed_strategy=mixed');
  });

  it('includes limit param', async () => {
    renderHookWithQuery(() => useForYouBusinesses(10));
    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled());
    const url: string = mockApiFetch.mock.calls[0][0];
    expect(url).toContain('limit=10');
  });

  it('includes interest_ids when interests are set', async () => {
    mockUseUserPreferences.mockReturnValue({
      ...PREFS_LOADED,
      interests: [{ id: 'int-1' }, { id: 'int-2' }],
    });
    renderHookWithQuery(() => useForYouBusinesses());
    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled());
    const url: string = mockApiFetch.mock.calls[0][0];
    expect(url).toContain('interest_ids=');
    expect(url).toContain('int-1');
    expect(url).toContain('int-2');
  });

  it('includes dealbreakers param when set', async () => {
    mockUseUserPreferences.mockReturnValue({
      ...PREFS_LOADED,
      dealbreakers: [{ id: 'db-1' }],
    });
    renderHookWithQuery(() => useForYouBusinesses());
    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled());
    const url: string = mockApiFetch.mock.calls[0][0];
    expect(url).toContain('dealbreakers=');
  });

  // ─── Response normalisation ────────────────────────────────────────────

  it('returns businesses from response.businesses', async () => {
    mockApiFetch.mockResolvedValueOnce({ businesses: [{ id: 'biz-1' }] });
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    await waitFor(() => expect(result.current.businesses).toHaveLength(1));
    expect(result.current.businesses[0].id).toBe('biz-1');
  });

  it('falls back to response.data when businesses is absent', async () => {
    mockApiFetch.mockResolvedValueOnce({ data: [{ id: 'biz-2' }] });
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    await waitFor(() => expect(result.current.businesses).toHaveLength(1));
    expect(result.current.businesses[0].id).toBe('biz-2');
  });

  it('returns empty array when both response fields are absent', async () => {
    mockApiFetch.mockResolvedValueOnce({});
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    await waitFor(() => !result.current.isLoading);
    expect(result.current.businesses).toEqual([]);
  });

  // ─── hasPreferences ────────────────────────────────────────────────────

  it('hasPreferences is true when interests exist', () => {
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    expect(result.current.hasPreferences).toBe(true);
  });

  it('hasPreferences is false when all preference lists are empty', () => {
    mockUseUserPreferences.mockReturnValue(PREFS_EMPTY);
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    expect(result.current.hasPreferences).toBe(false);
  });

  it('hasPreferences is true with only dealbreakers', () => {
    mockUseUserPreferences.mockReturnValue({
      ...PREFS_EMPTY,
      dealbreakers: [{ id: 'db-1' }],
    });
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    expect(result.current.hasPreferences).toBe(true);
  });

  // ─── Error handling ────────────────────────────────────────────────────

  it('surfaces error message from thrown Error', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network failed'));
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    await waitFor(() => expect(result.current.error).toBe('Network failed'));
  });

  it('error is null on success', async () => {
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    await waitFor(() => !result.current.isLoading);
    expect(result.current.error).toBeNull();
  });
});
