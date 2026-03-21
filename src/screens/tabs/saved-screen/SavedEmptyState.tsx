import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { styles } from './savedScreenStyles';

export function SavedEmptyState() {
  return (
    <View style={styles.emptyStateWrap}>
      <View style={styles.emptyStateIconWrap}>
        <Ionicons name="bookmark-outline" size={32} color="rgba(45,45,45,0.35)" />
      </View>
      <Text style={styles.emptyStateTitle}>No saved items yet</Text>
      <Text style={styles.emptyStateSubtitle}>Tap the bookmark icon on any business to save it here</Text>
    </View>
  );
}
