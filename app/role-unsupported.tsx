import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Text } from '../src/components/Typography';
import { supabase } from '../src/lib/supabase';

export default function RoleUnsupportedScreen() {
  const router = useRouter();

  function handleSignOut() {
    // Call signOut directly — do not reuse any shared sign-out helper that has
    // side-effects (analytics, state resets). The app may be partially
    // initialised for unsupported roles.
    // Redirect to onboarding regardless of whether signOut resolves or rejects.
    supabase.auth.signOut().finally(() => {
      router.replace('/onboarding');
    });
  }

  return (
    <>
      {/* Lock this screen: no back gesture, no swipe-to-dismiss. */}
      <Stack.Screen options={{ gestureEnabled: false, headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#1A1A1A' }}>Use web portal</Text>
          <Text style={{ marginTop: 8, color: '#555' }}>
            Business-owner and admin roles are available on web in v1.
          </Text>
          {/* Rendered unconditionally — not gated on role, network, or any state. */}
          <Pressable
            onPress={handleSignOut}
            style={{ marginTop: 24, padding: 16, backgroundColor: '#1A1A1A', borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Sign out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}
