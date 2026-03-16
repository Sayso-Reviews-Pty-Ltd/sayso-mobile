import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '../../../components/Typography';
import { homeTokens } from './HomeTokens';
import { NAVBAR_BG_COLOR } from '../../../styles/colors';

type Mood = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  query: string;
};

export const MOOD_QUERY_SET = new Set<string>([
  'romantic', 'lunch', 'brunch', 'coffee', 'family', 'drinks',
]);

const MOODS: Mood[] = [
  { id: 'date',      label: 'Date Night',    icon: 'heart-outline',      query: 'romantic' },
  { id: 'lunch',     label: 'Quick Lunch',   icon: 'restaurant-outline', query: 'lunch'    },
  { id: 'brunch',    label: 'Weekend Brunch',icon: 'sunny-outline',      query: 'brunch'   },
  { id: 'coffee',    label: 'Coffee & Chat', icon: 'cafe-outline',       query: 'coffee'   },
  { id: 'family',    label: 'Family Outing', icon: 'people-outline',     query: 'family'   },
  { id: 'afterwork', label: 'After Work',    icon: 'wine-outline',       query: 'drinks'   },
];

type Props = {
  /** Current search input value — used to derive which chip is active. */
  activeMoodQuery: string;
  /** Called with the mood query to activate, or '' to deselect/clear. */
  onSelectMood: (query: string) => void;
};

export function HomeMoodPicker({ activeMoodQuery, onSelectMood }: Props) {
  return (
    /**
     * Negative horizontal margin breaks out of the parent FlatList's
     * paddingHorizontal gutter so the scroll track extends to screen edges.
     * paddingHorizontal on contentContainerStyle restores the visual inset
     * for the first and last chip.
     */
    <View style={styles.wrap}>
      <Text style={styles.label}>What are you in the mood for?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        // Allow chip taps to fire while the search keyboard is still open
        keyboardShouldPersistTaps="handled"
      >
        {MOODS.map((mood) => {
          const isActive = activeMoodQuery === mood.query;
          return (
            <TouchableOpacity
              key={mood.id}
              style={[styles.tile, isActive && styles.tileActive]}
              onPress={() => {
                try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                // Tapping the active chip clears the search (deselect)
                onSelectMood(isActive ? '' : mood.query);
              }}
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityLabel={mood.label}
              accessibilityState={{ selected: isActive }}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Ionicons name={mood.icon} size={18} color={homeTokens.white} />
              </View>
              <Text style={styles.tileLabel} numberOfLines={2}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 12,
    gap: 8,
    // Break out of parent FlatList gutter — see comment on component above
    marginHorizontal: -homeTokens.pageGutter,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: homeTokens.textSecondary,
    paddingHorizontal: homeTokens.pageGutter,
    letterSpacing: 0.1,
  },
  row: {
    paddingHorizontal: homeTokens.pageGutter,
    gap: 8,
    // Extra bottom padding prevents chip shadows from being clipped
    paddingBottom: 6,
  },
  tile: {
    width: 80,
    backgroundColor: NAVBAR_BG_COLOR,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    // Always reserve borderWidth so tile size never changes on selection —
    // avoids layout jitter when the active state toggles
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tileActive: {
    backgroundColor: homeTokens.coral,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: homeTokens.white,
    textAlign: 'center',
    lineHeight: 14,
  },
});
