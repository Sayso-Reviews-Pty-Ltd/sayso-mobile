import { notifyManager } from '@tanstack/react-query';
import { act } from '@testing-library/react-native';
import { InteractionManager } from 'react-native';

// Wrap every React Query notification in act() so state updates are
// tracked by React's test renderer, eliminating "not wrapped in act" warnings.
notifyManager.setNotifyFunction((fn) => {
  act(fn);
});

jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation((task: unknown) => {
  if (typeof task === 'function') {
    task();
  }
  return { cancel: jest.fn() } as any;
});

afterEach(() => {
  try {
    jest.clearAllTimers();
  } catch {
    // Ignore when real timers are active
  }
  jest.useRealTimers();
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signOut: jest.fn().mockResolvedValue({}),
    },
  })),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const Ionicons = ({ name, testID }: { name?: string; testID?: string }) =>
    React.createElement(Text, { testID: testID ?? `icon-${name ?? 'unknown'}` }, name ?? '');

  return { Ionicons };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  const passThrough = (value: unknown) => value;
  const identity = (value: number) => value;
  const interpolate = (value: number, input: number[], output: number[]) => {
    if (input.length < 2 || output.length < 2) return output[0] ?? value;
    const startIn = input[0];
    const endIn = input[input.length - 1];
    const startOut = output[0];
    const endOut = output[output.length - 1];
    if (endIn === startIn) return endOut;
    const t = (value - startIn) / (endIn - startIn);
    return startOut + t * (endOut - startOut);
  };

  return {
    __esModule: true,
    default: {
      View: React.forwardRef((props: any, ref: any) =>
        React.createElement(View, { ...props, ref }, props.children)
      ),
    },
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: (updater: () => object) => updater(),
    withSpring: passThrough,
    withTiming: passThrough,
    withDelay: (_delay: number, value: unknown) => value,
    withSequence: (...values: unknown[]) => values[values.length - 1],
    withRepeat: (value: unknown) => value,
    interpolate,
    makeMutable: (value: unknown) => ({ value }),
    Easing: {
      linear: identity,
      quad: identity,
      cubic: identity,
      sin: identity,
      ease: identity,
      out: (fn: (value: number) => number) => fn,
      inOut: (fn: (value: number) => number) => fn,
    },
    runOnJS: (fn: (...args: any[]) => unknown) => fn,
    cancelAnimation: jest.fn(),
  };
});
