import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../lib/api';
import { haptics } from '../../../lib/haptics';
import { useAuthSession } from '../../../hooks/useSession';
import { supabase } from '../../../lib/supabase';
import { routes } from '../../../navigation/routes';
import { EmptyState } from '../../../components/EmptyState';
import { LoadingCrossfade } from '../../../components/LoadingCrossfade';
import { StackPageHeader } from '../../../components/StackPageHeader';
import { Text } from '../../../components/Typography';
import { C, GRID } from './inbox/constants';
import { ConversationRow } from './inbox/ConversationRow';
import { ConversationSkeleton } from './inbox/ConversationSkeleton';
import { InboxSearchBar } from './inbox/InboxSearchBar';
import { styles } from './inbox/styles';
import type { ConversationsApiResponse } from './inbox/types';

export default function DMInboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthSession();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => apiFetch<ConversationsApiResponse>('/api/conversations'),
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  const conversations = data?.conversations ?? [];
  const search = searchQuery.trim().toLowerCase();
  const filteredConversations = search
    ? conversations.filter(
        (conversation) =>
          conversation.other_user_name.toLowerCase().includes(search) ||
          (conversation.business_name ?? '').toLowerCase().includes(search)
      )
    : conversations;

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`dm-inbox-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `user_id=eq.${user.id}` },
        () => {
          void refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const handleConversationPress = useCallback(
    (id: string) => {
      haptics.navigation();
      router.push(routes.dmThread(id) as never);
    },
    [router]
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: C.page }]}> 
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.unauthState}>
          <Ionicons name="chatbubble-outline" size={48} color={C.charcoal50} />
          <Text style={styles.unauthTitle}>Sign in to view messages</Text>
          <Text style={styles.unauthSubtitle}>
            Messages with businesses will appear here once you are signed in.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.signInBtn, pressed ? styles.signInBtnPressed : null]}
            onPress={() => router.push(routes.login() as never)}
          >
            <Text style={styles.signInBtnText}>Sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}> 
      <Stack.Screen options={{ headerShown: false }} />

      <StackPageHeader
        navigation={{ canGoBack: () => true, goBack: () => router.back() }}
        onPressBack={() => router.back()}
        showBackButton
      />

      <InboxSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      <LoadingCrossfade
        loading={isLoading}
        skeleton={
          <View style={styles.skeletonList}>
            {[0, 1, 2, 3, 4].map((index) => (
              <ConversationSkeleton key={index} />
            ))}
          </View>
        }
      >
        {isError ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Could not load conversations"
            message="Check your connection and try again."
            actionLabel="Retry"
            onAction={() => {
              void refetch();
            }}
          />
        ) : filteredConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={C.charcoal50} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No conversations match your search' : 'No messages yet'}
            </Text>
            {!searchQuery ? (
              <Text style={styles.emptySubtitle}>
                Messages from businesses you have interacted with will appear here.
              </Text>
            ) : null}
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ConversationRow
                item={item}
                onPress={() => handleConversationPress(item.id)}
              />
            )}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + GRID * 2 },
            ]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </LoadingCrossfade>
    </View>
  );
}
