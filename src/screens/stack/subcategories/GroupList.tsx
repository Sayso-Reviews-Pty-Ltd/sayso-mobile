import { View } from 'react-native';
import { Text } from '../../../components/Typography';
import { GroupSection } from './GroupSection';
import { styles } from './styles';
import type { GroupMutables, PillMutables, VisibleSubcategoryGroup } from './types';

type Props = {
  atMax: boolean;
  getPillMutables: (id: string) => PillMutables;
  groups: VisibleSubcategoryGroup[];
  groupMutables: GroupMutables[];
  onToggle: (id: string) => void;
  selected: Set<string>;
};

export function GroupList({
  atMax,
  getPillMutables,
  groups,
  groupMutables,
  onToggle,
  selected,
}: Props) {
  if (groups.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No subcategories found for selected interests.</Text>
      </View>
    );
  }

  return (
    <>
      {groups.map((group, index) => {
        const mutables = groupMutables[index] ?? groupMutables[0];
        return (
          <GroupSection
            key={group.interestId}
            atMax={atMax}
            getPillMutables={getPillMutables}
            group={group}
            mutables={mutables}
            onToggle={onToggle}
            selected={selected}
          />
        );
      })}
    </>
  );
}
