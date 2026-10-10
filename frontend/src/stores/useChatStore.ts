import { create } from 'zustand';
import { DirectMessage } from '../types';

interface ChatState {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  replyingTo: DirectMessage | null;
  setReplyingTo: (msg: DirectMessage | null) => void;
  drafts: Record<string, string>;
  setDraft: (conversationId: string, text: string) => void;
  clearDraft: (conversationId: string) => void;
  isNewChatOpen: boolean;
  setIsNewChatOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id, replyingTo: null }),
  replyingTo: null,
  setReplyingTo: (msg) => set({ replyingTo: msg }),
  drafts: {},
  setDraft: (conversationId, text) =>
    set((state) => ({
      drafts: { ...state.drafts, [conversationId]: text },
    })),
  clearDraft: (conversationId) =>
    set((state) => {
      const newDrafts = { ...state.drafts };
      delete newDrafts[conversationId];
      return { drafts: newDrafts };
    }),
  isNewChatOpen: false,
  setIsNewChatOpen: (open) => set({ isNewChatOpen: open }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
