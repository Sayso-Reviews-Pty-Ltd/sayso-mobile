import { FlatList, RefreshControl, SafeAreaView, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useTrending } from '../../hooks/useTrending';
import { AppHeader } from '../../components/AppHeader';
import { BusinessCard } from '../../components/BusinessCard';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonCard } from '../../components/SkeletonCard';
import { Text } from '../../components/Typography';

type Props = {
  title: string;
  subtitle: string;
  count?: number;
};

export function BusinessFeedScreen({ title, subtitle, count = 20 }: Props) {
  const { data, isLoading, isError, refetch, isRefetching } = useTrending(count);
  const businesses = data?.businesses ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title }} />
      <FlatList
        data={isLoading ? [] : businesses}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppHeader title={title} subtitle={subtitle} />
            {!isLoading && !isError && businesses.length > 0 ? (
              <Text style={styles.caption}>
                Showing a live mobile feed while the route-specific experience is built out.
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingList}>
              {[1, 2, 3].map((item) => (
                <SkeletonCard key={`${title}-${item}`} />
              ))}
            </View>
          ) : isError ? (
            <EmptyState
              icon="wifi-outline"
              title={`Couldn't load ${title.toLowerCase()}`}
              message="Pull to refresh and try again."
            />
          ) : (
            <EmptyState
              icon="storefront-outline"
              title={`No ${title.toLowerCase()} yet`}
              message="Check back shortly for updated recommendations."
            />
          )
        }
        renderItem={({ item }) => <BusinessCard business={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingBottom: 8,
  },
  caption: {
    fontSize: 13,
    color: '#6B7280',
    paddingHorizontal: 20,
  },
  list: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  loadingList: {
    gap: 12,
    paddingHorizontal: 16,
  },
});
