import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ForYouLocation = {
  lat: number;
  lng: number;
  source: 'device' | 'fallback';
};

const FALLBACK_LOCATION: ForYouLocation = {
  lat: -33.9249,
  lng: 18.4241,
  source: 'fallback',
};
const STORED_LOCATION_KEY = 'for_you_location';

export function useForYouLocation(enabled = true) {
  const [location, setLocation] = useState<ForYouLocation>(FALLBACK_LOCATION);

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') {
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORED_LOCATION_KEY);
        if (stored && active) {
          try {
            const parsed = JSON.parse(stored) as { lat?: number; lng?: number };
            if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
              setLocation({
                lat: parsed.lat,
                lng: parsed.lng,
                source: 'fallback',
              });
            }
          } catch {
            // Ignore malformed cached location.
          }
        }

        const permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted) {
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!active) {
          return;
        }

        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: 'device',
        });
        void AsyncStorage.setItem(
          STORED_LOCATION_KEY,
          JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        );
      } catch {
        // Keep fallback location.
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [enabled]);

  return location;
}
