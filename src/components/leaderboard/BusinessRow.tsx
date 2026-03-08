import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { FeaturedBusinessDto } from '@sayso/contracts';
import { Text } from '../Typography';
import { routes } from '../../navigation/routes';

const CHARCOAL = '#2D2D2D';
const CHARCOAL_60 = 'rgba(45,45,45,0.60)';
const CORAL = '#722F37';
const OFF_WHITE = '#E5E0E5';

function getBadgeStyle(rank: number): { colors: readonly [string, string]; textColor: string } {
  if (rank === 1) return { colors: ['#FBBF24', '#D97706'], textColor: '#fff' };
  if (rank === 2) return { colors: ['#722F37', 'rgba(114,47,55,0.80)'], textColor: '#fff' };
  if (rank === 3) return { colors: ['rgba(45,45,45,0.70)', 'rgba(45,45,45,0.50)'], textColor: '#fff' };
  return { colors: ['rgba(45,45,45,0.15)', 'rgba(45,45,45,0.10)'], textColor: 'rgba(45,45,45,0.70)' };
}

function getImage(b: FeaturedBusinessDto): string | null {
  const imgs = (b as any).uploaded_images;
  if (Array.isArray(imgs) && imgs.length > 0 && imgs[0]) return String(imgs[0]);
  const url = (b as any).image_url;
  if (url) return String(url);
  if (b.image) return String(b.image);
  return null;
}

function BusinessImage({ business }: { business: FeaturedBusinessDto }) {
  const [err, setErr] = useState(false);
  const src = getImage(business);

  if (src && !err) {
    return (
      <Image
        source={{ uri: src }}
        style={s.image}
        contentFit="cover"
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <View style={[s.image, s.imageFallback]}>
      <Ionicons name="image-outline" size={18} color="rgba(45,45,45,0.20)" />
    </View>
  );
}

type Props = { business: FeaturedBusinessDto; rank: number };

export function BusinessRow({ business, rank }: Props) {
  const router = useRouter();
  const badge = getBadgeStyle(rank);
  const rating = business.totalRating ?? business.rating ?? 0;
  const reviewCount = business.reviewCount ?? (business as any).reviews ?? 0;

  return (
    <Pressable
      style={s.card}
      onPress={() => router.push(routes.businessDetail(business.id) as never)}
      accessibilityRole="button"
    >
      <View style={s.left}>
        <LinearGradient
          colors={badge.colors}
          style={s.badge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {rank <= 3
            ? <Ionicons name="trophy" size={13} color={badge.textColor} />
            : <Text style={[s.badgeNum, { color: badge.textColor }]}>{rank}</Text>
          }
        </LinearGradient>

        <BusinessImage business={business} />

        <View style={s.identity}>
          <Text style={s.name} numberOfLines={1}>{business.name}</Text>
          <Text style={s.sub} numberOfLines={1}>{business.category}</Text>
        </View>
      </View>

      <View style={s.right}>
        <View style={s.ratingPill}>
          <Ionicons name="star" size={11} color={CORAL} />
          <Text style={s.ratingText}>
            {reviewCount > 0 ? rating.toFixed(1) : 'New'}
          </Text>
        </View>
        <Text style={s.reviewCount}>
          {reviewCount > 0 ? `${reviewCount} reviews` : 'No reviews yet'}
        </Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    flexShrink: 0,
  },
  badgeNum: {
    fontSize: 11,
    fontWeight: '700',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.50)',
    flexShrink: 0,
  },
  imageFallback: {
    backgroundColor: OFF_WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: CHARCOAL,
    marginBottom: 1,
  },
  sub: {
    fontSize: 11,
    color: CHARCOAL_60,
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
    flexShrink: 0,
    marginLeft: 8,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: OFF_WHITE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: CHARCOAL,
  },
  reviewCount: {
    fontSize: 11,
    color: CHARCOAL_60,
    textAlign: 'right',
  },
});
