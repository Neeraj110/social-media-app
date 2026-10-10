"use client";

import React, { createContext, useContext, useState } from "react";
import { Post, ReactionType, PostVisibility, MediaItem, CodeAttachment, Poll } from "../types";
import { useAuth } from "./AuthContext";
import { 
  useFeedPosts, 
  useCreatePost as useCreatePostMutation, 
  useDeletePost as useDeletePostMutation,
  useReactToPost as useReactToPostMutation,
  useRemoveReaction as useRemoveReactionMutation,
  useToggleSavePost as useToggleSavePostMutation,
  useSavedPosts as useSavedPostsQuery
} from "../hooks/usePosts";

interface CreatePostPayload {
  content: string;
  visibility: PostVisibility;
  media?: MediaItem[];
  codeSnippet?: CodeAttachment;
  poll?: Poll;
  hashtags?: string[];
  mentions?: string[];
}

interface PostContextType {
  posts: Post[];
  createPost: (payload: CreatePostPayload) => void;
  deletePost: (postId: string) => void;
  reactToPost: (postId: string, reactionType: ReactionType) => void;
  removeReaction: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  togglePinPost: (postId: string) => void;
  votePoll: (postId: string, optionId: string) => void;
  sharePost: (postId: string) => void;
  savedPosts: Post[];
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: React.ReactNode }) {
  const { data: posts = [] } = useFeedPosts();
  const { data: savedPosts = [] } = useSavedPostsQuery();
  
  const createPostMutation = useCreatePostMutation();
  const deletePostMutation = useDeletePostMutation();
  const reactToPostMutation = useReactToPostMutation();
  const removeReactionMutation = useRemoveReactionMutation();
  const toggleSavePostMutation = useToggleSavePostMutation();

  const createPost = async (payload: CreatePostPayload) => {
    // Extract hashtags and mentions automatically if not provided
    const extractedHashtags = payload.content.match(/#[a-zA-Z0-9_]+/g) || [];
    const extractedMentions = payload.content.match(/@[a-zA-Z0-9_]+/g) || [];

    await createPostMutation.mutateAsync({
      content: payload.content,
      visibility: payload.visibility || 'public',
      media: payload.media,
      codeSnippet: payload.codeSnippet,
      poll: payload.poll,
      hashtags: Array.from(new Set([...extractedHashtags, ...(payload.hashtags || [])])),
      mentions: Array.from(new Set([...extractedMentions, ...(payload.mentions || [])])),
    });
  };

  const deletePost = async (postId: string) => {
    await deletePostMutation.mutateAsync(postId);
  };

  const reactToPost = async (postId: string, reactionType: ReactionType) => {
    await reactToPostMutation.mutateAsync({ postId, type: reactionType });
  };

  const removeReaction = async (postId: string) => {
    await removeReactionMutation.mutateAsync(postId);
  };

  const toggleSavePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId) || savedPosts.find(p => p.id === postId);
    const isCurrentlySaved = post?.isSaved ?? false;
    await toggleSavePostMutation.mutateAsync({ postId, isCurrentlySaved });
  };

  const togglePinPost = (postId: string) => {
    // Implement API if backend supports
  };

  const votePoll = (postId: string, optionId: string) => {
    // Implement API if backend supports
  };

  const sharePost = (postId: string) => {
    // Implement API if backend supports
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        createPost,
        deletePost,
        reactToPost,
        removeReaction,
        toggleSavePost,
        togglePinPost,
        votePoll,
        sharePost,
        savedPosts,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export function usePost() {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
}

export const usePosts = usePost;
