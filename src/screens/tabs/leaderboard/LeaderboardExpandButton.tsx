import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { styles } from './styles';

type Props = {
  expanded: boolean;
  onPress: () => void;
};

export function LeaderboardExpandButton({ expanded, onPress }: Props) {
  return (
    <Pressable style={styles.expandBtn} onPress={onPress}>
      {expanded ? <Ionicons name="chevron-up-outline" size={15} color="#fff" /> : null}
      <Text style={styles.expandText}>{expanded ? 'Show Less' : 'View Full Leaderboard'}</Text>
      {!expanded ? <Ionicons name="chevron-down-outline" size={15} color="#fff" /> : null}
    </Pressable>
  );
}
