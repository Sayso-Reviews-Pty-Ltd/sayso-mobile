import { Pressable, ScrollView } from 'react-native';
import { haptics } from '../../lib/haptics';
import { Text } from '../../components/Typography';
import { styles } from './NotificationsScreen.styles';

export type NotificationFilter = 'all' | 'review' | 'badge_earned' | 'dm' | 'business';

export const FILTER_CHIPS: Array<{ id: NotificationFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'review', label: 'Reviews' },
  { id: 'badge_earned', label: 'Badges' },
  { id: 'dm', label: 'Messages' },
  { id: 'business', label: 'Businesses' },
];

type Props = {
  activeFilter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
};

export function NotificationFilterBar({ activeFilter, onFilterChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
      style={styles.filterScroll}
    >
      {FILTER_CHIPS.map((chip) => (
        <Pressable
          key={chip.id}
          style={[styles.chip, activeFilter === chip.id && styles.chipActive]}
          onPress={() => { haptics.navigation(); onFilterChange(chip.id); }}
          accessibilityRole="button"
          accessibilityState={{ selected: activeFilter === chip.id }}
        >
          <Text style={[styles.chipText, activeFilter === chip.id && styles.chipTextActive]}>
            {chip.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
