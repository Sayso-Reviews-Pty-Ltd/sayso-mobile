import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransitionItem } from '../../../components/motion/TransitionItem';
import { Text } from '../../../components/Typography';
import { businessDetailColors } from '../../../components/business-detail/styles';
import { DISTANCE_OPTIONS, RATING_OPTIONS } from './constants';
import { styles } from './trendingStyles';
import type { FilterState } from './types-extra';

type Props = {
  filters: FilterState;
  onSelectDistance: (km: number) => void;
  onSelectRating: (rating: number) => void;
};

export function TrendingFilters({ filters, onSelectDistance, onSelectRating }: Props) {
  return (
    <TransitionItem role="support" index={2}>
      <View style={styles.filtersWrap}>
        <View style={styles.filterGroup}>
          <View style={styles.filterLabelRow}>
            <Ionicons name="location-outline" size={13} color={businessDetailColors.textMuted} />
            <Text style={styles.filterLabelText}>Distance</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {DISTANCE_OPTIONS.map((km) => {
              const active = filters.radiusKm === km;
              return (
                <Pressable
                  key={km}
                  style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
                  onPress={() => onSelectDistance(km)}
                >
                  <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
                    {km} km
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.filterGroup}>
          <View style={styles.filterLabelRow}>
            <Ionicons name="star-outline" size={13} color={businessDetailColors.textMuted} />
            <Text style={styles.filterLabelText}>Min Rating</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {RATING_OPTIONS.map((rating) => {
              const active = filters.minRating === rating;
              return (
                <Pressable
                  key={rating}
                  style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
                  onPress={() => onSelectRating(rating)}
                >
                  <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
                    {rating.toFixed(1)}+
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </TransitionItem>
  );
}
