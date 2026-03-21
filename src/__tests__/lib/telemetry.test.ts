import { track, type TelemetryEvent } from '../../lib/telemetry';

describe('track', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('calls console.debug in dev mode', () => {
    track('prestige.review_written');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('prefixes the output with [telemetry]', () => {
    track('prestige.review_written');
    const [label] = consoleSpy.mock.calls[0];
    expect(label).toBe('[telemetry] prestige.review_written');
  });

  it('passes an empty object when no payload is provided', () => {
    track('discovery.search_executed');
    expect(consoleSpy).toHaveBeenCalledWith(
      '[telemetry] discovery.search_executed',
      {},
    );
  });

  it('forwards payload to console.debug', () => {
    track('prestige.tier_upgraded', { tier: 'rookie', count: 5 });
    expect(consoleSpy).toHaveBeenCalledWith('[telemetry] prestige.tier_upgraded', {
      tier: 'rookie',
      count: 5,
    });
  });

  it('supports boolean payload values', () => {
    track('perf.home_ready', { overBudget: false, ms: 450 });
    expect(consoleSpy).toHaveBeenCalledWith('[telemetry] perf.home_ready', {
      overBudget: false,
      ms: 450,
    });
  });

  it('does not throw for any defined event type', () => {
    const events: TelemetryEvent[] = [
      'prestige.review_written',
      'prestige.helpful_vote_received',
      'prestige.tier_upgraded',
      'prestige.milestone_unlocked',
      'prestige.share_moment_tapped',
      'prestige.share_moment_dismissed',
      'feedback.pulse_responded',
      'prestige.leaderboard_viewed',
      'prestige.profile_viewed',
      'discovery.search_executed',
      'discovery.filter_applied',
      'discovery.business_tapped',
      'discovery.event_tapped',
      'ux.write_review_failed',
      'ux.save_place_failed',
      'ux.share_failed',
      'ux.search_timeout',
      'ux.notification_action_failed',
      'ux.helpful_vote_failed',
      'perf.home_ready',
      'perf.business_detail_ready',
      'perf.leaderboard_ready',
    ];
    expect(() => events.forEach((e) => track(e))).not.toThrow();
  });

  it('calls console.debug once per track call', () => {
    track('discovery.business_tapped');
    track('discovery.business_tapped');
    expect(consoleSpy).toHaveBeenCalledTimes(2);
  });

  it('includes context string payload values', () => {
    track('feedback.pulse_responded', { sentiment: 'positive', context: 'profile' });
    expect(consoleSpy).toHaveBeenCalledWith('[telemetry] feedback.pulse_responded', {
      sentiment: 'positive',
      context: 'profile',
    });
  });
});
