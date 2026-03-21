import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthSession } from '../../../../hooks/useSession';
import { apiFetch } from '../../../../lib/api';
import { supabase } from '../../../../lib/supabase';
import type { MessageDto, MessagesApiResponse, SendMessageResponse } from './types';

export function useDMThreadController(threadId?: string) {
  const { user } = useAuthSession();
  const queryClient = useQueryClient();

  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<MessageDto[]>([]);
  const listRef = useRef<FlatList<MessageDto>>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['messages', threadId],
    queryFn: () => apiFetch<MessagesApiResponse>(`/api/conversations/${threadId}/messages`),
    enabled: Boolean(threadId) && Boolean(user),
    staleTime: 15_000,
  });

  const conversation = data?.conversation;
  const serverMessages = data?.messages ?? [];
  const allMessages = [...serverMessages, ...localMessages];

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      apiFetch<SendMessageResponse>(`/api/conversations/${threadId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', threadId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  useEffect(() => {
    if (!threadId || !user?.id) return;

    const channel = supabase
      .channel(`messages-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${threadId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', threadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, threadId, user?.id]);

  useEffect(() => {
    if (allMessages.length <= 0) return;
    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timeout);
  }, [allMessages.length]);

  const handleSend = useCallback(async () => {
    const body = inputText.trim();
    if (!body) return;

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // no-op
    }

    setInputText('');

    const localId = `local-${Date.now()}`;
    const localMessage: MessageDto = {
      id: localId,
      sender_id: user?.id ?? '',
      body,
      created_at: new Date().toISOString(),
      status: 'sending',
      is_local: true,
    };

    setLocalMessages((previous) => [...previous, localMessage]);

    try {
      await sendMutation.mutateAsync(body);
      setLocalMessages((previous) => previous.filter((message) => message.id !== localId));
    } catch {
      setLocalMessages((previous) =>
        previous.map((message) =>
          message.id === localId ? { ...message, status: 'failed' } : message
        )
      );
    }
  }, [inputText, sendMutation, user?.id]);

  const handleRetry = useCallback((message: MessageDto) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // no-op
    }
    setLocalMessages((previous) => previous.filter((item) => item.id !== message.id));
    setInputText(message.body);
  }, []);

  return {
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
    userId: user?.id,
  };
}
