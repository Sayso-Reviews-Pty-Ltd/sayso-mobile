import { Platform } from 'react-native';
import { NAVBAR_BG_COLOR } from '../styles/colors';

const APP_BACKGROUND_COLOR = '#E5E0E5';

const sharedHeaderStyles = {
  headerTitleStyle: { fontFamily: 'Urbanist_700Bold' },
  headerBackTitleStyle: { fontFamily: 'Urbanist_500Medium' },
};

// TODO: re-enable statusBarColor/statusBarStyle/statusBarTranslucent/navigationBarColor
// once dev build is ready — these require UIViewControllerBasedStatusBarAppearance
// in Info.plist which Expo Go ignores.

export const rootStackScreenOptions = {
  ...sharedHeaderStyles,
  animation: 'fade',
  contentStyle: { backgroundColor: APP_BACKGROUND_COLOR },
} as const;

export const sharedStackScreenOptions = {
  ...sharedHeaderStyles,
  animation: 'fade',
  headerShadowVisible: false,
  headerStyle: { backgroundColor: NAVBAR_BG_COLOR },
  headerTintColor: '#FFFFFF',
  contentStyle: { backgroundColor: APP_BACKGROUND_COLOR },
} as const;

export const fullScreenModalScreenOptions = {
  ...sharedHeaderStyles,
  presentation: Platform.OS === 'web' ? 'card' : 'fullScreenModal',
  animation: 'fade',
  headerShown: false,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: APP_BACKGROUND_COLOR },
} as const;

export const sheetModalScreenOptions = {
  ...sharedHeaderStyles,
  presentation: Platform.OS === 'web' ? 'card' : 'modal',
  animation: 'fade',
  headerShadowVisible: false,
  contentStyle: { backgroundColor: APP_BACKGROUND_COLOR },
} as const;
