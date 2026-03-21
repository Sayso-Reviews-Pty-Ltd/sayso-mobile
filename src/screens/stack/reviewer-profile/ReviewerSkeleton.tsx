import { ScrollView, View } from 'react-native';
import { SkeletonBlock } from '../../../components/SkeletonBlock';
import { styles } from './styles';

export function ReviewerSkeleton() {
  return (
    <ScrollView style={styles.skeletonRoot} contentContainerStyle={styles.skeletonContent}>
      <View style={styles.skeletonHeaderCard}>
        <View style={styles.skeletonAvatarRow}>
          <SkeletonBlock style={styles.skeletonAvatar} />
          <View style={styles.skeletonHeaderText}>
            <SkeletonBlock style={styles.skeletonNameLine} />
            <SkeletonBlock style={styles.skeletonMetaLine} />
            <SkeletonBlock style={styles.skeletonMetaLine2} />
          </View>
        </View>
      </View>
      <View style={styles.skeletonStatRow}>
        {[0, 1, 2, 3].map((index) => (
          <SkeletonBlock key={index} style={styles.skeletonStatCard} />
        ))}
      </View>
      {[0, 1].map((index) => (
        <SkeletonBlock key={index} style={styles.skeletonReviewCard} />
      ))}
    </ScrollView>
  );
}
