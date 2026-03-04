import Constants from 'expo-constants';

function normalizeApiBaseUrl(raw: string) {
  const trimmed = raw.trim().replace(/\/+$/, '');

  if (trimmed === 'https://sayso.co.za') {
    return 'https://www.sayso.co.za';
  }

  return trimmed;
}

export const ENV = {
  apiBaseUrl: normalizeApiBaseUrl(
    process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000'
  ),
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  easProjectId:
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    (Constants.expoConfig?.extra as any)?.eas?.projectId ||
    '',
};

if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
  console.warn('[ENV] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
}
