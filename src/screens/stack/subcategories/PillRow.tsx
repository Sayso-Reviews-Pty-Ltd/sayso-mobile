import { memo } from 'react';
import { View } from 'react-native';
import { PillItem } from './PillItem';
import { styles } from './styles';
import type { PillMutables, Subcategory } from './types';

type Props = {
  atMax: boolean;
  getPillMutables: (id: string) => PillMutables;
  items: Subcategory[];
  onToggle: (id: string) => void;
  selected: Set<string>;
};

export const PillRow = memo(function PillRow({ atMax, getPillMutables, items, onToggle, selected }: Props) {
  return (
    <View style={styles.pillsRow}>
      {items.map((item) => {
        const isSelected = selected.has(item.id);
        const isDisabled = atMax && !isSelected;
        return (
          <PillItem
            key={item.id}
            item={item}
            mutables={getPillMutables(item.id)}
            isSelected={isSelected}
            isDisabled={isDisabled}
            onPress={() => onToggle(item.id)}
          />
        );
      })}
    </View>
  );
});
