import { Pressable, View } from 'react-native';
import { Text } from '../../../components/Typography';
import { styles } from './styles';

type Props = {
  count: number;
  onPress: () => void;
};

export function ClusterMarker({ count, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.clusterWrap}>
        <View style={styles.clusterOuter}>
          <View style={styles.clusterInner}>
            <Text style={styles.clusterText}>{count}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
