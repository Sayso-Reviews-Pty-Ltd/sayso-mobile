import { useCallback, useMemo } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { PaginatedBusinessFeedResponseDto } from '@sayso/contracts';
import { BusinessFeed } from '../../src/components/feed/BusinessFeed';
import { EmptyState } from '../../src/components/EmptyState';
import { SkeletonBusinessCard } from '../../src/components/feed/SkeletonBusinessCard';
import { HeaderBellButton } from '../../src/components/HeaderBellButton';
import { Text } from '../../src/components/Typography';
import { useAuthSession } from '../../src/hooks/useSession';
import { useUserPreferences } from '../../src/hooks/useUserPreferences';
import { apiFetch } from '../../src/lib/api';
import { routes } from '../../src/navigation/routes';
import { homeTokens } from '../../src/screens/tabs/home/HomeTokens';

const REQUEST_LIMIT = 120;
const VISIBLE_CHUNK_SIZE = 12;
const NAVBAR_BG = '#722F37';
const SCROLL_COLOR_THRESHOLD = 60;

export default function ForYouRoute() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuthSession();
  const preferences = useUserPreferences(Boolean(user));

  const preferenceIds = useMemo(
    () => ({
      interests: preferences.interests.map((item) => item.id),
      subcategories: preferences.subcategories.map((item) => item.id),
      dealbreakers: preferences.dealbreakers.map((item) => item.id),
    }),
    [preferences.dealbreakers, preferences.interests, preferences.subcategories]
  );

  const hasPreferences =
    preferenceIds.interests.length > 0 ||
    preferenceIds.subcategories.length > 0 ||
    preferenceIds.dealbreakers.length > 0;

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'For You' }} />
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>For You</Text>
            <Text style={styles.subtitle}>Personalized discovery starts after sign-in.</Text>
          </View>
          <HeaderBellButton />
        </View>

        <LinearGradient
          colors={[homeTokens.coral, homeTokens.coralDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.guestCard}
        >
          <Text style={styles.guestTitle}>Create an account to unlock personalised recommendations.</Text>
          <TouchableOpacity
            style={styles.guestPrimary}
            onPress={() => router.push(routes.register() as never)}
            activeOpacity={0.88}
          >
            <Text style={styles.guestPrimaryText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.guestSecondary}
            onPress={() => router.push(routes.login() as never)}
            activeOpacity={0.88}
          >
            <Text style={styles.guestSecondaryText}>Sign In</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const fetchForYouPage = (cursor: string | null) => {
    const params = new URLSearchParams();
    params.set('limit', String(REQUEST_LIMIT));
    params.set('feed_strategy', 'mixed');
    if (preferenceIds.interests.length > 0) {
      params.set('interest_ids', preferenceIds.interests.join(','));
    }
    if (preferenceIds.subcategories.length > 0) {
      params.set('sub_interest_ids', preferenceIds.subcategories.join(','));
    }
    if (preferenceIds.dealbreakers.length > 0) {
      params.set('dealbreakers', preferenceIds.dealbreakers.join(','));
    }
    if (cursor) {
      params.set('cursor', cursor);
    }

    return apiFetch<PaginatedBusinessFeedResponseDto>(`/api/businesses?${params.toString()}`);
  };

  const handleScrollY = useCallback((y: number) => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: y > SCROLL_COLOR_THRESHOLD ? NAVBAR_BG : homeTokens.offWhite,
      },
      headerTintColor: y > SCROLL_COLOR_THRESHOLD ? '#FFFFFF' : homeTokens.charcoal,
    });
  }, [navigation]);

  const feedListHeaderTop = (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.title}>For You</Text>
        <Text style={styles.subtitle}>A personalized discovery feed for your next outing.</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'For You',
          headerRight: () => <HeaderBellButton />,
        }}
      />

      {preferences.isLoading ? (
        <View style={styles.loadingList}>
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBusinessCard key={`for-you-loading-${index}`} />
          ))}
        </View>
      ) : preferences.error ? (
        <EmptyState
          icon="wifi-outline"
          title="Couldn't load personalised picks right now."
          message={preferences.error}
        />
      ) : !hasPreferences ? (
        <EmptyState
          icon="sparkles-outline"
          title="Curated from your interests"
          message="Based on what you selected, no matches in this feed yet."
        />
      ) : (
        <BusinessFeed
          feedKey="for-you"
          queryKey={['for-you', user.id, preferenceIds, REQUEST_LIMIT]}
          listHeaderTop={feedListHeaderTop}
          onScrollY={handleScrollY}
          errorTitle="Couldn't load personalised picks right now."
          emptyTitle="Curated from your interests"
          emptyMessage="Based on what you selected, no matches in this feed yet."
          requestLimit={REQUEST_LIMIT}
          visibleChunkSize={VISIBLE_CHUNK_SIZE}
          fetchPage={fetchForYouPage}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: homeTokens.offWhite,
  },
  header: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: homeTokens.charcoal,
  },
  subtitle: {
    fontSize: 15,
    color: homeTokens.textSecondary,
    marginTop: 4,
  },
  guestCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 28,
    padding: 20,
    gap: 12,
  },
  guestTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: homeTokens.white,
  },
  guestPrimary: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: homeTokens.white,
    paddingVertical: 14,
  },
  guestPrimaryText: {
    textAlign: 'center',
    color: homeTokens.coral,
    fontSize: 14,
    fontWeight: '700',
  },
  guestSecondary: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    paddingVertical: 14,
  },
  guestSecondaryText: {
    textAlign: 'center',
    color: homeTokens.white,
    fontSize: 14,
    fontWeight: '700',
  },
  loadingList: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
