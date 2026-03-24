import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransitionItem } from '../../../components/motion/TransitionItem';
import { Text } from '../../../components/Typography';
import { businessDetailColors } from '../../../components/business-detail/styles';
import { styles } from './trendingStyles';

type Props = {
  minRating: number | null;
  radiusKm: number | null;
  clearAllLabel?: string;
  onClearAll: () => void;
  onClearRating: () => void;
  onClearRadius: () => void;
};

export function ActiveFilterBadges({
  minRating,
  radiusKm,
  clearAllLabel = 'Clear all',
  onClearAll,
  onClearRating,
  onClearRadius,
}: Props) {
  return (
    <TransitionItem role="support" index={3}>
      <View style={styles.activeBadgesRow}>
        {minRating !== null ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>★ {minRating.toFixed(1)}+</Text>
            <Pressable
              style={styles.activeBadgeDismissButton}
              onPress={onClearRating}
              accessibilityRole="button"
              accessibilityLabel={`Remove minimum rating filter ${minRating.toFixed(1)}+`}
            >
              <Ionicons name="close-outline" size={14} color={businessDetailColors.white} />
            </Pressable>
          </View>
        ) : null}

        {radiusKm !== null ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>{radiusKm} km</Text>
            <Pressable
              style={styles.activeBadgeDismissButton}
              onPress={onClearRadius}
              accessibilityRole="button"
              accessibilityLabel={`Remove distance filter ${radiusKm} kilometers`}
            >
              <Ionicons name="close-outline" size={14} color={businessDetailColors.white} />
            </Pressable>
          </View>
        ) : null}

        <Pressable style={styles.clearBadge} onPress={onClearAll}>
          <Text style={styles.clearBadgeText}>{clearAllLabel}</Text>
        </Pressable>
      </View>
    </TransitionItem>
  );
}
