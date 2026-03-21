import { track } from '../telemetry';

const transitionStartMarks = new Map<string, number>();
const firstContentfulMarks = new Set<string>();

// Screen performance budgets (milliseconds)
// P1 target: first-contentful within budget on all top journeys
export const PERF_BUDGET = {
  HOME_FIRST_CONTENTFUL: 1200,
  BUSINESS_DETAIL_FIRST_CONTENTFUL: 800,
  LEADERBOARD_FIRST_CONTENTFUL: 1000,
} as const;

const SCREEN_EVENT_MAP = {
  home: 'perf.home_ready',
  leaderboard: 'perf.leaderboard_ready',
  'business-detail': 'perf.business_detail_ready',
} as const;

function now() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function debugLog(message: string) {
  if (!__DEV__) return;
  // eslint-disable-next-line no-console
  console.debug(message);
}

export function markRouteTransitionStart(key: string) {
  transitionStartMarks.set(key, now());
}

// Intentional: records only the first-contentful event per key per session.
// Second and subsequent visits to the same screen are not re-measured.
// If per-visit measurement is needed, call `transitionStartMarks.delete(key)` on screen focus.
export function markFirstContentful(key: string, budget?: number) {
  if (firstContentfulMarks.has(key)) return;
  const start = transitionStartMarks.get(key);
  if (typeof start !== 'number') return;
  const elapsed = now() - start;
  debugLog(`[perf] ${key} first-contentful: ${elapsed.toFixed(1)}ms`);
  firstContentfulMarks.add(key);

  const eventKey = key as keyof typeof SCREEN_EVENT_MAP;
  if (eventKey in SCREEN_EVENT_MAP) {
    const event = SCREEN_EVENT_MAP[eventKey];
    track(event, {
      ms: Math.round(elapsed),
      overBudget: elapsed > (budget ?? Infinity),
    });
  }
}

export function markInteractive(key: string) {
  const start = transitionStartMarks.get(key);
  if (typeof start !== 'number') return;
  const elapsed = now() - start;
  debugLog(`[perf] ${key} interactive: ${elapsed.toFixed(1)}ms`);
}

export function markScreenReady(screenKey: 'home' | 'leaderboard' | 'business-detail') {
  const budget =
    screenKey === 'home'
      ? PERF_BUDGET.HOME_FIRST_CONTENTFUL
      : screenKey === 'leaderboard'
        ? PERF_BUDGET.LEADERBOARD_FIRST_CONTENTFUL
        : PERF_BUDGET.BUSINESS_DETAIL_FIRST_CONTENTFUL;
  markFirstContentful(screenKey, budget);
}
