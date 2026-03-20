import { View } from 'react-native';
import { SkeletonBlock } from '../../../../components/SkeletonBlock';
import { styles } from './styles';

export function ConversationSkeleton() {
  return (
    <View style={styles.skeletonRow}>
      <SkeletonBlock style={styles.skeletonAvatar} />
      <View style={styles.skeletonContent}>
        <SkeletonBlock style={styles.skeletonName} />
        <SkeletonBlock style={styles.skeletonPreview} />
      </View>
    </View>
  );
}
