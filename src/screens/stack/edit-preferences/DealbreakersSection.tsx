import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { DEALBREAKERS, MAX_DEALBREAKERS } from './useEditPreferencesController';
import { DEALBREAKER_ICONS } from '../deal-breakers/constants';

const WINE = '#722F37';

type Props = {
  selected: Set<string>;
  onToggle: (id: string) => void;
};

export function DealbreakersSection({ selected, onToggle }: Props) {
  const atMax = selected.size >= MAX_DEALBREAKERS;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Dealbreakers</Text>
        <Text style={styles.counter}>
          {selected.size}/{MAX_DEALBREAKERS}
        </Text>
      </View>
      <Text style={styles.hint}>Select up to {MAX_DEALBREAKERS}</Text>
      <View style={styles.grid}>
        {DEALBREAKERS.map((item) => {
          const isSelected = selected.has(item.id);
          const isDisabled = atMax && !isSelected;
          return (
            <Pressable
              key={item.id}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : null,
                isDisabled ? styles.chipDisabled : null,
              ]}
              onPress={() => onToggle(item.id)}
              disabled={isDisabled}
            >
              <Ionicons
                name={DEALBREAKER_ICONS[item.id]}
                size={14}
                color={isSelected ? '#FFFFFF' : 'rgba(45,45,45,0.7)'}
              />
              <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#2D2D2D' },
  counter: { fontSize: 13, color: 'rgba(45,45,45,0.6)', fontWeight: '600' },
  hint: { fontSize: 12, color: 'rgba(45,45,45,0.6)', marginTop: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  chipSelected: { backgroundColor: WINE, borderColor: WINE },
  chipDisabled: { opacity: 0.38 },
  chipText: { fontSize: 13, fontWeight: '600', color: '#2D2D2D' },
  chipTextSelected: { color: '#FFFFFF' },
});
