import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '../lib/api';
import { mapBackendUserToUser } from '../lib/userMapper';
import { Conversation, DirectMessage, User } from '../types';
import { usePresenceStore } from '../stores/usePresenceStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export const chatQueryKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatQueryKeys.all, 'conversations'] as const,
  conversation: (id: string | number) => [...chatQueryKeys.all, 'conversation', String(id)] as const,
  messages: (convId: string | number) => [...chatQueryKeys.all, 'messages', String(convId)] as const,
};

export function mapBackendMessageToDirectMessage(raw: any, conversationId?: string): DirectMessage {
  const senderUser = raw.sender ? mapBackendUserToUser(raw.sender) : mapBackendUserToUser({ user_id: raw.sender_id });
  return {
    id: String(raw.message_id ?? raw.id ?? Date.now()),
    conversationId: String(raw.conversation_id ?? conversationId ?? ''),
    senderId: String(raw.sender_id ?? raw.sender?.user_id ?? ''),
    sender: senderUser,
    text: raw.content ?? raw.text ?? '',
    mediaUrl: raw.media_url ?? raw.mediaUrl,
    replyTo: raw.reply_to_message_id
      ? {
          id: String(raw.reply_to_message_id),
          senderName: raw.replyTo?.senderName || 'Message',
          text: raw.replyTo?.text || '',
        }
      : undefined,
    createdAt: raw.created_at ?? new Date().toISOString(),
    status: raw.is_read ? 'read' : 'delivered',
  };
}

export function mapBackendConversationToConversation(raw: any, currentUserId?: string): Conversation {
  const participants = (raw.participants || []).map(mapBackendUserToUser);
  const recipient =
    participants.find((p: User) => p.id !== String(currentUserId)) ||
    participants[0] ||
    mapBackendUserToUser(null);

  return {
    id: String(raw.conversation_id ?? raw.id),
    participants,
    recipient,
    lastMessage: raw.last_message ? mapBackendMessageToDirectMessage(raw.last_message, String(raw.conversation_id)) : undefined,
    unreadCount: raw.unread_count ?? 0,
    updatedAt: raw.updated_at || raw.created_at || new Date().toISOString(),
    isGroup: Boolean(raw.is_group),
    groupName: raw.group_name || undefined,
  };
}

export function useConversations(currentUserId?: string) {
  return useQuery({
    queryKey: chatQueryKeys.conversations(),
    queryFn: async (): Promise<Conversation[]> => {
      const response = await api.get('/api/v1/messages/conversations');
      return (response.data || []).map((conv: any) =>
        mapBackendConversationToConversation(conv, currentUserId)
      );
    },
    staleTime: 1000 * 30,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: chatQueryKeys.messages(conversationId || ''),
    queryFn: async (): Promise<DirectMessage[]> => {
      if (!conversationId) return [];
      const response = await api.get(`/api/v1/messages/conversations/${conversationId}/messages?limit=100`);
      const messages = (response.data || []).map((msg: any) =>
        mapBackendMessageToDirectMessage(msg, conversationId)
      );
      // API returns messages sorted desc by ID; reverse to display in chronological order
      return messages.reverse();
    },
    enabled: Boolean(conversationId),
    staleTime: 1000 * 30,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      participantIds,
      isGroup = false,
      groupName,
    }: {
      participantIds: (string | number)[];
      isGroup?: boolean;
      groupName?: string;
    }) => {
      const numericIds = participantIds.map((id) =>
        typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id
      ).filter(id => !isNaN(id));

      const response = await api.post('/api/v1/messages/conversations', {
        participant_ids: numericIds,
        is_group: isGroup,
        group_name: groupName,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    },
  });
}

export function useSendMessage(conversationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      text,
      mediaUrl,
      replyToId,
    }: {
      text?: string;
      mediaUrl?: string;
      replyToId?: string | number;
    }) => {
      if (!conversationId) throw new Error('No active conversation');
      const response = await api.post(`/api/v1/messages/conversations/${conversationId}/messages`, {
        content: text,
        media_url: mediaUrl,
        reply_to_message_id: replyToId ? Number(replyToId) : undefined,
      });
      return response.data;
    },
    onMutate: async (newMessagePayload) => {
      if (!conversationId) return;
      await queryClient.cancelQueries({ queryKey: chatQueryKeys.messages(conversationId) });
      const previousMessages = queryClient.getQueryData<DirectMessage[]>(chatQueryKeys.messages(conversationId));

      const optimisticMsg: DirectMessage = {
        id: `temp_${Date.now()}`,
        conversationId,
        senderId: 'me',
        sender: mapBackendUserToUser({ user_id: 0, username: 'me' }),
        text: newMessagePayload.text || '',
        mediaUrl: newMessagePayload.mediaUrl,
        createdAt: new Date().toISOString(),
        status: 'sent',
      };

      if (previousMessages) {
        queryClient.setQueryData<DirectMessage[]>(
          chatQueryKeys.messages(conversationId),
          [...previousMessages, optimisticMsg]
        );
      }

      return { previousMessages };
    },
    onError: (_err, _variables, context) => {
      if (conversationId && context?.previousMessages) {
        queryClient.setQueryData(chatQueryKeys.messages(conversationId), context.previousMessages);
      }
    },
    onSuccess: (savedMessage) => {
      if (!conversationId) return;
      const formatted = mapBackendMessageToDirectMessage(savedMessage, conversationId);
      queryClient.setQueryData<DirectMessage[]>(
        chatQueryKeys.messages(conversationId),
        (old = []) => {
          const filtered = old.filter((m) => !m.id.startsWith('temp_') && m.id !== formatted.id);
          return [...filtered, formatted];
        }
      );
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    },
  });
}

export function useRealtimeChatSync(activeConversationId: string | null) {
  const queryClient = useQueryClient();
  const { setIsConnected } = usePresenceStore();

  useEffect(() => {
    const sock = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      if (activeConversationId) {
        sock.emit('join_conversation', { conversation_id: parseInt(activeConversationId, 10) });
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onNewMessage = (msgData: any) => {
      const convId = String(msgData.conversation_id);
      const incomingMsg = mapBackendMessageToDirectMessage(msgData, convId);

      // Update message list in TanStack Query cache
      queryClient.setQueryData<DirectMessage[]>(
        chatQueryKeys.messages(convId),
        (old = []) => {
          if (old.some((m) => m.id === incomingMsg.id)) {
            return old;
          }
          return [...old.filter((m) => !m.id.startsWith('temp_')), incomingMsg];
        }
      );

      // Invalidate conversation list so last message updates
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    };

    sock.on('connect', onConnect);
    sock.on('disconnect', onDisconnect);
    sock.on('new_message', onNewMessage);

    if (sock.connected) {
      setIsConnected(true);
      if (activeConversationId) {
        sock.emit('join_conversation', { conversation_id: parseInt(activeConversationId, 10) });
      }
    }

    return () => {
      if (activeConversationId && sock.connected) {
        sock.emit('leave_conversation', { conversation_id: parseInt(activeConversationId, 10) });
      }
      sock.off('connect', onConnect);
      sock.off('disconnect', onDisconnect);
      sock.off('new_message', onNewMessage);
    };
  }, [activeConversationId, queryClient, setIsConnected]);
}
