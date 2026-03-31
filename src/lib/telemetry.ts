// ─── Telemetry Event Taxonomy ─────────────────────────────────────────────────
// Non-PII event tracking for premium loop milestones and critical UX failures.
// Consistent naming convention: <domain>.<action>
//
// Swap the `track` implementation for your analytics provider
// (PostHog, Amplitude, Segment, etc.) without touching call sites.

export type TelemetryEvent =
  // ── Prestige loop ──────────────────────────────────────────────────────────
  | 'prestige.review_written'
  | 'prestige.helpful_vote_received'
  | 'prestige.tier_upgraded'
  | 'prestige.milestone_unlocked'
  | 'prestige.share_moment_tapped'
  | 'prestige.share_moment_dismissed'
  | 'feedback.pulse_responded'
  | 'prestige.leaderboard_viewed'
  | 'prestige.profile_viewed'

  // ── Discovery ──────────────────────────────────────────────────────────────
  | 'discovery.search_executed'
  | 'discovery.filter_applied'
  | 'discovery.business_tapped'
  | 'discovery.event_tapped'

  // ── Critical UX failures ───────────────────────────────────────────────────
  | 'ux.write_review_failed'
  | 'ux.save_place_failed'
  | 'ux.share_failed'
  | 'ux.search_timeout'
  | 'ux.notification_action_failed'
  | 'ux.helpful_vote_failed'

  // ── Performance markers ────────────────────────────────────────────────────
  | 'perf.home_ready'
  | 'perf.business_detail_ready'
  | 'perf.leaderboard_ready'

  // ── Rollout / exposure ─────────────────────────────────────────────────────
  | 'rollout.home_native_carousel_exposed';

export type TelemetryPayload = Record<string, string | number | boolean>;

/**
 * Track a non-PII telemetry event.
 * Replace the body with your analytics provider call.
 */
export function track(event: TelemetryEvent, payload?: TelemetryPayload): void {
  if (__DEV__) {
    console.debug(`[telemetry] ${event}`, payload ?? {});
  }
  // TODO: analytics.track(event, payload)
}
