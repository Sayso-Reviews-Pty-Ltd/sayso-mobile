import { useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { EmptyState } from '../../../../components/EmptyState';
import { SkeletonBlock } from '../../../../components/SkeletonBlock';
import { Text } from '../../../../components/Typography';
import { GRID } from './constants';
import { MessageBubble } from './MessageBubble';
import { styles } from './styles';
import type { MessageDto } from './types';

type Props = {
  currentUserId?: string;
  error: unknown;
  isLoading: boolean;
  listRef: React.RefObject<FlatList<MessageDto> | null>;
  messages: MessageDto[];
  onRetryLoad: () => void;
  onRetryMessage: (message: MessageDto) => void;
  otherAvatar?: string | null;
  serverMessageCount: number;
};

export function MessageList({
  currentUserId,
  error,
  isLoading,
  listRef,
  messages,
  onRetryLoad,
  onRetryMessage,
  otherAvatar,
  serverMessageCount,
}: Props) {
  const renderItem = useCallback(
    ({ item, index }: { item: MessageDto; index: number }) => {
      const isMine = item.sender_id === currentUserId;
      const nextMessage = messages[index + 1];
      const isLastInGroup = !nextMessage || nextMessage.sender_id !== item.sender_id;
      return (
        <MessageBubble
          message={item}
          isMine={isMine}
          isLastInGroup={isLastInGroup}
          onRetry={item.status === 'failed' ? () => onRetryMessage(item) : undefined}
          otherAvatar={otherAvatar}
        />
      );
    },
    [currentUserId, messages, onRetryMessage, otherAvatar]
  );

  if (isLoading) {
    return (
      <View style={styles.skeletonList}>
        {[0, 1, 2, 3].map((index) => (
          <SkeletonBlock
            key={index}
            style={[
              styles.skeletonBubble,
              index % 2 === 0 ? styles.skeletonBubbleMine : styles.skeletonBubbleTheirs,
            ]}
          />
        ))}
      </View>
    );
  }

  if (error && serverMessageCount === 0) {
    return (
      <EmptyState
        icon="cloud-offline-outline"
        title="Couldn't load messages"
        message="Pull down to try again."
        actionLabel="Retry"
        onAction={onRetryLoad}
      />
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={[styles.messageList, { paddingBottom: GRID * 2 }]}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      ListEmptyComponent={
        <View style={styles.emptyThread}>
          <Text style={styles.emptyThreadText}>No messages yet. Say hello!</Text>
        </View>
      }
    />
  );
}
