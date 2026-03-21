import { act, renderHook } from '@testing-library/react-native';
import { useFeedbackPulse } from '../../hooks/useFeedbackPulse';
import { track } from '../../lib/telemetry';

jest.mock('../../lib/telemetry', () => ({ track: jest.fn() }));

const mockTrack = track as jest.Mock;

describe('useFeedbackPulse', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Initial state ────────────────────────────────────────────────────────

  it('initialises with shouldShow = false', () => {
    const { result } = renderHook(() => useFeedbackPulse('ctx'));
    expect(result.current.shouldShow).toBe(false);
  });

  // ─── show() ──────────────────────────────────────────────────────────────

  it('show() sets shouldShow to true', () => {
    const { result } = renderHook(() => useFeedbackPulse('ctx'));
    act(() => result.current.show());
    expect(result.current.shouldShow).toBe(true);
  });

  it('show() is idempotent', () => {
    const { result } = renderHook(() => useFeedbackPulse('ctx'));
    act(() => result.current.show());
    act(() => result.current.show());
    expect(result.current.shouldShow).toBe(true);
  });

  // ─── dismiss() ───────────────────────────────────────────────────────────

  it('dismiss() sets shouldShow to false', () => {
    const { result } = renderHook(() => useFeedbackPulse('ctx'));
    act(() => result.current.show());
    act(() => result.current.dismiss());
    expect(result.current.shouldShow).toBe(false);
  });

  it('dismiss() when already hidden does not throw', () => {
    const { result } = renderHook(() => useFeedbackPulse('ctx'));
    expect(() => act(() => result.current.dismiss())).not.toThrow();
    expect(result.current.shouldShow).toBe(false);
  });

  // ─── respond() ───────────────────────────────────────────────────────────

  it('respond(true) tracks positive sentiment', () => {
    const { result } = renderHook(() => useFeedbackPulse('write-review'));
    act(() => result.current.respond(true));
    expect(mockTrack).toHaveBeenCalledWith('feedback.pulse_responded', {
      sentiment: 'positive',
      context: 'write-review',
    });
  });

  it('respond(false) tracks negative sentiment', () => {
    const { result } = renderHook(() => useFeedbackPulse('leaderboard'));
    act(() => result.current.respond(false));
    expect(mockTrack).toHaveBeenCalledWith('feedback.pulse_responded', {
      sentiment: 'negative',
      context: 'leaderboard',
    });
  });

  it('respond() calls track exactly once', () => {
    const { result } = renderHook(() => useFeedbackPulse('ctx'));
    act(() => result.current.respond(true));
    expect(mockTrack).toHaveBeenCalledTimes(1);
  });

  it('respond() dismisses the pulse', () => {
    const { result } = renderHook(() => useFeedbackPulse('ctx'));
    act(() => result.current.show());
    act(() => result.current.respond(true));
    expect(result.current.shouldShow).toBe(false);
  });

  it('respond() works even when shouldShow is false', () => {
    const { result } = renderHook(() => useFeedbackPulse('ctx'));
    // shouldShow is already false — respond should still track
    act(() => result.current.respond(false));
    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(result.current.shouldShow).toBe(false);
  });

  // ─── context forwarding ───────────────────────────────────────────────────

  it('passes the context string to the telemetry payload', () => {
    const { result } = renderHook(() => useFeedbackPulse('my-unique-context'));
    act(() => result.current.respond(true));
    expect(mockTrack).toHaveBeenCalledWith(
      'feedback.pulse_responded',
      expect.objectContaining({ context: 'my-unique-context' }),
    );
  });
});
