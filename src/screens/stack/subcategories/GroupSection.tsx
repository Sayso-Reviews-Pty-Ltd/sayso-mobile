import { memo } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { PillRow } from './PillRow';
import { styles } from './styles';
import type { GroupMutables, PillMutables, VisibleSubcategoryGroup } from './types';

type Props = {
  atMax: boolean;
  getPillMutables: (id: string) => PillMutables;
  group: VisibleSubcategoryGroup;
  mutables: GroupMutables;
  onToggle: (id: string) => void;
  selected: Set<string>;
};

export const GroupSection = memo(function GroupSection({
  atMax,
  getPillMutables,
  group,
  mutables,
  onToggle,
  selected,
}: Props) {
  const groupStyle = useAnimatedStyle(
    () => ({
      opacity: mutables.opacity.value,
      transform: [{ translateY: mutables.y.value }],
    }),
    [mutables]
  );

  const labelStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateX: mutables.titleX.value }],
    }),
    [mutables]
  );

  return (
    <Animated.View style={[styles.group, groupStyle]}>
      <Animated.Text style={[styles.groupLabel, labelStyle]}>{group.groupLabel}</Animated.Text>
      <PillRow
        atMax={atMax}
        getPillMutables={getPillMutables}
        items={group.items}
        onToggle={onToggle}
        selected={selected}
      />
    </Animated.View>
  );
});
