import { GENERIC_API_MESSAGES, REVIEW_ERROR_MESSAGES } from './constants';

function isGenericApiMessage(message?: string): boolean {
  if (!message) return false;
  return GENERIC_API_MESSAGES.has(message.trim());
}

export function getErrorMessage(result: { message?: string; code?: string; error?: string }): string {
  if (result.message && !isGenericApiMessage(result.message)) return result.message;
  if (result.code && REVIEW_ERROR_MESSAGES[result.code]) return REVIEW_ERROR_MESSAGES[result.code];
  if (result.error) return result.error;
  if (result.message) return result.message;
  return 'An error occurred. Please try again.';
}

export function isPlaceholderImage(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes('businessImagePlaceholders/') ||
    url.includes('assets/businessImagePlaceholders/')
  );
}

export function toSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function relativeDate(iso: string): string {
  if (!iso) return 'Recently';
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff)) return 'Recently';
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
