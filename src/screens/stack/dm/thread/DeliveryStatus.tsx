import { ActivityIndicator, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { C } from './constants';
import { formatMessageTime } from './formatters';
import { styles } from './styles';
import type { MessageStatus } from './types';

type Props = {
  createdAt: string;
  isMine: boolean;
  isLastInGroup: boolean;
  status?: MessageStatus;
  onRetry?: () => void;
};

export function DeliveryStatus({
  createdAt,
  isMine,
  isLastInGroup,
  status,
  onRetry,
}: Props) {
  if (!isLastInGroup) {
    return null;
  }

  const isFailed = status === 'failed';
  const isSending = status === 'sending';

  if (isMine) {
    return (
      <View style={styles.statusRow}>
        {isSending ? (
          <ActivityIndicator size={10} color={C.charcoal50} style={styles.statusIcon} />
        ) : null}
        {isFailed ? (
          <Pressable style={styles.retryBtn} onPress={onRetry}>
            <Ionicons name="alert-circle-outline" size={13} color={C.wine} />
            <Text style={styles.retryText}>Failed · Tap to retry</Text>
          </Pressable>
        ) : null}
        {!isSending && !isFailed ? (
          <Text style={styles.statusText}>{formatMessageTime(createdAt)}</Text>
        ) : null}
      </View>
    );
  }

  return <Text style={styles.theirTimestamp}>{formatMessageTime(createdAt)}</Text>;
}
