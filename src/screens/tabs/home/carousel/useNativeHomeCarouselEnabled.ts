import { useEffect } from 'react';
import { Platform } from 'react-native';
import { ENV } from '../../../../lib/env';
import { track } from '../../../../lib/telemetry';

let hasTrackedHomeNativeCarouselExposure = false;

export function useNativeHomeCarouselEnabled() {
  const enabled = Platform.OS !== 'web' && ENV.homeNativeCarouselEnabled;

  useEffect(() => {
    if (!enabled || hasTrackedHomeNativeCarouselExposure) {
      return;
    }

    hasTrackedHomeNativeCarouselExposure = true;
    track('rollout.home_native_carousel_exposed', { platform: Platform.OS });
  }, [enabled]);

  return enabled;
}
