"use client";

import React, { createContext, useContext, useEffect, useMemo, useCallback } from "react";
import { Conversation, DirectMessage, User } from "../types";
import { useAuth } from "./AuthContext";
import { useChatStore } from "../stores/useChatStore";
import {
  useConversations,
  useConversationMessages,
  useSendMessage as useSendMsgMutation,
  useCreateConversation,
  useRealtimeChatSync,
} from "../hooks/useChatQueries";

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeMessages: DirectMessage[];
  isTyping: boolean;
  selectConversation: (conversationId: string) => void;
  sendMessage: (text: string, replyTo?: DirectMessage['replyTo'], mediaUrl?: string) => Promise<void>;
  startNewConversation: (recipient: User) => Promise<string>;
  unreadTotal: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { activeConversationId, setActiveConversationId } = useChatStore();

  const { data: conversations = [] } = useConversations(currentUser?.id);

  // Set default active conversation if none selected and conversations exist
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations, setActiveConversationId]);

  // Real-time socket synchronization
  useRealtimeChatSync(activeConversationId);

  const { data: activeMessages = [] } = useConversationMessages(activeConversationId);

  const sendMessageMutation = useSendMsgMutation(activeConversationId);
  const createConversationMutation = useCreateConversation();

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;
  }, [conversations, activeConversationId]);

  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, [setActiveConversationId]);

  const sendMessage = useCallback(async (
    text: string,
    replyTo?: DirectMessage['replyTo'],
    mediaUrl?: string
  ) => {
    if (!activeConversationId) return;
    await sendMessageMutation.mutateAsync({
      text,
      mediaUrl,
      replyToId: replyTo?.id,
    });
  }, [activeConversationId, sendMessageMutation]);

  const startNewConversation = useCallback(async (recipient: User): Promise<string> => {
    // Check if conversation already exists
    const existing = conversations.find(
      (c) => !c.isGroup && c.participants.some((p) => p.id === recipient.id)
    );

    if (existing) {
      selectConversation(existing.id);
      return existing.id;
    }

    // Call backend to create or get conversation
    const res = await createConversationMutation.mutateAsync({
      participantIds: [recipient.id],
      isGroup: false,
    });

    const newId = String(res.conversation_id);
    selectConversation(newId);
    return newId;
  }, [conversations, createConversationMutation, selectConversation]);

  const unreadTotal = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        activeMessages,
        isTyping: false,
        selectConversation,
        sendMessage,
        startNewConversation,
        unreadTotal,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
