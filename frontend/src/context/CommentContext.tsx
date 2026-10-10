"use client";

import React, { createContext, useContext, useState } from "react";
import { Comment } from "../types";
import { useAuth } from "./AuthContext";

interface CommentContextType {
  comments: Record<string, Comment[]>;
  getCommentsForPost: (postId: string) => Comment[];
  addComment: (postId: string, content: string, parentId?: string | null) => Comment;
  toggleLikeComment: (postId: string, commentId: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export function CommentProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
    const [comments, setComments] = useState<Record<string, Comment[]>>({});

  const getCommentsForPost = (postId: string): Comment[] => {
    return comments[postId] || [];
  };

  const addComment = (postId: string, content: string, parentId: string | null = null): Comment => {
    const newComment: Comment = {
      id: 'c_' + Date.now(),
      postId,
      parentId,
      author: currentUser,
      content,
      createdAt: 'Just now',
      likesCount: 0,
      isLiked: false,
      replies: [],
      replyCount: 0,
    };

    setComments((prev) => {
      const postComments = prev[postId] || [];

      if (!parentId) {
        return {
          ...prev,
          [postId]: [newComment, ...postComments],
        };
      }

      // Helper to recursively append reply
      const appendNestedReply = (list: Comment[]): Comment[] => {
        return list.map((item) => {
          if (item.id === parentId) {
            const replies = item.replies || [];
            return {
              ...item,
              replies: [...replies, newComment],
              replyCount: (item.replyCount || 0) + 1,
            };
          }
          if (item.replies && item.replies.length > 0) {
            return {
              ...item,
              replies: appendNestedReply(item.replies),
            };
          }
          return item;
        });
      };

      return {
        ...prev,
        [postId]: appendNestedReply(postComments),
      };
    });

    return newComment;
  };

  const toggleLikeComment = (postId: string, commentId: string) => {
    setComments((prev) => {
      const postComments = prev[postId];
      if (!postComments) return prev;

      const toggleInTree = (list: Comment[]): Comment[] => {
        return list.map((item) => {
          if (item.id === commentId) {
            const isLiked = !item.isLiked;
            return {
              ...item,
              isLiked,
              likesCount: isLiked ? item.likesCount + 1 : Math.max(0, item.likesCount - 1),
            };
          }
          if (item.replies && item.replies.length > 0) {
            return {
              ...item,
              replies: toggleInTree(item.replies),
            };
          }
          return item;
        });
      };

      return {
        ...prev,
        [postId]: toggleInTree(postComments),
      };
    });
  };

  const deleteComment = (postId: string, commentId: string) => {
    setComments((prev) => {
      const postComments = prev[postId];
      if (!postComments) return prev;

      const deleteFromTree = (list: Comment[]): Comment[] => {
        return list
          .filter((item) => item.id !== commentId)
          .map((item) => {
            if (item.replies && item.replies.length > 0) {
              return {
                ...item,
                replies: deleteFromTree(item.replies),
              };
            }
            return item;
          });
      };

      return {
        ...prev,
        [postId]: deleteFromTree(postComments),
      };
    });
  };

  return (
    <CommentContext.Provider
      value={{
        comments,
        getCommentsForPost,
        addComment,
        toggleLikeComment,
        deleteComment,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
}

export function useComment() {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error("useComment must be used within a CommentProvider");
  }
  return context;
}
