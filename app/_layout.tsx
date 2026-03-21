import { enableScreens } from 'react-native-screens';
import { Stack } from 'expo-router';
import { View } from 'react-native';

enableScreens(true);
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from '@expo-google-fonts/urbanist';
import { useFonts as useLocalFonts } from 'expo-font';
import { Providers } from '../src/providers/Providers';
import { RootGuard } from '../src/components/RootGuard';
import { rootStackScreenOptions } from '../src/navigation/screenOptions';
import { NAVBAR_BG_COLOR } from '../src/styles/colors';

// TransitionScopeProvider has been moved to individual screens via
// ScreenTransitionScope, which uses useFocusEffect for per-screen isolation.
// Each screen now independently replays its spring-in on every focus event
// (forward nav, back nav, tab switch) without affecting sibling screens.

export default function RootLayout() {
  const [urbanistLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });
  const [brandFontsLoaded] = useLocalFonts({
    MonarchParadox: require('../assets/fonts/monarchparadox.otf'),
  });

  if (!urbanistLoaded || !brandFontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: NAVBAR_BG_COLOR }}>
      <Providers>
        {/* TODO: re-enable once dev build is ready — Expo Go ignores Info.plist */}
        {/* <StatusBar style="light" backgroundColor={NAVBAR_BG_COLOR} translucent={false} /> */}
        <RootGuard>
          <Stack screenOptions={rootStackScreenOptions}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(stack)" options={{ headerShown: false }} />
            <Stack.Screen name="(modals)" options={{ headerShown: false }} />
            <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
            <Stack.Screen name="role-unsupported" options={{ headerShown: false, gestureEnabled: false }} />
          </Stack>
        </RootGuard>
      </Providers>
    </View>
  );
}
