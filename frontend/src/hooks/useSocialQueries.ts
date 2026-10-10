import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { mapBackendUserToUser } from '../lib/userMapper';
import { User, FriendRequest } from '../types';
import { userQueryKeys } from './useUsers';

export const socialQueryKeys = {
  all: ['social'] as const,
  friends: () => [...socialQueryKeys.all, 'friends'] as const,
  pendingRequests: () => [...socialQueryKeys.all, 'requests', 'pending'] as const,
  sentRequests: () => [...socialQueryKeys.all, 'requests', 'sent'] as const,
};

export function useFriends(skip: number = 0, limit: number = 50) {
  return useQuery({
    queryKey: [...socialQueryKeys.friends(), skip, limit],
    queryFn: async (): Promise<User[]> => {
      const response = await api.get(`/api/v1/friends?skip=${skip}&limit=${limit}`);
      return (response.data || []).map(mapBackendUserToUser);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useFriendRequests() {
  return useQuery({
    queryKey: socialQueryKeys.pendingRequests(),
    queryFn: async (): Promise<FriendRequest[]> => {
      const response = await api.get('/api/v1/friend-requests/pending');
      return (response.data || []).map((raw: any) => ({
        id: String(raw.request_id),
        sender: mapBackendUserToUser(raw.sender || { user_id: raw.sender_id, username: `user_${raw.sender_id}` }),
        createdAt: raw.created_at || new Date().toISOString(),
        status: raw.status === 'rejected' ? 'declined' : raw.status || 'pending',
      }));
    },
    staleTime: 1000 * 30,
  });
}

export function useSentFriendRequests() {
  return useQuery({
    queryKey: socialQueryKeys.sentRequests(),
    queryFn: async (): Promise<any[]> => {
      const response = await api.get('/api/v1/friend-requests/sent');
      return response.data || [];
    },
    staleTime: 1000 * 30,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receiverId: string | number) => {
      const numericId = typeof receiverId === 'string' ? parseInt(receiverId.replace(/\D/g, ''), 10) : receiverId;
      const response = await api.post('/api/v1/friend-requests', { receiver_id: numericId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.suggested() });
    },
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string | number) => {
      const response = await api.put(`/api/v1/friend-requests/${requestId}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string | number) => {
      const response = await api.put(`/api/v1/friend-requests/${requestId}/reject`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.pendingRequests() });
    },
  });
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string | number) => {
      await api.delete(`/api/v1/friend-requests/${requestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
    },
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string | number) => {
      const numericId = typeof userId === 'string' ? parseInt(userId.replace(/\D/g, ''), 10) : userId;
      const response = await api.post(`/api/v1/users/${numericId}/follow`);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.following(variables) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.followers(variables) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.suggested() });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string | number) => {
      const numericId = typeof userId === 'string' ? parseInt(userId.replace(/\D/g, ''), 10) : userId;
      await api.delete(`/api/v1/users/${numericId}/follow`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.following(variables) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.followers(variables) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.suggested() });
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string | number) => {
      const numericId = typeof userId === 'string' ? parseInt(userId.replace(/\D/g, ''), 10) : userId;
      const response = await api.post(`/api/v1/users/${numericId}/block`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string | number) => {
      const numericId = typeof userId === 'string' ? parseInt(userId.replace(/\D/g, ''), 10) : userId;
      await api.delete(`/api/v1/users/${numericId}/block`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}
