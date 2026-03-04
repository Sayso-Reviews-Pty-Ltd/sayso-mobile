import { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBusinessDetail } from '../../hooks/useBusinessDetail';
import { useBusinessReviews } from '../../hooks/useBusinessReviews';
import {
  useSaveBusiness,
  useSavedBusinesses,
  useUnsaveBusiness,
} from '../../hooks/useSavedBusinesses';
import { useAuthSession } from '../../hooks/useSession';
import { routes } from '../../navigation/routes';
import { CardSurface } from '../../components/CardSurface';
import { EmptyState } from '../../components/EmptyState';
import { StarRating } from '../../components/StarRating';
import { Text } from '../../components/Typography';

type Tab = 'overview' | 'reviews';

type Props = {
  initialTab?: Tab;
};

export default function BusinessScreen({ initialTab = 'overview' }: Props) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthSession();
  const [tab, setTab] = useState<Tab>(initialTab);

  const { data: business, isLoading, isError } = useBusinessDetail(id);
  const {
    data: reviewsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBusinessReviews(id);
  const { data: savedData } = useSavedBusinesses();
  const saveMutation = useSaveBusiness();
  const unsaveMutation = useUnsaveBusiness();

  const isSaved = savedData?.businesses?.some((item: { id: string }) => item.id === id) ?? false;
  const allReviews = reviewsData?.pages.flatMap((page) => page.data) ?? [];

  const toggleSave = () => {
    if (!user) {
      router.push(routes.login() as never);
      return;
    }

    if (isSaved) {
      unsaveMutation.mutate(id);
      return;
    }

    saveMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Business' }} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !business) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Business' }} />
        <EmptyState
          icon="alert-circle-outline"
          title="Business not found"
          message="This business may no longer be available."
          actionLabel="Go home"
          onAction={() => router.replace(routes.home() as never)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: business.name,
          headerRight: () => (
            <TouchableOpacity onPress={toggleSave} style={styles.headerBtn}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isSaved ? '#2563EB' : '#111827'}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: business.image_url ?? undefined }}
          style={styles.heroImage}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />

        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.businessName}>{business.name}</Text>
            {business.verified ? (
              <Ionicons name="checkmark-circle" size={20} color="#2563EB" style={{ marginLeft: 6 }} />
            ) : null}
          </View>

          {business.category_label ? <Text style={styles.category}>{business.category_label}</Text> : null}

          <View style={styles.ratingRow}>
            {typeof business.rating === 'number' && business.rating > 0 ? (
              <>
                <StarRating value={Math.round(business.rating)} size={16} />
                <Text style={styles.ratingText}>
                  {business.rating.toFixed(1)} ({business.reviews ?? 0} reviews)
                </Text>
              </>
            ) : (
              <Text style={styles.noRating}>No reviews yet</Text>
            )}
          </View>

          <View style={styles.contactRow}>
            {business.address ? (
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={15} color="#6B7280" />
                <Text style={styles.contactText} numberOfLines={2}>
                  {business.address}
                </Text>
              </View>
            ) : null}
            {business.phone ? (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => Linking.openURL(`tel:${business.phone}`)}
              >
                <Ionicons name="call-outline" size={15} color="#6B7280" />
                <Text style={[styles.contactText, styles.link]}>{business.phone}</Text>
              </TouchableOpacity>
            ) : null}
            {business.website ? (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => business.website && Linking.openURL(business.website)}
              >
                <Ionicons name="globe-outline" size={15} color="#6B7280" />
                <Text style={[styles.contactText, styles.link]} numberOfLines={1}>
                  {business.website.replace(/^https?:\/\//, '')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.tabBar}>
          {(['overview', 'reviews'] as Tab[]).map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.tabBtn, tab === value && styles.tabBtnActive]}
              onPress={() => {
                setTab(value);
                if (value === 'reviews' && initialTab !== 'reviews') {
                  router.replace(routes.businessReviews(id) as never);
                }
                if (value === 'overview' && initialTab === 'reviews') {
                  router.replace(routes.businessDetail(id) as never);
                }
              }}
            >
              <Text style={[styles.tabLabel, tab === value && styles.tabLabelActive]}>
                {value === 'overview' ? 'Overview' : `Reviews${allReviews.length ? ` (${allReviews.length})` : ''}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'overview' ? (
          <View style={styles.tabContent}>
            {business.description ? (
              <>
                <Text style={styles.sectionHeading}>About</Text>
                <Text style={styles.description}>{business.description}</Text>
              </>
            ) : (
              <EmptyState icon="information-circle-outline" title="No description yet" />
            )}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push(routes.businessReviews(id) as never)}
            >
              <Text style={styles.secondaryButtonText}>View reviews</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.writeReviewBtn}
              onPress={() => {
                if (!user) {
                  router.push(routes.login() as never);
                  return;
                }

                router.push(routes.writeReview('business', id) as never);
              }}
            >
              <Ionicons name="pencil-outline" size={16} color="#FFF" />
              <Text style={styles.writeReviewTxt}>Write a Review</Text>
            </TouchableOpacity>

            {allReviews.length === 0 ? (
              <EmptyState
                icon="star-outline"
                title="No reviews yet"
                message="Be the first to review this business."
              />
            ) : (
              <>
                {allReviews.map((review) => (
                  <CardSurface key={review.id} radius={16} contentStyle={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewerName}>
                        {review.display_name || review.username || 'Anonymous'}
                      </Text>
                      <StarRating value={review.rating} size={13} />
                    </View>
                    {review.body ? <Text style={styles.reviewBody}>{review.body}</Text> : null}
                    <Text style={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </CardSurface>
                ))}

                {hasNextPage ? (
                  <TouchableOpacity
                    style={styles.loadMoreBtn}
                    onPress={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    <Text style={styles.loadMoreTxt}>
                      {isFetchingNextPage ? 'Loading...' : 'Load more reviews'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerBtn: { paddingLeft: 12 },
  heroImage: { width: '100%', height: 240, backgroundColor: '#F3F4F6' },
  infoSection: { padding: 20, gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  businessName: { flex: 1, fontSize: 24, fontWeight: '800', color: '#111827' },
  category: { fontSize: 14, color: '#6B7280' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { fontSize: 14, color: '#374151' },
  noRating: { fontSize: 14, color: '#9CA3AF' },
  contactRow: { gap: 10, marginTop: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { flex: 1, fontSize: 14, color: '#4B5563' },
  link: { color: '#2563EB' },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tabBtn: {
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#111827',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#111827',
  },
  tabContent: {
    padding: 20,
    gap: 14,
  },
  sectionHeading: { fontSize: 18, fontWeight: '700', color: '#111827' },
  description: { fontSize: 15, lineHeight: 24, color: '#4B5563' },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 14,
  },
  writeReviewTxt: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  reviewCard: {
    padding: 14,
    gap: 8,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewerName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  reviewBody: { fontSize: 14, lineHeight: 22, color: '#374151' },
  reviewDate: { fontSize: 12, color: '#9CA3AF' },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  loadMoreTxt: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 14,
  },
});
