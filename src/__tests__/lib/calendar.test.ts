import {
  buildFallbackEnd,
  buildGoogleCalendarUrl,
  toGoogleDate,
} from '../../lib/events/calendar';

describe('toGoogleDate', () => {
  it('converts a valid ISO date string to YYYYMMDDTHHMMSSZ format', () => {
    expect(toGoogleDate('2026-03-20T10:15:30.000Z')).toBe('20260320T101530Z');
  });

  it('returns empty string for undefined input', () => {
    expect(toGoogleDate(undefined)).toBe('');
  });

  it('returns empty string for an invalid date string', () => {
    expect(toGoogleDate('invalid-date')).toBe('');
  });
});

describe('buildFallbackEnd', () => {
  it('adds 2 hours to a valid ISO start date', () => {
    expect(buildFallbackEnd('2026-03-20T10:15:30.000Z')).toBe('2026-03-20T12:15:30.000Z');
  });

  it('returns empty string for undefined input', () => {
    expect(buildFallbackEnd(undefined)).toBe('');
  });

  it('returns empty string for invalid input', () => {
    expect(buildFallbackEnd('bad-date')).toBe('');
  });
});

describe('buildGoogleCalendarUrl', () => {
  it('builds a valid calendar.google.com URL with all fields', () => {
    const url = buildGoogleCalendarUrl({
      id: 'evt-1',
      type: 'event',
      title: 'Sayso Launch Event',
      description: 'Launch celebration with guests',
      location: 'Johannesburg',
      startDateISO: '2026-03-20T10:00:00.000Z',
      endDateISO: '2026-03-20T12:00:00.000Z',
    } as any);

    expect(url.startsWith('https://calendar.google.com/calendar/render')).toBe(true);

    const parsed = new URL(url);
    expect(parsed.searchParams.get('text')).toBe('Sayso Launch Event');
    expect(parsed.searchParams.get('dates')).toBe('20260320T100000Z/20260320T120000Z');
    expect(parsed.searchParams.get('details')).toBe('Launch celebration with guests');
    expect(parsed.searchParams.get('location')).toBe('Johannesburg');
  });

  it('encodes special characters in the event title', () => {
    const url = buildGoogleCalendarUrl({
      id: 'evt-2',
      type: 'event',
      title: 'Coffee & Code = Fun?',
      startDateISO: '2026-03-20T10:00:00.000Z',
      endDateISO: '2026-03-20T11:00:00.000Z',
    } as any);

    expect(url).toContain('Coffee+%26+Code+%3D+Fun%3F');
  });

  it('handles missing optional fields gracefully', () => {
    const url = buildGoogleCalendarUrl({
      id: 'evt-3',
      type: 'event',
      title: 'Minimal Event',
      startDateISO: '2026-03-20T10:00:00.000Z',
    } as any);

    const parsed = new URL(url);
    expect(parsed.searchParams.get('details')).toBe('');
    expect(parsed.searchParams.get('location')).toBe('');
    expect(parsed.searchParams.get('dates')).toBe('20260320T100000Z/20260320T120000Z');
  });
});
