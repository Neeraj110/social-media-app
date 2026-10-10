import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Post, ReactionType, PostVisibility, MediaItem, CodeAttachment, Poll } from '../types';
import { mapBackendUserToUser } from '../lib/userMapper';

export const postQueryKeys = {
  all: ['posts'] as const,
  feed: () => [...postQueryKeys.all, 'feed'] as const,
  saved: () => [...postQueryKeys.all, 'saved'] as const,
  user: (userId: string | number) => [...postQueryKeys.all, 'user', String(userId)] as const,
};

// Map backend post to frontend Post format
export function mapBackendPostToPost(raw: any): Post {
  return {
    id: String(raw.post_id || raw.id),
    author: raw.user ? mapBackendUserToUser(raw.user) : mapBackendUserToUser({ user_id: raw.user_id, username: 'user' }),
    content: raw.content || '',
    createdAt: raw.created_at || new Date().toISOString(),
    visibility: raw.visibility || 'public',
    media: raw.media || [],
    codeSnippet: raw.codeSnippet,
    poll: raw.poll,
    hashtags: raw.hashtags || [],
    mentions: raw.mentions || [],
    reactions: {
      like: raw.reactions_count || 0,
      love: 0, haha: 0, wow: 0, sad: 0, angry: 0,
      total: raw.reactions_count || 0,
      userReaction: raw.user_reaction,
    },
    commentsCount: raw.comments_count || 0,
    sharesCount: raw.shares_count || 0,
    viewsCount: raw.views_count || 1,
    isSaved: Boolean(raw.is_saved),
    isPinned: Boolean(raw.is_pinned),
  };
}

export function useFeedPosts(skip = 0, limit = 20) {
  return useQuery({
    queryKey: [...postQueryKeys.feed(), skip, limit],
    queryFn: async (): Promise<Post[]> => {
      const response = await api.get(`/api/v1/posts/feed?skip=${skip}&limit=${limit}`);
      return (response.data || []).map(mapBackendPostToPost);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useSavedPosts(skip = 0, limit = 20) {
  return useQuery({
    queryKey: [...postQueryKeys.saved(), skip, limit],
    queryFn: async (): Promise<Post[]> => {
      const response = await api.get(`/api/v1/posts/saved/me?skip=${skip}&limit=${limit}`);
      return (response.data || []).map(mapBackendPostToPost);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Post>) => {
      const response = await api.post('/api/v1/posts/', payload);
      return mapBackendPostToPost(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string | number) => {
      await api.delete(`/api/v1/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
    },
  });
}

export function useReactToPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, type }: { postId: string | number; type: ReactionType }) => {
      const response = await api.post(`/api/v1/posts/${postId}/react`, { type });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
    },
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string | number) => {
      await api.delete(`/api/v1/posts/${postId}/react`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
    },
  });
}

export function useToggleSavePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isCurrentlySaved }: { postId: string | number; isCurrentlySaved: boolean }) => {
      if (isCurrentlySaved) {
        await api.delete(`/api/v1/posts/${postId}/save`);
      } else {
        await api.post(`/api/v1/posts/${postId}/save`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
    },
  });
}
