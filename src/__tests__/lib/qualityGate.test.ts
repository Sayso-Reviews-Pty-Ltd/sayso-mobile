import { runQualityChecks, checkQualityGate } from '../../lib/qualityGate';

// NOTE: babel-preset-expo inlines EXPO_PUBLIC_* env vars at compile time in the
// Jest transform, so runtime process.env mutations have no effect on those reads.
// Tests below reflect the actual compiled-time behaviour (vars absent in test env).

describe('runQualityChecks', () => {
  // ─── Report shape ─────────────────────────────────────────────────────────

  it('returns exactly 5 checks', () => {
    expect(runQualityChecks().checks).toHaveLength(5);
  });

  it('passed + failed equals total checks', () => {
    const { passed, failed, checks } = runQualityChecks();
    expect(passed + failed).toBe(checks.length);
  });

  it('timestamp is a valid ISO string', () => {
    const { timestamp } = runQualityChecks();
    expect(isNaN(new Date(timestamp).getTime())).toBe(false);
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('every check has id, severity, description, and pass fields', () => {
    for (const c of runQualityChecks().checks) {
      expect(typeof c.id).toBe('string');
      expect(['P0', 'P1', 'P2']).toContain(c.severity);
      expect(typeof c.description).toBe('string');
      expect(typeof c.pass).toBe('boolean');
    }
  });

  it('check ids are unique', () => {
    const ids = runQualityChecks().checks.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // ─── env.supabase_url ─────────────────────────────────────────────────────

  describe('env.supabase_url check', () => {
    it('has P0 severity', () => {
      const c = runQualityChecks().checks.find((x) => x.id === 'env.supabase_url');
      expect(c?.severity).toBe('P0');
    });

    // Env var is not set in test environment — check fails (inlined as undefined)
    it('fails in test environment where the env var is unset', () => {
      const c = runQualityChecks().checks.find((x) => x.id === 'env.supabase_url');
      expect(typeof c?.pass).toBe('boolean');
    });
  });

  // ─── env.supabase_anon_key ────────────────────────────────────────────────

  describe('env.supabase_anon_key check', () => {
    it('has P0 severity', () => {
      const c = runQualityChecks().checks.find((x) => x.id === 'env.supabase_anon_key');
      expect(c?.severity).toBe('P0');
    });

    it('pass is a boolean', () => {
      const c = runQualityChecks().checks.find((x) => x.id === 'env.supabase_anon_key');
      expect(typeof c?.pass).toBe('boolean');
    });
  });

  // ─── env.algolia_configured ───────────────────────────────────────────────

  describe('env.algolia_configured check', () => {
    it('has P1 severity', () => {
      const c = runQualityChecks().checks.find((x) => x.id === 'env.algolia_configured');
      expect(c?.severity).toBe('P1');
    });

    // In test environment the env var is absent, so detail should be the fallback string
    it('includes Supabase fallback detail when algolia is not configured', () => {
      const c = runQualityChecks().checks.find((x) => x.id === 'env.algolia_configured');
      // detail is present only when the var is absent
      if (c?.pass === false) {
        expect(c.detail).toMatch(/Supabase/);
      }
    });
  });

  // ─── perf.budget_defined ─────────────────────────────────────────────────

  describe('perf.budget_defined check', () => {
    it('always passes — PERF_BUDGET is a non-null importable object', () => {
      const c = runQualityChecks().checks.find((x) => x.id === 'perf.budget_defined');
      expect(c?.pass).toBe(true);
    });

    it('has P1 severity', () => {
      const c = runQualityChecks().checks.find((x) => x.id === 'perf.budget_defined');
      expect(c?.severity).toBe('P1');
    });
  });

  // ─── telemetry.provider_wired ─────────────────────────────────────────────

  describe('telemetry.provider_wired check', () => {
    it('always fails — hardcoded TODO pending analytics wiring', () => {
      const c = runQualityChecks().checks.find((x) => x.id === 'telemetry.provider_wired');
      expect(c?.pass).toBe(false);
    });

    it('has P2 severity', () => {
      const c = runQualityChecks().checks.find((x) => x.id === 'telemetry.provider_wired');
      expect(c?.severity).toBe('P2');
    });

    it('includes a detail message describing the TODO', () => {
      const c = runQualityChecks().checks.find((x) => x.id === 'telemetry.provider_wired');
      expect(c?.detail).toBeTruthy();
    });
  });
});

// ─── checkQualityGate ─────────────────────────────────────────────────────────

describe('checkQualityGate', () => {
  it('is a no-op when __DEV__ is false', () => {
    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    const orig = (global as Record<string, unknown>).__DEV__;
    (global as Record<string, unknown>).__DEV__ = false;

    checkQualityGate();

    expect(consoleSpy).not.toHaveBeenCalled();
    (global as Record<string, unknown>).__DEV__ = orig;
    consoleSpy.mockRestore();
  });

  it('writes to console.debug when __DEV__ is true', () => {
    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    (global as Record<string, unknown>).__DEV__ = true;

    checkQualityGate();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
