import { waitFor } from '@testing-library/react-native';
import { apiFetch } from '../../lib/api';
import {
  fetchBusinessDetail,
  useBusinessDetail,
  getBusinessDetailQueryKey,
} from '../../hooks/useBusinessDetail';
import { renderHookWithQuery } from '../utils/renderWithProviders';

// @sayso/contracts types are erased at runtime; stub the module so Jest can resolve it
jest.mock('@sayso/contracts', () => ({}));
jest.mock('../../lib/api', () => ({ apiFetch: jest.fn() }));

const mockApiFetch = apiFetch as unknown as jest.Mock;

// ─── fetchBusinessDetail — normalization ───────────────────────────────────────

describe('fetchBusinessDetail — data normalization', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls /api/businesses/{id}', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1', name: 'Cafe Luna' });
    await fetchBusinessDetail('biz-1');
    expect(mockApiFetch).toHaveBeenCalledWith('/api/businesses/biz-1');
  });

  it('normalizes a complete business payload', async () => {
    mockApiFetch.mockResolvedValueOnce({
      id: 'biz-1',
      name: 'Cafe Luna',
      category_label: 'Restaurant',
      location: 'Cape Town',
      rating: 4.5,
      reviews: 120,
      verified: true,
      phone: '+27 21 000 0000',
    });

    const result = await fetchBusinessDetail('biz-1');
    expect(result.id).toBe('biz-1');
    expect(result.name).toBe('Cafe Luna');
    expect(result.category_label).toBe('Restaurant');
    expect(result.location).toBe('Cape Town');
    expect(result.rating).toBe(4.5);
    expect(result.reviews).toBe(120);
    expect(result.verified).toBe(true);
    expect(result.phone).toBe('+27 21 000 0000');
  });

  it('defaults name to "Unnamed Business" when name is missing', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1' });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.name).toBe('Unnamed Business');
  });

  it('defaults name to "Unnamed Business" when name is whitespace only', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1', name: '   ' });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.name).toBe('Unnamed Business');
  });

  it('uses fallbackId when id is absent from payload', async () => {
    mockApiFetch.mockResolvedValueOnce({ name: 'Some Biz' });
    const result = await fetchBusinessDetail('fallback-id');
    expect(result.id).toBe('fallback-id');
  });

  it('verified defaults to false when not provided', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1', name: 'Test' });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.verified).toBe(false);
  });

  // ── Description normalization ──────────────────────────────────────────────

  it('generates a fallback description from category and location', async () => {
    mockApiFetch.mockResolvedValueOnce({
      id: 'biz-1',
      name: 'Test',
      category_label: 'Salon',
      location: 'Joburg',
    });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.description).toBe('Salon located in Joburg');
  });

  it('generates fallback description when category and location are both missing', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1', name: 'Test' });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.description).toBe('Business located in Cape Town');
  });

  it('uses string description when provided', async () => {
    mockApiFetch.mockResolvedValueOnce({
      id: 'biz-1',
      name: 'Test',
      description: 'A cozy little place.',
    });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.description).toBe('A cozy little place.');
  });

  it('uses friendly description over raw when both exist', async () => {
    mockApiFetch.mockResolvedValueOnce({
      id: 'biz-1',
      name: 'Test',
      description: { raw: 'Raw text', friendly: 'Friendly text' },
    });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.description).toBe('Friendly text');
  });

  it('uses category fallback when friendly is an empty string (??-operator does not coerce "")', async () => {
    // The normalizer uses `raw.friendly ?? raw.raw` — since '' is not null/undefined,
    // ?? does NOT fall back to raw.raw; the empty string is trimmed and triggers the
    // category/location fallback instead.
    mockApiFetch.mockResolvedValueOnce({
      id: 'biz-1',
      name: 'Test',
      category_label: 'Cafe',
      location: 'Cape Town',
      description: { raw: 'Raw text only', friendly: '' },
    });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.description).toBe('Cafe located in Cape Town');
  });

  // ── Coordinate normalization ───────────────────────────────────────────────

  it('reads lat/lng directly', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1', name: 'T', lat: -33.9249, lng: 18.4241 });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.lat).toBeCloseTo(-33.9249);
    expect(result.lng).toBeCloseTo(18.4241);
  });

  it('normalizes latitude/longitude aliases to lat/lng', async () => {
    mockApiFetch.mockResolvedValueOnce({
      id: 'biz-1',
      name: 'T',
      latitude: -26.2041,
      longitude: 28.0473,
    });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.lat).toBeCloseTo(-26.2041);
    expect(result.lng).toBeCloseTo(28.0473);
  });

  it('returns undefined lat/lng when coordinates are missing', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1', name: 'T' });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.lat).toBeUndefined();
    expect(result.lng).toBeUndefined();
  });

  // ── Rating / review count normalization ───────────────────────────────────

  it('uses rating from top-level field', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1', name: 'T', rating: 4.2 });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.rating).toBeCloseTo(4.2);
  });

  it('falls back to stats.average_rating when top-level rating is absent', async () => {
    mockApiFetch.mockResolvedValueOnce({
      id: 'biz-1',
      name: 'T',
      stats: { average_rating: 3.8, total_reviews: 22 },
    });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.rating).toBeCloseTo(3.8);
    expect(result.reviews).toBe(22);
  });

  it('returns undefined rating when neither field is present', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1', name: 'T' });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.rating).toBeUndefined();
  });

  // ── Image normalization ────────────────────────────────────────────────────

  it('deduplicates images shared across sources', async () => {
    mockApiFetch.mockResolvedValueOnce({
      id: 'biz-1',
      name: 'T',
      image_url: 'https://img.test/1.jpg',
      uploaded_images: ['https://img.test/1.jpg', 'https://img.test/2.jpg'],
    });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.images).toHaveLength(2);
    expect(result.images).toContain('https://img.test/1.jpg');
    expect(result.images).toContain('https://img.test/2.jpg');
  });

  it('collects images from object-shaped images array', async () => {
    mockApiFetch.mockResolvedValueOnce({
      id: 'biz-1',
      name: 'T',
      images: [{ url: 'https://img.test/a.jpg' }, { image_url: 'https://img.test/b.jpg' }],
    });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.images).toContain('https://img.test/a.jpg');
    expect(result.images).toContain('https://img.test/b.jpg');
  });

  it('returns empty images array when no images provided', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1', name: 'T' });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.images).toEqual([]);
  });

  // ── Price range aliases ───────────────────────────────────────────────────

  it('reads priceRange from snake_case alias', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1', name: 'T', price_range: '$$' });
    const result = await fetchBusinessDetail('biz-1');
    expect(result.priceRange).toBe('$$');
    expect(result.price_range).toBe('$$');
  });
});

