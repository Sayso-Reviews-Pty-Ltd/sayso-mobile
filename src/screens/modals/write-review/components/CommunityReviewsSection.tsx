import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { CARD_BG_COLOR } from '../../../../styles/colors';
import { C } from '../constants';
import { CommunityReview } from '../types';

function CommunityReviewCard({ review }: { review: CommunityReview }) {
  const [avatarError, setAvatarError] = useState(false);
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          {review.avatarUrl && !avatarError ? (
            <Image source={{ uri: review.avatarUrl }} style={styles.avatarImg} onError={() => setAvatarError(true)} />
          ) : (
            <Ionicons name="person-outline" size={16} color={C.sage} style={{ opacity: 0.7 }} />
          )}
        </View>
        <View style={styles.meta}>
          <Text style={styles.userName} numberOfLines={1}>
            {review.userName}
          </Text>
          <Text style={styles.date}>{review.date}</Text>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star-outline" size={12} color={C.coral} />
          <Text style={styles.ratingText}>{review.rating}</Text>
        </View>
      </View>
      <Text style={styles.text} numberOfLines={4}>
        {review.text}
      </Text>
    </View>
  );
}

function CommunityReviewCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: C.charcoal10 }]} />
        <View style={styles.meta}>
          <View style={styles.skeletonName} />
          <View style={styles.skeletonDate} />
        </View>
      </View>
      <View style={styles.skeletonBodyWrap}>
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLineShort} />
      </View>
    </View>
  );
}

type Props = {
  reviews: CommunityReview[];
  isLoading: boolean;
};

export function CommunityReviewsSection({ reviews, isLoading }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>What others are saying</Text>
      {isLoading ? (
        <View style={styles.list}>
          {[0, 1, 2].map((i) => (
            <CommunityReviewCardSkeleton key={i} />
          ))}
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="chatbubble-outline" size={24} color={C.sage} style={{ opacity: 0.6 }} />
          </View>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptyBody}>Be the first to review this business!</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {reviews.map((review) => (
            <CommunityReviewCard key={review.id} review={review} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 32 },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: C.charcoal,
    textAlign: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45,45,45,0.10)',
    marginBottom: 12,
  },
  list: { paddingBottom: 8, gap: 12 },
  card: {
    backgroundColor: CARD_BG_COLOR,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(125,155,118,0.12)',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(229,224,229,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: { width: 36, height: 36 },
  meta: { flex: 1, minWidth: 0 },
  userName: { fontSize: 13, fontWeight: '600', color: C.charcoal },
  date: { fontSize: 11, color: C.charcoal45, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 0 },
  ratingText: { fontSize: 12, color: C.charcoal60, fontWeight: '500' },
  text: { fontSize: 13, color: 'rgba(45,45,45,0.85)', lineHeight: 19 },
  empty: {
    backgroundColor: CARD_BG_COLOR,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(125,155,118,0.12)',
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: 'rgba(45,45,45,0.80)' },
  emptyBody: { fontSize: 12, color: C.charcoal60, textAlign: 'center', lineHeight: 18 },
  skeletonName: { width: 80, height: 10, borderRadius: 5, backgroundColor: C.charcoal10 },
  skeletonDate: { width: 50, height: 8, borderRadius: 4, backgroundColor: C.charcoal10, marginTop: 4 },
  skeletonBodyWrap: { gap: 6, marginTop: 8 },
  skeletonLine: { height: 10, borderRadius: 5, backgroundColor: C.charcoal10 },
  skeletonLineShort: { width: '70%', height: 10, borderRadius: 5, backgroundColor: C.charcoal10 },
});
