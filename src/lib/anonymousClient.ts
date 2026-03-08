import AsyncStorage from '@react-native-async-storage/async-storage';

const ANON_STORAGE_KEY = 'sayso_anon_id';

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function createUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
}

export async function getOrCreateAnonymousId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(ANON_STORAGE_KEY);
    if (existing && isUuidLike(existing)) {
      return existing;
    }
    const newId = createUuid();
    await AsyncStorage.setItem(ANON_STORAGE_KEY, newId);
    return newId;
  } catch {
    return createUuid();
  }
}
