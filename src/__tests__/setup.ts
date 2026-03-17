import { notifyManager } from '@tanstack/react-query';
import { act } from '@testing-library/react-native';

// Wrap every React Query notification in act() so state updates are
// tracked by React's test renderer, eliminating "not wrapped in act" warnings.
notifyManager.setNotifyFunction((fn) => {
  act(fn);
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ auth: { getSession: jest.fn() } })),
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

  return {
    __esModule: true,
    default: {
      View: React.forwardRef((props: any, ref: any) =>
        React.createElement(View, { ...props, ref }, props.children)
      ),
    },
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: (updater: () => object) => updater(),
    withSpring: (value: unknown) => value,
    cancelAnimation: jest.fn(),
  };
});
