import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { businessDetailColors } from '../../../components/business-detail/styles';
import { Text } from '../../../components/Typography';
import { styles } from './styles';

type Props = {
  icon: 'trophy-outline' | 'storefront-outline';
  message: string;
};

export function LeaderboardEmptyState({ icon, message }: Props) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={36} color={businessDetailColors.textMuted} />
      </View>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}
