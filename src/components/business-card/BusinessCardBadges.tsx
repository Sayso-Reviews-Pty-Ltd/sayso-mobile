import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getOverlayShadowStyle } from '../../styles/overlayShadow';
import { getRatingGradient } from '../../styles/ratingColors';
import { Text } from '../Typography';

type Props = {
  verified?: boolean;
  hasRating: boolean;
  rating?: number;
  distanceBadgeText?: string | null;
  onPressDistance?: () => void;
};

export function BusinessCardBadges({
  verified = false,
  hasRating,
  rating,
  distanceBadgeText,
  onPressDistance,
}: Props) {
  return (
    <>
      {verified ? (
        <View style={[styles.badge, getOverlayShadowStyle(999), styles.leftBadge]}>
          <Ionicons name="checkmark-circle-outline" size={13} color="#2563EB" />
          <Text style={styles.badgeText}>Verified</Text>
        </View>
      ) : null}

      {hasRating && rating != null ? (
        <View style={[styles.ratingBadge, getOverlayShadowStyle(999)]}>
          <LinearGradient
            colors={getRatingGradient(rating)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ratingBadgeGradient}
          >
            <Ionicons name="star" size={13} color="#fff" />
            <Text style={styles.ratingBadgeText}>{rating.toFixed(1)}</Text>
          </LinearGradient>
        </View>
      ) : (
        <View style={[styles.newBadge, getOverlayShadowStyle(999)]}>
          <Text style={styles.newBadgeText}>New</Text>
        </View>
      )}

      {distanceBadgeText ? (
        <Pressable
          style={[styles.badge, getOverlayShadowStyle(999), styles.bottomLeftBadge]}
          onPress={(event) => {
            event.stopPropagation();
            onPressDistance?.();
          }}
          disabled={!onPressDistance}
        >
          <Text style={styles.distanceText}>{distanceBadgeText}</Text>
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(229, 224, 229, 0.95)',
  },
  leftBadge: {
    top: 14,
    left: 14,
  },
  rightBadge: {
    top: 14,
    right: 14,
  },
  bottomLeftBadge: {
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(229, 224, 229, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ratingBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
    borderRadius: 999,
  },
  ratingBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  newBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(114,47,55,0.92)',
  },
  newBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#2D2D2D',
  },
});
