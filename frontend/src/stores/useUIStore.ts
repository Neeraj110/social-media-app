import { create } from 'zustand';
import { AppView, User } from '../types';

interface UIState {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeView: 'feed',
  setActiveView: (view) => set({ activeView: view }),
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),
  isSearchOpen: false,
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),
  isAuthModalOpen: false,
  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  authModalMode: 'login',
  setAuthModalMode: (mode) => set({ authModalMode: mode }),
  openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
