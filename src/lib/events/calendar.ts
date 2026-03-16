import type { EventSpecialListItemDto } from '@sayso/contracts';

export function toGoogleDate(value?: string) {
  if (!value) return '';
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function buildFallbackEnd(startISO?: string) {
  if (!startISO) return '';
  const parsed = new Date(startISO);
  if (!Number.isFinite(parsed.getTime())) {
    return '';
  }

  return new Date(parsed.getTime() + 2 * 60 * 60 * 1000).toISOString();
}

export function buildGoogleCalendarUrl(item: EventSpecialListItemDto) {
  const start = toGoogleDate(item.startDateISO);
  const end = toGoogleDate(item.endDateISO) || toGoogleDate(buildFallbackEnd(item.startDateISO) || undefined);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: item.title,
    dates: start && end ? `${start}/${end}` : '',
    details: item.description ?? '',
    location: item.location ?? '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
