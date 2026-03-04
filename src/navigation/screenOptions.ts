import { Platform } from 'react-native';

const sharedHeaderStyles = {
  headerTitleStyle: { fontFamily: 'Urbanist_700Bold' },
  headerBackTitleStyle: { fontFamily: 'Urbanist_500Medium' },
};

export const rootStackScreenOptions = {
  ...sharedHeaderStyles,
  contentStyle: { backgroundColor: '#FFFFFF' },
} as const;

export const sharedStackScreenOptions = {
  ...sharedHeaderStyles,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#F9FAFB' },
} as const;

export const fullScreenModalScreenOptions = {
  ...sharedHeaderStyles,
  presentation: Platform.OS === 'web' ? 'card' : 'fullScreenModal',
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#FFFFFF' },
} as const;

export const sheetModalScreenOptions = {
  ...sharedHeaderStyles,
  presentation: Platform.OS === 'web' ? 'card' : 'modal',
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#FFFFFF' },
} as const;
