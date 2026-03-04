import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTrending } from '../../hooks/useTrending';
import { routes } from '../../navigation/routes';
import { AppHeader } from '../../components/AppHeader';
import { BusinessCard } from '../../components/BusinessCard';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonCard } from '../../components/SkeletonCard';
import { Text } from '../../components/Typography';

const quickLinks = [
  { label: 'For You', href: routes.forYou() },
  { label: 'Trending', href: routes.trending() },
  { label: 'Events', href: routes.events() },
  { label: 'Specials', href: routes.eventsSpecials() },
  { label: 'Reviews', href: routes.discoverReviews() },
  { label: 'Leaderboard', href: routes.leaderboard() },
];

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = useTrending(20);
  const businesses = data?.businesses ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <AppHeader title="Sayso" subtitle="Discover Cape Town" showBell />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickLinks}
        >
          {quickLinks.map((link) => (
            <TouchableOpacity
              key={link.href}
              style={styles.quickLink}
              onPress={() => router.push(link.href as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickLinkText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Now</Text>

          {isLoading ? (
            <View style={styles.grid}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.gridItem}>
                  <SkeletonCard />
                </View>
              ))}
            </View>
          ) : isError ? (
            <EmptyState
              icon="wifi-outline"
              title="Couldn't load businesses"
              message="Check your connection and pull down to retry."
            />
          ) : businesses.length === 0 ? (
            <EmptyState
              icon="storefront-outline"
              title="Nothing trending yet"
              message="Check back soon."
            />
          ) : (
            <View style={styles.grid}>
              {businesses.map((business) => (
                <View key={business.id} style={styles.gridItem}>
                  <BusinessCard business={business} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  quickLinks: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 10,
  },
  quickLink: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  grid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
});
