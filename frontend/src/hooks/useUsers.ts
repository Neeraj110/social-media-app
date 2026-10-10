import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { mapBackendUserToUser } from '../lib/userMapper';
import { User } from '../types';

export const userQueryKeys = {
  all: ['users'] as const,
  current: () => [...userQueryKeys.all, 'me'] as const,
  suggested: () => [...userQueryKeys.all, 'suggested'] as const,
  search: (query: string) => [...userQueryKeys.all, 'search', query] as const,
  profile: (userId: string | number) => [...userQueryKeys.all, 'profile', String(userId)] as const,
  followers: (userId: string | number) => [...userQueryKeys.all, 'followers', String(userId)] as const,
  following: (userId: string | number) => [...userQueryKeys.all, 'following', String(userId)] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: userQueryKeys.current(),
    queryFn: async (): Promise<User> => {
      const response = await api.get('/api/v1/users/me');
      return mapBackendUserToUser(response.data);
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useSuggestedUsers(limit: number = 20) {
  return useQuery({
    queryKey: [...userQueryKeys.suggested(), limit],
    queryFn: async (): Promise<User[]> => {
      const response = await api.get(`/api/v1/users/suggested?limit=${limit}`);
      return (response.data || []).map(mapBackendUserToUser);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useUserSearch(query: string, limit: number = 20) {
  return useQuery({
    queryKey: [...userQueryKeys.search(query), limit],
    queryFn: async (): Promise<User[]> => {
      if (!query || query.trim().length === 0) return [];
      const response = await api.get(`/api/v1/users/search/?q=${encodeURIComponent(query)}&limit=${limit}`);
      return (response.data || []).map(mapBackendUserToUser);
    },
    enabled: Boolean(query && query.trim().length > 0),
    staleTime: 1000 * 30,
  });
}

export function useUserProfile(userId: string | number | undefined) {
  return useQuery({
    queryKey: userQueryKeys.profile(userId || ''),
    queryFn: async (): Promise<User> => {
      if (!userId) throw new Error('No user ID provided');
      const response = await api.get(`/api/v1/users/${userId}`);
      return mapBackendUserToUser(response.data);
    },
    enabled: Boolean(userId),
  });
}

export function useFollowers(userId: string | number | undefined) {
  return useQuery({
    queryKey: userQueryKeys.followers(userId || ''),
    queryFn: async (): Promise<User[]> => {
      if (!userId) return [];
      const response = await api.get(`/api/v1/users/${userId}/followers`);
      return (response.data || []).map(mapBackendUserToUser);
    },
    enabled: Boolean(userId),
  });
}

export function useFollowing(userId: string | number | undefined) {
  return useQuery({
    queryKey: userQueryKeys.following(userId || ''),
    queryFn: async (): Promise<User[]> => {
      if (!userId) return [];
      const response = await api.get(`/api/v1/users/${userId}/following`);
      return (response.data || []).map(mapBackendUserToUser);
    },
    enabled: Boolean(userId),
  });
}
