import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { homeTokens } from './HomeTokens';
import { NAVBAR_BG_COLOR } from '../../../styles/colors';

type Mood = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  query: string;
};

const MOODS: Mood[] = [
  { id: 'date',      label: 'Date Night',      icon: 'heart-outline',      query: 'romantic'  },
  { id: 'lunch',     label: 'Quick Lunch',      icon: 'restaurant-outline', query: 'lunch'     },
  { id: 'brunch',    label: 'Weekend Brunch',   icon: 'sunny-outline',      query: 'brunch'    },
  { id: 'coffee',    label: 'Coffee & Chat',    icon: 'cafe-outline',       query: 'coffee'    },
  { id: 'family',    label: 'Family Outing',    icon: 'people-outline',     query: 'family'    },
  { id: 'afterwork', label: 'After Work',       icon: 'wine-outline',       query: 'drinks'    },
];

type Props = {
  onSelectMood: (query: string) => void;
};

export function HomeMoodPicker({ onSelectMood }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>What are you in the mood for?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {MOODS.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={styles.tile}
            onPress={() => onSelectMood(mood.query)}
            activeOpacity={0.78}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={mood.icon} size={18} color={homeTokens.white} />
            </View>
            <Text style={styles.tileLabel} numberOfLines={2}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 16,
    gap: 10,
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
    paddingBottom: 4,
  },
  tile: {
    width: 80,
    backgroundColor: NAVBAR_BG_COLOR,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: homeTokens.white,
    textAlign: 'center',
    lineHeight: 14,
  },
});
