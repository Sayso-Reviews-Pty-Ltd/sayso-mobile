import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Providers } from '../src/providers/Providers';

export default function RootLayout() {
  return (
    <Providers>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="role-unsupported" options={{ headerShown: false }} />
        <Stack.Screen name="business/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="business/[id]/review" options={{ headerShown: true }} />
      </Stack>
    </Providers>
  );
}