// ─── getBusinessDetailQueryKey ─────────────────────────────────────────────────

describe('getBusinessDetailQueryKey', () => {
  it('returns ["business", id] tuple', () => {
    expect(getBusinessDetailQueryKey('biz-abc')).toEqual(['business', 'biz-abc']);
  });
});

// ─── useBusinessDetail hook ────────────────────────────────────────────────────

describe('useBusinessDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockReset();
  });

  it('fetches and returns normalised business data', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1', name: 'Cafe Luna', rating: 4.5 });
    const { result } = renderHookWithQuery(() => useBusinessDetail('biz-1'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe('Cafe Luna');
    expect(result.current.data?.rating).toBe(4.5);
  });

  it('is disabled (fetchStatus: idle) when id is empty string', () => {
    const { result } = renderHookWithQuery(() => useBusinessDetail(''));
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('exposes isLoading while the request is in flight', () => {
    mockApiFetch.mockImplementation(() => new Promise(() => {})); // never resolves
    const { result } = renderHookWithQuery(() => useBusinessDetail('biz-1'));
    expect(result.current.isLoading).toBe(true);
  });

  it('exposes error when fetch fails', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHookWithQuery(() => useBusinessDetail('biz-1'));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });

  it('staleTime is 120 seconds', () => {
    mockApiFetch.mockResolvedValueOnce({ id: 'biz-1', name: 'T' });
    const { queryClient } = renderHookWithQuery(() => useBusinessDetail('biz-1'));
    const query = queryClient.getQueryCache().find({ queryKey: ['business', 'biz-1'] });
    expect((query?.options as { staleTime?: number })?.staleTime).toBe(120_000);
  });
});
