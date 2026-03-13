import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { routes } from '../../navigation/routes';
import { SkeletonBlock } from '../../components/SkeletonBlock';
import { Text } from '../../components/Typography';

export default function ProfileUsernameScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!username) {
        setError('No username provided.');
        return;
      }

      try {
        const { data, error: dbError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('username', username.toLowerCase())
          .single();

        if (cancelled) return;

        if (dbError || !data?.user_id) {
          setError(`@${username} not found.`);
          return;
        }

        router.replace(routes.reviewer(data.user_id) as never);
      } catch {
        if (!cancelled) setError('Something went wrong. Please try again.');
      }
    }

    resolve();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.skeletonWrap}>
            <SkeletonBlock style={styles.skeletonOrb} />
            <SkeletonBlock style={styles.skeletonLine} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E0E5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  skeletonWrap: {
    alignItems: 'center',
    gap: 10,
  },
  skeletonOrb: {
    width: 54,
    height: 54,
    borderRadius: 999,
  },
  skeletonLine: {
    width: 132,
    height: 10,
    borderRadius: 999,
  },
  errorText: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
