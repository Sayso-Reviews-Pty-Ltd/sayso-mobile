import { act, waitFor } from '@testing-library/react-native';
import { apiFetch } from '../../lib/api';
import { useEventRsvp } from '../../hooks/useEventRsvp';
import { renderHookWithQuery } from '../utils/renderWithProviders';

jest.mock('../../lib/api', () => ({ apiFetch: jest.fn() }));
const mockApiFetch = apiFetch as unknown as jest.Mock;

describe('useEventRsvp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initialises isGoing as false', async () => {
    mockApiFetch.mockResolvedValueOnce({ count: 1, userRsvpd: false });
    const { result } = renderHookWithQuery(() => useEventRsvp('event-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isGoing).toBe(false);
  });

  it('initialises count as 0 when API returns NaN', async () => {
    mockApiFetch.mockResolvedValueOnce({ count: Number.NaN, userRsvpd: false });
    const { result } = renderHookWithQuery(() => useEventRsvp('event-2'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.count).toBe(0);
  });

  it('toggleRsvp calls the correct endpoint', async () => {
    mockApiFetch
      .mockResolvedValueOnce({ count: 0, userRsvpd: false })
      .mockResolvedValueOnce({ count: 1, isGoing: true });

    const { result } = renderHookWithQuery(() => useEventRsvp('event-3'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleRsvp();
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/events-and-specials/event-3/rsvp', {
      method: 'POST',
    });
  });

  it('updates isGoing to true after successful toggle', async () => {
    mockApiFetch
      .mockResolvedValueOnce({ count: 0, userRsvpd: false })
      .mockResolvedValueOnce({ count: 1, isGoing: true });

    const { result } = renderHookWithQuery(() => useEventRsvp('event-4'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleRsvp();
    });

    await waitFor(() => {
      expect(result.current.isGoing).toBe(true);
      expect(result.current.count).toBe(1);
    });
  });
});
