export function formatMemberSince(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const year = String(date.getFullYear()).slice(-2);
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} '${year}`;
}

export function normalizeProfileLocation(value?: string | null) {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return 'Location not set';
  if (/^[a-z]{2}(?:-[A-Z]{2})?$/.test(trimmed)) return 'Location not set';
  return trimmed;
}

export function extractStoragePath(avatarUrl?: string | null) {
  if (!avatarUrl) return null;
  const token = '/storage/v1/object/public/avatars/';
  const tokenIndex = avatarUrl.indexOf(token);
  if (tokenIndex < 0) return null;
  const start = tokenIndex + token.length;
  const withoutQuery = avatarUrl.slice(start).split('?')[0];
  if (!withoutQuery) return null;
  return decodeURIComponent(withoutQuery);
}

export function getAvatarExtension(fileName?: string | null, mimeType?: string | null) {
  if (fileName && fileName.includes('.')) {
    return fileName.split('.').pop()?.toLowerCase() || 'jpg';
  }
  if (mimeType && mimeType.includes('/')) {
    const subtype = mimeType.split('/')[1]?.toLowerCase() || '';
    if (subtype === 'jpeg') return 'jpg';
    return subtype || 'jpg';
  }
  return 'jpg';
}

export function normalizeLocalSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function badgeImageSource(iconPath?: string | null) {
  if (!iconPath) return null;
  if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
    return { uri: iconPath };
  }
  return null;
}
