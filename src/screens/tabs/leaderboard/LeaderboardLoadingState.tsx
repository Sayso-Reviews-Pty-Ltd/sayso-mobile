import { View } from 'react-native';
import { SkeletonBlock } from '../../../components/SkeletonBlock';
import { styles } from './styles';

export function LeaderboardLoadingState() {
  return (
    <View style={styles.skeletonWrap}>
      {Array.from({ length: 5 }, (_, index) => (
        <View key={index} style={styles.skeletonRow}>
          <View style={styles.skeletonLeft}>
            <SkeletonBlock style={styles.skeletonBadge} />
            <SkeletonBlock style={styles.skeletonAvatar} />
            <View style={styles.skeletonIdentity}>
              <SkeletonBlock style={styles.skeletonName} />
              <SkeletonBlock style={styles.skeletonSub} />
            </View>
          </View>
          <View style={styles.skeletonRight}>
            <SkeletonBlock style={styles.skeletonPill} />
            <SkeletonBlock style={styles.skeletonTiny} />
          </View>
        </View>
      ))}
    </View>
  );
}
