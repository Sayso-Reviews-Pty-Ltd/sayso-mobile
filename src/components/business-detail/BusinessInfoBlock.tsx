import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../Typography';
import { businessDetailColors } from './styles';
import { getRatingGradient } from '../../styles/ratingColors';

type Props = {
  name: string;
  rating: number;
  category: string;
  location: string;
};

export function BusinessInfoBlock({ name, rating, category, location }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{name}</Text>

      <View style={styles.metaRow}>
        {rating > 0 ? (
          <LinearGradient
            colors={getRatingGradient(rating)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.metaPill}
          >
            <Ionicons name="star" size={13} color="#fff" />
            <Text style={styles.metaText}>{rating.toFixed(1)}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.metaPill, styles.noRatingPill]}>
            <Text style={styles.noRatingText}>No reviews yet</Text>
          </View>
        )}

        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>

        <View style={styles.locationPill}>
          <Ionicons name="location-outline" size={13} color={businessDetailColors.charcoal} />
          <Text style={styles.locationText} numberOfLines={1}>
            {location}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  title: {
    color: businessDetailColors.charcoal,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  noRatingPill: {
    backgroundColor: 'rgba(229,224,229,0.95)',
  },
  noRatingText: {
    color: businessDetailColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryPill: {
    borderRadius: 999,
    backgroundColor: 'rgba(229,224,229,0.78)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: {
    color: businessDetailColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  locationPill: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(229,224,229,0.78)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  locationText: {
    color: businessDetailColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 220,
  },
});
