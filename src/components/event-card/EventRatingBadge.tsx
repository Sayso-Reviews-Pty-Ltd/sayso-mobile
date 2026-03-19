import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getOverlayShadowStyle } from '../../styles/overlayShadow';
import { getRatingGradient } from '../../styles/ratingColors';
import { Text } from '../Typography';

type Props = {
  rating: number;
};

export function EventRatingBadge({ rating }: Props) {
  return (
    <View style={[styles.badgeWrap, getOverlayShadowStyle(999)]} pointerEvents="none">
      <LinearGradient
        colors={getRatingGradient(rating)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.badge}
      >
        <Ionicons name="star" size={13} color="#fff" />
        <Text style={styles.label}>{rating.toFixed(1)}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeWrap: {
    position: 'absolute',
    right: 14,
    top: 14,
    borderRadius: 999,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
