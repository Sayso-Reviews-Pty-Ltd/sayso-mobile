import { Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '../../../components/Typography';
import type { FilterOption } from './savedScreenTokens';
import { styles } from './savedScreenStyles';

type Props = {
  options: FilterOption[];
  value: string | null;
  onChange: (nextValue: string | null) => void;
  pillHorizontalPadding: number;
  pillFontSize: number;
};

export function SavedFilterPillGroup({ options, value, onChange, pillHorizontalPadding, pillFontSize }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow} style={styles.pillScroll}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <Pressable
            key={`${option.label}-${String(option.value)}`}
            onPress={() => {
              try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
              onChange(isActive ? null : option.value);
            }}
            style={({ pressed }) => [
              styles.pill,
              { paddingHorizontal: pillHorizontalPadding },
              isActive ? styles.pillActive : null,
              pressed ? styles.pillPressed : null,
            ]}
          >
            <Text style={[styles.pillText, { fontSize: pillFontSize }, isActive ? styles.pillTextActive : null]}>
              {option.label}
            </Text>
            {option.count > 0 ? (
              <Text style={[styles.pillCount, { fontSize: pillFontSize }, isActive ? styles.pillTextActive : null]}>
                ({option.count})
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
