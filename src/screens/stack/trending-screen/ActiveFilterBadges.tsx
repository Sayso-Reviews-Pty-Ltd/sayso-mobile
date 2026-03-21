import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransitionItem } from '../../../components/motion/TransitionItem';
import { Text } from '../../../components/Typography';
import { businessDetailColors } from '../../../components/business-detail/styles';
import { styles } from './trendingStyles';

type Props = {
  minRating: number | null;
  radiusKm: number | null;
  onClearAll: () => void;
  onClearRating: () => void;
  onClearRadius: () => void;
};

export function ActiveFilterBadges({
  minRating,
  radiusKm,
  onClearAll,
  onClearRating,
  onClearRadius,
}: Props) {
  return (
    <TransitionItem variant="card" index={3}>
      <View style={styles.activeBadgesRow}>
        {minRating !== null ? (
          <Pressable style={styles.activeBadge} onPress={onClearRating}>
            <Text style={styles.activeBadgeText}>★ {minRating.toFixed(1)}+</Text>
            <Ionicons name="close-outline" size={11} color={businessDetailColors.white} />
          </Pressable>
        ) : null}

        {radiusKm !== null ? (
          <Pressable style={styles.activeBadge} onPress={onClearRadius}>
            <Text style={styles.activeBadgeText}>{radiusKm} km</Text>
            <Ionicons name="close-outline" size={11} color={businessDetailColors.white} />
          </Pressable>
        ) : null}

        <Pressable style={styles.clearBadge} onPress={onClearAll}>
          <Text style={styles.clearBadgeText}>Clear all</Text>
        </Pressable>
      </View>
    </TransitionItem>
  );
}
