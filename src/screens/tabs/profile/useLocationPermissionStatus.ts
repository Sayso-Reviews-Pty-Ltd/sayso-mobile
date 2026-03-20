import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import type { LocationCardStatus } from './types';

export function useLocationPermissionStatus() {
  const [locationStatus, setLocationStatus] = useState<LocationCardStatus>('loading');

  const syncLocationPermission = useCallback(async () => {
    setLocationStatus('loading');
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      if (permission.granted) {
        setLocationStatus('granted');
        return;
      }
      setLocationStatus(permission.canAskAgain ? 'prompt' : 'denied');
    } catch {
      setLocationStatus('prompt');
    }
  }, []);

  const requestLocationPermission = useCallback(async () => {
    setLocationStatus('loading');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.granted) {
        setLocationStatus('granted');
        return;
      }
      setLocationStatus(permission.canAskAgain ? 'prompt' : 'denied');
    } catch {
      setLocationStatus('denied');
    }
  }, []);

  useEffect(() => {
    syncLocationPermission();
  }, [syncLocationPermission]);

  return {
    locationStatus,
    requestLocationPermission,
    syncLocationPermission,
  };
}
