import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BusinessCard } from '../../../../components/BusinessCard';
import { Text } from '../../../../components/Typography';
import { styles } from '../../saved-screen/savedScreenStyles';

type SavedBusiness = {
  id: string;
};

type Props = {
  businesses: SavedBusiness[];
  gridColumns: number;
  gridGap: number;
  paginatedRows: SavedBusiness[][];
  onPressExplore: () => void;
};

export function SavedGrid({ businesses, gridColumns, gridGap, paginatedRows, onPressExplore }: Props) {
  if (businesses.length <= 0) {
    return (
      <View style={styles.filteredEmptyWrap}>
        <View style={styles.filteredEmptyIconWrap}>
          <Ionicons name="storefront-outline" size={24} color="rgba(45,45,45,0.85)" />
        </View>
        <Text style={styles.filteredEmptyText}>No saved businesses yet</Text>
        <Pressable style={styles.exploreButton} onPress={onPressExplore}>
          <Text style={styles.exploreButtonText}>Explore Businesses</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.gridWrap, { rowGap: gridGap }]}> 
      {paginatedRows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={[styles.gridRow, { columnGap: gridGap }]}> 
          {row.map((business) => (
            <View key={business.id} style={styles.gridCell}>
              <BusinessCard business={business as any} />
            </View>
          ))}
          {row.length < gridColumns
            ? Array.from({ length: gridColumns - row.length }, (_, index) => (
                <View key={`placeholder-${rowIndex}-${index}`} style={styles.gridCell} />
              ))
            : null}
        </View>
      ))}
    </View>
  );
}
