import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { calculateDistanceKm } from '../lib/distance';

type BusinessCardLocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable';

type LocationCoords = {
  lat: number;
  lng: number;
};

type LocationState = {
  status: BusinessCardLocationStatus;
  coords: LocationCoords | null;
};

const listeners = new Set<(state: LocationState) => void>();

let state: LocationState = {
  status: 'idle',
  coords: null,
};

let requestInFlight = false;

function emitState() {
  for (const listener of listeners) {
    listener(state);
  }
}

function updateState(next: Partial<LocationState>) {
  state = { ...state, ...next };
  emitState();
}

async function requestSharedLocation() {
  if (requestInFlight) return;
  requestInFlight = true;
  updateState({ status: 'loading' });

  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      updateState({ status: 'denied', coords: null });
      return;
    }

    const currentPosition = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    updateState({
      status: 'granted',
      coords: {
        lat: currentPosition.coords.latitude,
        lng: currentPosition.coords.longitude,
      },
    });
  } catch {
    updateState({ status: 'unavailable', coords: null });
  } finally {
    requestInFlight = false;
  }
}

export function isValidCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function useBusinessCardLocation() {
  const [locationState, setLocationState] = useState<LocationState>(state);

  useEffect(() => {
    listeners.add(setLocationState);
    setLocationState(state);
    return () => {
      listeners.delete(setLocationState);
    };
  }, []);

  const requestLocation = useCallback(async () => {
    await requestSharedLocation();
  }, []);

  const getDistanceKm = useCallback(
    (businessLat: number, businessLng: number) => {
      if (locationState.status !== 'granted' || !locationState.coords) {
        return null;
      }

      if (!isValidCoordinate(businessLat) || !isValidCoordinate(businessLng)) {
        return null;
      }

      return calculateDistanceKm(
        locationState.coords.lat,
        locationState.coords.lng,
        businessLat,
        businessLng
      );
    },
    [locationState.coords, locationState.status]
  );

  return {
    status: locationState.status,
    coords: locationState.coords,
    requestLocation,
    getDistanceKm,
  };
}
