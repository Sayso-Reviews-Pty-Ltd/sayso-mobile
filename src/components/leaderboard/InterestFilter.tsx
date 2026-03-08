import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../Typography';

const SAGE = '#9DAB9B';
const CHARCOAL = '#2D2D2D';

export const INTEREST_LABELS: Record<string, string> = {
  'food-drink': 'Food & Drink',
  'beauty-wellness': 'Beauty & Wellness',
  'professional-services': 'Professional Services',
  'travel': 'Travel',
  'outdoors-adventure': 'Outdoors & Adventure',
  'experiences-entertainment': 'Entertainment',
  'arts-culture': 'Arts & Culture',
  'family-pets': 'Family & Pets',
  'shopping-lifestyle': 'Shopping & Lifestyle',
  'miscellaneous': 'Misc',
};

type Props = {
  availableIds: string[];
  selected: string;
  onSelect: (id: string) => void;
};

export function InterestFilter({ availableIds, selected, onSelect }: Props) {
  return (
    <View style={s.wrap}>
      <Text style={s.label}>Filter by Interest</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.row}
      >
        <Pressable
          style={[s.pill, selected === 'all' && s.pillActive]}
          onPress={() => onSelect('all')}
        >
          <Text style={[s.pillText, selected === 'all' && s.pillTextActive]}>All Interests</Text>
        </Pressable>

        {availableIds.map((id) => (
          <Pressable
            key={id}
            style={[s.pill, selected === id && s.pillActive]}
            onPress={() => onSelect(id)}
          >
            <Text style={[s.pillText, selected === id && s.pillTextActive]}>
              {INTEREST_LABELS[id] ?? id}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(45,45,45,0.70)',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    gap: 6,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: 'rgba(45,45,45,0.20)',
  },
  pillActive: {
    backgroundColor: SAGE,
    borderColor: SAGE,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: CHARCOAL,
  },
  pillTextActive: {
    color: '#fff',
  },
});
