import Constants from 'expo-constants';

type MapLibreModule = typeof import('@maplibre/maplibre-react-native').default;

let cachedMapLibre: MapLibreModule | null | undefined;
let configuredAccessToken: string | null = null;

function isExpoGoRuntime() {
  const constants = Constants as { appOwnership?: string | null; executionEnvironment?: string | null };
  return constants.appOwnership === 'expo' || constants.executionEnvironment === 'storeClient';
}

export function getMapLibreModule() {
  if (cachedMapLibre !== undefined) {
    return cachedMapLibre;
  }

  if (isExpoGoRuntime()) {
    cachedMapLibre = null;
    return cachedMapLibre;
  }

  const runtimeRequire = (globalThis as { require?: (id: string) => unknown }).require;
  if (!runtimeRequire) {
    cachedMapLibre = null;
    return cachedMapLibre;
  }

  try {
    // Dev builds may include this native module; Expo Go is filtered above.
    const resolved = runtimeRequire('@maplibre/maplibre-react-native');
    cachedMapLibre = (resolved?.default ?? resolved) as MapLibreModule;
  } catch {
    cachedMapLibre = null;
  }

  return cachedMapLibre;
}

export function configureMapLibreAccessToken(token: string) {
  const mapLibre = getMapLibreModule();
  const normalizedToken = token.trim();

  if (!mapLibre || !normalizedToken) {
    return false;
  }

  if (configuredAccessToken === normalizedToken) {
    return true;
  }

  mapLibre.setAccessToken(normalizedToken);
  configuredAccessToken = normalizedToken;
  return true;
}
