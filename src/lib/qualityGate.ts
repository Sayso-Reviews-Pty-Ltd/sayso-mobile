// ─── Quality Gate ─────────────────────────────────────────────────────────────
// Runtime checks for P0/P1 quality criteria.
// Call checkQualityGate() during app startup in dev builds to surface issues early.
// In production this is a no-op.

import { PERF_BUDGET } from './perf/perfMarkers';

export type QualityCheck = {
  id: string;
  severity: 'P0' | 'P1' | 'P2';
  description: string;
  pass: boolean;
  detail?: string;
};

export type QualityReport = {
  passed: number;
  failed: number;
  checks: QualityCheck[];
  timestamp: string;
};

export function runQualityChecks(): QualityReport {
  const checks: QualityCheck[] = [
    {
      id: 'env.supabase_url',
      severity: 'P0',
      description: 'EXPO_PUBLIC_SUPABASE_URL is defined and non-empty',
      pass: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
    },
    {
      id: 'env.supabase_anon_key',
      severity: 'P0',
      description: 'EXPO_PUBLIC_SUPABASE_ANON_KEY is defined',
      pass: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
    {
      id: 'env.algolia_configured',
      severity: 'P1',
      description: 'EXPO_PUBLIC_ALGOLIA_APP_ID is defined (falls back gracefully if absent)',
      pass: !!process.env.EXPO_PUBLIC_ALGOLIA_APP_ID,
      detail: process.env.EXPO_PUBLIC_ALGOLIA_APP_ID
        ? undefined
        : 'Search will fall back to Supabase full-text scan',
    },
    {
      id: 'perf.budget_defined',
      severity: 'P1',
      description: 'PERF_BUDGET is importable from src/lib/perf/perfMarkers',
      pass: typeof PERF_BUDGET === 'object' && PERF_BUDGET !== null,
    },
    {
      id: 'telemetry.provider_wired',
      severity: 'P2',
      description: 'Analytics provider is wired in src/lib/telemetry.ts',
      pass: false,
      detail: 'TODO: wire analytics provider in src/lib/telemetry.ts',
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const failed = checks.length - passed;

  return { passed, failed, checks, timestamp: new Date().toISOString() };
}

export function checkQualityGate(): void {
  if (!__DEV__) return;

  const report = runQualityChecks();

  // eslint-disable-next-line no-console
  console.debug('[qualityGate] ── Quality Gate Report ──────────────────────');
  for (const check of report.checks) {
    const status = check.pass ? '✓' : '✗';
    const msg = `[qualityGate] ${status} [${check.severity}] ${check.id}: ${check.description}`;
    if (!check.pass && check.severity === 'P0') {
      // eslint-disable-next-line no-console
      console.warn(msg, check.detail ?? '');
    } else {
      // eslint-disable-next-line no-console
      console.debug(msg, check.detail ?? '');
    }
  }
  // eslint-disable-next-line no-console
  console.debug(`[qualityGate] passed: ${report.passed} / failed: ${report.failed}`);
  // eslint-disable-next-line no-console
  console.debug('[qualityGate] ────────────────────────────────────────────');
}
