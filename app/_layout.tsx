import { Stack } from 'expo-router';
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
import { rootStackScreenOptions } from '../src/navigation/screenOptions';

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
    <Providers>
      <StatusBar style="dark" />
      <Stack screenOptions={rootStackScreenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(stack)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen name="role-unsupported" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}
