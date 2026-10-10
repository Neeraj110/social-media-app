import { create } from 'zustand';

interface PresenceState {
  onlineUserIds: string[];
  typingUsers: Record<string, string[]>; // conversationId -> array of userIds
  isConnected: boolean;
  setOnlineUserIds: (ids: string[]) => void;
  addOnlineUser: (id: string) => void;
  removeOnlineUser: (id: string) => void;
  setUserTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  setIsConnected: (connected: boolean) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineUserIds: [],
  typingUsers: {},
  isConnected: false,
  setOnlineUserIds: (ids) => set({ onlineUserIds: Array.from(new Set(ids)) }),
  addOnlineUser: (id) =>
    set((state) => ({
      onlineUserIds: Array.from(new Set([...state.onlineUserIds, id])),
    })),
  removeOnlineUser: (id) =>
    set((state) => ({
      onlineUserIds: state.onlineUserIds.filter((uId) => uId !== id),
    })),
  setUserTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const currentList = state.typingUsers[conversationId] || [];
      const updatedList = isTyping
        ? Array.from(new Set([...currentList, userId]))
        : currentList.filter((id) => id !== userId);
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: updatedList,
        },
      };
    }),
  setIsConnected: (connected) => set({ isConnected: connected }),
}));
