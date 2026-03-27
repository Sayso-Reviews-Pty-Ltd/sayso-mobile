import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

// Module-level cache so only the very first mount pays the async resolution
// cost. All subsequent instances read the cached value synchronously on init,
// eliminating the brief flash of animation for reduced-motion users.
let _cached: boolean | null = null;
const _listeners = new Set<(v: boolean) => void>();

function _subscribe(cb: (v: boolean) => void) {
  _listeners.add(cb);
  return () => {
    _listeners.delete(cb);
  };
}

function _notify(value: boolean) {
  _cached = value;
  _listeners.forEach((cb) => cb(value));
}

// Bootstrap the check once, lazily on first hook call.
let _bootstrapped = false;
function _bootstrap() {
  if (_bootstrapped) return;
  _bootstrapped = true;

  void AccessibilityInfo.isReduceMotionEnabled()
    .then(_notify)
    .catch(() => _notify(false));

  AccessibilityInfo.addEventListener('reduceMotionChanged', _notify);
}

export function useReducedMotion(): boolean {
  const [value, setValue] = useState<boolean>(() => _cached ?? false);

  useEffect(() => {
    _bootstrap();

    // If the cache was already populated before this component mounted,
    // sync the local state immediately (covers all mounts after the first).
    if (_cached !== null && _cached !== value) {
      setValue(_cached);
    }

    return _subscribe(setValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
}
