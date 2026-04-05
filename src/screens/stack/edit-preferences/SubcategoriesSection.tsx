import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { SUBCATEGORY_MAP, MAX_SUBCATEGORIES } from './useEditPreferencesController';

const WINE = '#722F37';

type Props = {
  selectedInterests: Set<string>;
  selectedSubs: Set<string>;
  onToggle: (id: string) => void;
};

export function SubcategoriesSection({ selectedInterests, selectedSubs, onToggle }: Props) {
  const atMax = selectedSubs.size >= MAX_SUBCATEGORIES;
  const groups = Object.entries(SUBCATEGORY_MAP).filter(([id]) => selectedInterests.has(id));

  if (groups.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>Subcategories</Text>
        <Text style={styles.empty}>Select interests above to see subcategories.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Subcategories</Text>
        <Text style={styles.counter}>
          {selectedSubs.size}/{MAX_SUBCATEGORIES}
        </Text>
      </View>
      {groups.map(([interestId, group]) => (
        <View key={interestId} style={styles.group}>
          <Text style={styles.groupLabel}>{group.groupLabel}</Text>
          <View style={styles.chipRow}>
            {group.items.map((item) => {
              const isSelected = selectedSubs.has(item.id);
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
                  {isSelected ? (
                    <Ionicons name="checkmark-outline" size={12} color="#FFFFFF" />
                  ) : null}
                  <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#2D2D2D' },
  counter: { fontSize: 13, color: 'rgba(45,45,45,0.6)', fontWeight: '600' },
  empty: { fontSize: 13, color: 'rgba(45,45,45,0.55)', fontStyle: 'italic' },
  group: { gap: 8 },
  groupLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(45,45,45,0.72)' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
