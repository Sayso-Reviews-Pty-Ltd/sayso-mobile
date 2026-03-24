import { waitFor } from '@testing-library/react-native';
import { useForYouBusinesses } from '../../hooks/useForYou';
import { useForYouLocation } from '../../hooks/useForYouLocation';
import { fetchForYouFeedPage } from '../../lib/forYouFeed';
import { useAuthSession } from '../../hooks/useSession';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { renderHookWithQuery } from '../utils/renderWithProviders';

jest.mock('@sayso/contracts', () => ({}));
jest.mock('../../lib/forYouFeed', () => ({ fetchForYouFeedPage: jest.fn() }));
jest.mock('../../hooks/useForYouLocation', () => ({ useForYouLocation: jest.fn() }));
jest.mock('../../hooks/useSession', () => ({ useAuthSession: jest.fn() }));
jest.mock('../../hooks/useUserPreferences', () => ({ useUserPreferences: jest.fn() }));

const mockFetchForYouFeedPage = fetchForYouFeedPage as jest.Mock;
const mockUseForYouLocation = useForYouLocation as jest.Mock;
const mockUseAuthSession = useAuthSession as jest.Mock;
const mockUseUserPreferences = useUserPreferences as jest.Mock;

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

describe('useForYouBusinesses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthSession.mockReturnValue({ user: { id: 'user-1' } });
    mockUseUserPreferences.mockReturnValue(PREFS_LOADED);
    mockUseForYouLocation.mockReturnValue({ lat: -33.9249, lng: 18.4241, source: 'fallback' });
    mockFetchForYouFeedPage.mockResolvedValue({ items: [], nextCursor: null, usedLegacyFallback: false });
  });

  it('does not fetch when user is null', () => {
    mockUseAuthSession.mockReturnValue({ user: null });
    renderHookWithQuery(() => useForYouBusinesses());
    expect(mockFetchForYouFeedPage).not.toHaveBeenCalled();
  });

  it('is not loading when user is null', () => {
    mockUseAuthSession.mockReturnValue({ user: null });
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    expect(result.current.isLoading).toBe(false);
  });

  it('does not fetch while preferences are loading', () => {
    mockUseUserPreferences.mockReturnValue(PREFS_LOADING);
    renderHookWithQuery(() => useForYouBusinesses());
    expect(mockFetchForYouFeedPage).not.toHaveBeenCalled();
  });

  it('does not fetch when there are no preferences', () => {
    mockUseUserPreferences.mockReturnValue(PREFS_EMPTY);
    renderHookWithQuery(() => useForYouBusinesses());
    expect(mockFetchForYouFeedPage).not.toHaveBeenCalled();
  });

  it('does not fetch when enabled=false', () => {
    renderHookWithQuery(() => useForYouBusinesses(20, false));
    expect(mockFetchForYouFeedPage).not.toHaveBeenCalled();
  });

  it('calls ranked for-you fetcher with limit, preferences, and location', async () => {
    mockUseUserPreferences.mockReturnValue({
      ...PREFS_LOADED,
      interests: [{ id: 'int-1' }, { id: 'int-2' }],
      subcategories: [{ id: 'sub-1' }],
      dealbreakers: [{ id: 'db-1' }],
    });

    renderHookWithQuery(() => useForYouBusinesses(10));
    await waitFor(() => expect(mockFetchForYouFeedPage).toHaveBeenCalled());

    expect(mockFetchForYouFeedPage).toHaveBeenCalledWith({
      limit: 10,
      cursor: null,
      preferenceIds: {
        interests: ['int-1', 'int-2'],
        subcategories: ['sub-1'],
        dealbreakers: ['db-1'],
      },
      location: { lat: -33.9249, lng: 18.4241, source: 'fallback' },
    });
  });

  it('returns businesses from normalized items payload', async () => {
    mockFetchForYouFeedPage.mockResolvedValueOnce({
      items: [{ id: 'biz-1' }],
      nextCursor: null,
      usedLegacyFallback: false,
    });
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    await waitFor(() => expect(result.current.businesses).toHaveLength(1));
    expect(result.current.businesses[0].id).toBe('biz-1');
  });

  it('computes sparse fallback flag from tier_3/tier_4 metadata', async () => {
    mockFetchForYouFeedPage.mockResolvedValueOnce({
      items: [{ id: 'biz-1', fallback_tier: 'tier_3' }],
      nextCursor: null,
      usedLegacyFallback: false,
    });
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    await waitFor(() => expect(result.current.businesses).toHaveLength(1));
    expect(result.current.hasSparseFallback).toBe(true);
  });

  it('hasPreferences is true with only dealbreakers', () => {
    mockUseUserPreferences.mockReturnValue({
      ...PREFS_EMPTY,
      dealbreakers: [{ id: 'db-1' }],
    });
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    expect(result.current.hasPreferences).toBe(true);
  });

  it('surfaces fetch errors', async () => {
    mockFetchForYouFeedPage.mockRejectedValueOnce(new Error('Network failed'));
    const { result } = renderHookWithQuery(() => useForYouBusinesses());
    await waitFor(() => expect(result.current.error).toBe('Network failed'));
  });
});
