import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from './thread/constants';
import { Composer } from './thread/Composer';
import { MessageList } from './thread/MessageList';
import { styles } from './thread/styles';
import { ThreadHeader } from './thread/ThreadHeader';
import { useDMThreadController } from './thread/useDMThreadController';

export default function DMThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    allMessages,
    conversation,
    error,
    handleRetry,
    handleSend,
    inputText,
    isLoading,
    listRef,
    refetch,
    serverMessages,
    setInputText,
    userId,
  } = useDMThreadController(threadId);

  const otherName = conversation?.other_user_name ?? 'Conversation';

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ThreadHeader
        topInset={insets.top}
        onBack={() => router.back()}
        otherName={otherName}
        businessName={conversation?.business_name}
        otherAvatar={conversation?.other_user_avatar}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <MessageList
          currentUserId={userId}
          error={error}
          isLoading={isLoading}
          listRef={listRef}
          messages={allMessages}
          onRetryLoad={() => {
            void refetch();
          }}
          onRetryMessage={handleRetry}
          otherAvatar={conversation?.other_user_avatar}
          serverMessageCount={serverMessages.length}
        />

        <Composer
          inputText={inputText}
          insetBottom={insets.bottom}
          onChangeText={setInputText}
          onSend={handleSend}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
