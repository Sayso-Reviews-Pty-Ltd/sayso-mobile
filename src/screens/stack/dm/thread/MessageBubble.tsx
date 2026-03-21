import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { C } from './constants';
import { DeliveryStatus } from './DeliveryStatus';
import { styles } from './styles';
import type { MessageDto } from './types';

type Props = {
  message: MessageDto;
  isMine: boolean;
  isLastInGroup: boolean;
  onRetry?: () => void;
  otherAvatar?: string | null;
};

export function MessageBubble({ message, isMine, isLastInGroup, onRetry, otherAvatar }: Props) {
  const isFailed = message.status === 'failed';

  return (
    <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
      {!isMine ? (
        <View style={styles.bubbleAvatarSlot}>
          {isLastInGroup ? (
            otherAvatar ? (
              <Image source={{ uri: otherAvatar }} style={styles.bubbleAvatar} />
            ) : (
              <View style={[styles.bubbleAvatar, styles.bubbleAvatarFallback]}>
                <Ionicons name="person-outline" size={12} color={C.charcoal50} />
              </View>
            )
          ) : null}
        </View>
      ) : null}

      <View style={[styles.bubbleWrap, isMine ? styles.bubbleWrapMine : styles.bubbleWrapTheirs]}>
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
            isMine
              ? isLastInGroup
                ? styles.bubbleMineLastInGroup
                : styles.bubbleMineMiddle
              : isLastInGroup
                ? styles.bubbleTheirsLastInGroup
                : styles.bubbleTheirsMiddle,
            isFailed ? styles.bubbleFailed : null,
          ]}
        >
          <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
            {message.body}
          </Text>
        </View>

        <DeliveryStatus
          createdAt={message.created_at}
          isMine={isMine}
          isLastInGroup={isLastInGroup}
          status={message.status}
          onRetry={onRetry}
        />
      </View>
    </View>
  );
}
