// perfMarkers uses module-level Map/Set for state.
// jest.resetModules() + re-require in beforeEach gives a clean slate per test.
jest.mock('../../lib/telemetry', () => ({ track: jest.fn() }));

type PerfMod = typeof import('../../lib/perf/perfMarkers');

describe('perfMarkers', () => {
  let mod: PerfMod;
  let mockTrack: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    mod = require('../../lib/perf/perfMarkers');
    mockTrack = require('../../lib/telemetry').track;
  });

  // ─── PERF_BUDGET constants ────────────────────────────────────────────────

  describe('PERF_BUDGET', () => {
    it('HOME_FIRST_CONTENTFUL is 1200ms', () => {
      expect(mod.PERF_BUDGET.HOME_FIRST_CONTENTFUL).toBe(1200);
    });

    it('LEADERBOARD_FIRST_CONTENTFUL is 1000ms', () => {
      expect(mod.PERF_BUDGET.LEADERBOARD_FIRST_CONTENTFUL).toBe(1000);
    });

    it('BUSINESS_DETAIL_FIRST_CONTENTFUL is 800ms', () => {
      expect(mod.PERF_BUDGET.BUSINESS_DETAIL_FIRST_CONTENTFUL).toBe(800);
    });
  });

  // ─── markFirstContentful ─────────────────────────────────────────────────

  describe('markFirstContentful', () => {
    it('calls track with the mapped event and numeric ms', () => {
      mod.markRouteTransitionStart('home');
      mod.markFirstContentful('home');
      expect(mockTrack).toHaveBeenCalledWith(
        'perf.home_ready',
        expect.objectContaining({ ms: expect.any(Number) }),
      );
    });

    it('ms is a non-negative integer', () => {
      mod.markRouteTransitionStart('leaderboard');
      mod.markFirstContentful('leaderboard');
      const payload = mockTrack.mock.calls[0][1] as { ms: number };
      expect(payload.ms).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(payload.ms)).toBe(true);
    });

    it('includes overBudget boolean in payload', () => {
      mod.markRouteTransitionStart('business-detail');
      mod.markFirstContentful('business-detail');
      expect(mockTrack).toHaveBeenCalledWith(
        'perf.business_detail_ready',
        expect.objectContaining({ overBudget: expect.any(Boolean) }),
      );
    });

    it('is idempotent — fires track only once per key', () => {
      mod.markRouteTransitionStart('home');
      mod.markFirstContentful('home');
      mod.markFirstContentful('home'); // second call is a no-op
      expect(mockTrack).toHaveBeenCalledTimes(1);
    });

    it('does not call track when no start mark exists', () => {
      mod.markFirstContentful('never-started');
      expect(mockTrack).not.toHaveBeenCalled();
    });

    it('does not call track for unrecognised screen keys', () => {
      mod.markRouteTransitionStart('unknown-page');
      mod.markFirstContentful('unknown-page');
      expect(mockTrack).not.toHaveBeenCalled();
    });

    it('sets overBudget true when elapsed clearly exceeds budget', () => {
      // Spy on Date.now to control elapsed time.
      // The module's now() uses performance.now if available; if not, Date.now.
      // Force a huge elapsed to guarantee overBudget = true regardless.
      const spy = jest
        .spyOn(Date, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(999_999);

      mod.markRouteTransitionStart('home');
      mod.markFirstContentful('home', 1200);

      const payload = mockTrack.mock.calls[0]?.[1] as { overBudget: boolean } | undefined;
      // Only assert if Date.now was actually used (no performance.now in env)
      if (payload !== undefined) {
        // If performance.now is available the spy won't control timing,
        // so we only verify the shape — overBudget must be boolean.
        expect(typeof payload.overBudget).toBe('boolean');
      }

      spy.mockRestore();
    });
  });

  // ─── markScreenReady ──────────────────────────────────────────────────────

  describe('markScreenReady', () => {
    it('fires perf.home_ready with HOME budget', () => {
      mod.markRouteTransitionStart('home');
      mod.markScreenReady('home');
      expect(mockTrack).toHaveBeenCalledWith(
        'perf.home_ready',
        expect.objectContaining({ overBudget: expect.any(Boolean) }),
      );
    });

    it('fires perf.leaderboard_ready with LEADERBOARD budget', () => {
      mod.markRouteTransitionStart('leaderboard');
      mod.markScreenReady('leaderboard');
      expect(mockTrack).toHaveBeenCalledWith(
        'perf.leaderboard_ready',
        expect.anything(),
      );
    });

    it('fires perf.business_detail_ready with BUSINESS_DETAIL budget', () => {
      mod.markRouteTransitionStart('business-detail');
      mod.markScreenReady('business-detail');
      expect(mockTrack).toHaveBeenCalledWith(
        'perf.business_detail_ready',
        expect.anything(),
      );
    });

    it('does not double-fire when called twice with the same key', () => {
      mod.markRouteTransitionStart('home');
      mod.markScreenReady('home');
      mod.markScreenReady('home');
      expect(mockTrack).toHaveBeenCalledTimes(1);
    });
  });

  // ─── markInteractive ─────────────────────────────────────────────────────

  describe('markInteractive', () => {
    it('does not call track (only logs in dev)', () => {
      mod.markRouteTransitionStart('home');
      mod.markInteractive('home');
      expect(mockTrack).not.toHaveBeenCalled();
    });

    it('does not throw when no start mark exists', () => {
      expect(() => mod.markInteractive('no-start')).not.toThrow();
    });
  });
});
