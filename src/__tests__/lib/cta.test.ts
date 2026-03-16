import {
  buildWhatsAppDeepLink,
  extractWhatsAppNumberFromUrl,
  isWhatsAppUrl,
  normalizeWhatsAppNumber,
  resolveCtaTarget,
} from '../../lib/events/cta';

const baseEvent = {
  id: 'evt-1',
  type: 'event',
  title: 'Sunset Session',
  startDateISO: '2026-03-20T16:00:00.000Z',
  endDateISO: '2026-03-20T18:00:00.000Z',
} as any;

describe('normalizeWhatsAppNumber', () => {
  it('extracts digits from a formatted SA number (+27 82 123 4567)', () => {
    expect(normalizeWhatsAppNumber('+27 82 123 4567')).toBe('27821234567');
  });

  it('returns null for a string with fewer than 7 digits', () => {
    expect(normalizeWhatsAppNumber('123-45')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(normalizeWhatsAppNumber(undefined)).toBeNull();
  });
});

describe('isWhatsAppUrl', () => {
  it('returns true for wa.me URLs', () => {
    expect(isWhatsAppUrl('https://wa.me/27821234567')).toBe(true);
  });

  it('returns true for api.whatsapp.com URLs', () => {
    expect(isWhatsAppUrl('https://api.whatsapp.com/send?phone=27821234567')).toBe(true);
  });

  it('returns false for a regular booking URL', () => {
    expect(isWhatsAppUrl('https://tickets.example.com/event/abc')).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isWhatsAppUrl(undefined)).toBe(false);
  });
});

describe('buildWhatsAppDeepLink', () => {
  it('builds a wa.me URL with phone and encoded message', () => {
    const url = buildWhatsAppDeepLink({
      number: '27821234567',
      message: 'Hi I would like to book',
    });

    expect(url).toBe('https://wa.me/27821234567?text=Hi%20I%20would%20like%20to%20book');
  });

  it('encodes special characters in the message', () => {
    const url = buildWhatsAppDeepLink({
      number: '27821234567',
      message: 'Hi & thanks = awesome?',
    });

    expect(url).toContain('Hi%20%26%20thanks%20%3D%20awesome%3F');
  });
});

describe('resolveCtaTarget', () => {
  it('returns whatsapp kind when source is whatsapp and number is valid', () => {
    const result = resolveCtaTarget({
      item: baseEvent,
      currentUrl: 'https://www.sayso.co.za/event/evt-1',
      ctaSource: 'whatsapp',
      bookingUrl: 'https://wa.me/27821234567',
      whatsappNumber: '+27 82 123 4567',
    });

    expect(result.ctaKind).toBe('whatsapp');
    expect(result.ctaSource).toBe('whatsapp');
    expect(result.url).toContain('https://wa.me/27821234567?text=');
  });

  it('returns booking kind when source is booking_url', () => {
    const result = resolveCtaTarget({
      item: baseEvent,
      currentUrl: 'https://www.sayso.co.za/event/evt-1',
      ctaSource: 'website',
      bookingUrl: 'https://tickets.example.com/event/evt-1',
    });

    expect(result.ctaKind).toBe('external_url');
    expect(result.url).toBe('https://tickets.example.com/event/evt-1');
  });

  it('returns share fallback when no booking or whatsapp data available', () => {
    const result = resolveCtaTarget({
      item: baseEvent,
      currentUrl: 'https://www.sayso.co.za/event/evt-1',
      ctaSource: null,
      bookingUrl: null,
      whatsappNumber: null,
    });

    expect(result.ctaKind).toBe('external_url');
    expect(result.url).toBeNull();
  });

  it('falls back to non-whatsapp when whatsapp number is invalid', () => {
    const result = resolveCtaTarget({
      item: baseEvent,
      currentUrl: 'https://www.sayso.co.za/event/evt-1',
      ctaSource: 'whatsapp',
      bookingUrl: 'https://wa.me/123',
      whatsappNumber: '12',
    });

    expect(result.ctaKind).toBe('external_url');
    expect(result.url).toBe('https://wa.me/123');
  });
});

describe('extractWhatsAppNumberFromUrl', () => {
  it('extracts number from wa.me path', () => {
    expect(extractWhatsAppNumberFromUrl('https://wa.me/27821234567')).toBe('27821234567');
  });

  it('extracts number from query param', () => {
    expect(
      extractWhatsAppNumberFromUrl('https://api.whatsapp.com/send?phone=+27%2082%20123%204567')
    ).toBe('27821234567');
  });

  it('returns null for non-whatsapp URL', () => {
    expect(extractWhatsAppNumberFromUrl('https://tickets.example.com/event/evt-1')).toBeNull();
  });
});
