import { View } from 'react-native';
import { Text } from '../../../../components/Typography';
import { SkeletonBlock } from '../../../../components/SkeletonBlock';
import { styles } from '../ResetPasswordScreen.styles';

type Props = {
  paddingTop: number;
};

export function ResetPasswordLoadingState({ paddingTop }: Props) {
  return (
    <View style={[styles.loadingWrap, { paddingTop }]}>
      <View style={styles.skeletonGroup}>
        <SkeletonBlock style={styles.skeletonOrb} />
        <SkeletonBlock style={styles.skeletonLine} />
      </View>
      <Text style={styles.loadingLabel}>Verifying reset link…</Text>
    </View>
  );
}
