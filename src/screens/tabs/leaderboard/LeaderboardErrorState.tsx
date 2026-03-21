import { Pressable, View } from 'react-native';
import { Text } from '../../../components/Typography';
import { styles } from './styles';

type Props = {
  onRetry: () => void;
};

export function LeaderboardErrorState({ onRetry }: Props) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyText}>Couldn&apos;t load leaderboard.</Text>
      <Pressable style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
}
