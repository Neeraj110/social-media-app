"use client";

import React, { createContext, useContext, useState } from "react";
import { Reel, ReelAudioTrack, ReelComment } from "../types";
import { useAuth } from "./AuthContext";

interface CreateReelPayload {
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  audioTrack?: ReelAudioTrack;
  filterPreset?: string;
  hashtags?: string[];
  mentions?: string[];
}

interface ReelContextType {
  reels: Reel[];
  activeReelIndex: number;
  setActiveReelIndex: (index: number) => void;
  isCreateReelOpen: boolean;
  setIsCreateReelOpen: (open: boolean) => void;
  toggleLikeReel: (reelId: string) => void;
  toggleSaveReel: (reelId: string) => void;
  shareReel: (reelId: string) => void;
  incrementReelViews: (reelId: string) => void;
  comments: Record<string, ReelComment[]>;
  addReelComment: (reelId: string, content: string) => void;
  toggleLikeComment: (reelId: string, commentId: string) => void;
  createReel: (payload: CreateReelPayload) => Reel;
  deleteReel: (reelId: string) => void;
}

const ReelContext = createContext<ReelContextType | undefined>(undefined);

export function ReelProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeReelIndex, setActiveReelIndex] = useState<number>(0);
  const [isCreateReelOpen, setIsCreateReelOpen] = useState<boolean>(false);
  const [comments, setComments] = useState<Record<string, ReelComment[]>>({});

  const toggleLikeReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((reel) => {
        if (reel.id !== reelId) return reel;
        const newIsLiked = !reel.isLiked;
        return {
          ...reel,
          isLiked: newIsLiked,
          likesCount: newIsLiked ? reel.likesCount + 1 : Math.max(0, reel.likesCount - 1),
        };
      })
    );
  };

  const toggleSaveReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((reel) => {
        if (reel.id !== reelId) return reel;
        return {
          ...reel,
          isSaved: !reel.isSaved,
        };
      })
    );
  };

  const shareReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((reel) => {
        if (reel.id !== reelId) return reel;
        return {
          ...reel,
          sharesCount: reel.sharesCount + 1,
        };
      })
    );
  };

  const incrementReelViews = (reelId: string) => {
    setReels((prev) =>
      prev.map((reel) => {
        if (reel.id !== reelId) return reel;
        return {
          ...reel,
          viewsCount: reel.viewsCount + 1,
        };
      })
    );
  };

  const addReelComment = (reelId: string, content: string) => {
    if (!content.trim()) return;

    const newComment: ReelComment = {
      id: "rc_" + Date.now(),
      reelId,
      author: currentUser,
      content: content.trim(),
      createdAt: "Just now",
      likesCount: 0,
      isLiked: false,
    };

    setComments((prev) => ({
      ...prev,
      [reelId]: [newComment, ...(prev[reelId] || [])],
    }));

    setReels((prev) =>
      prev.map((r) => (r.id === reelId ? { ...r, commentsCount: r.commentsCount + 1 } : r))
    );
  };

  const toggleLikeComment = (reelId: string, commentId: string) => {
    setComments((prev) => {
      const reelComments = prev[reelId] || [];
      const updated = reelComments.map((c) => {
        if (c.id !== commentId) return c;
        const newLiked = !c.isLiked;
        return {
          ...c,
          isLiked: newLiked,
          likesCount: newLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
        };
      });
      return { ...prev, [reelId]: updated };
    });
  };

  const createReel = (payload: CreateReelPayload): Reel => {
    const extractedHashtags = payload.caption.match(/#[a-zA-Z0-9_]+/g) || [];
    const extractedMentions = payload.caption.match(/@[a-zA-Z0-9_]+/g) || [];

    const defaultAudio: ReelAudioTrack = {
      id: "audio_" + Date.now(),
      title: "Original Audio",
      artist: currentUser.displayName || currentUser.username,
    };

    const newReel: Reel = {
      id: "reel_" + Date.now(),
      author: currentUser,
      videoUrl: payload.videoUrl,
      thumbnailUrl: payload.thumbnailUrl || payload.videoUrl,
      caption: payload.caption,
      audioTrack: payload.audioTrack || defaultAudio,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 1,
      isLiked: false,
      isSaved: false,
      filterPreset: payload.filterPreset || "Normal",
      createdAt: "Just now",
      hashtags: Array.from(new Set([...extractedHashtags, ...(payload.hashtags || [])])),
      mentions: Array.from(new Set([...extractedMentions, ...(payload.mentions || [])])),
    };

    setReels((prev) => [newReel, ...prev]);
    return newReel;
  };

  const deleteReel = (reelId: string) => {
    setReels((prev) => prev.filter((r) => r.id !== reelId));
  };

  return (
    <ReelContext.Provider
      value={{
        reels,
        activeReelIndex,
        setActiveReelIndex,
        isCreateReelOpen,
        setIsCreateReelOpen,
        toggleLikeReel,
        toggleSaveReel,
        shareReel,
        incrementReelViews,
        comments,
        addReelComment,
        toggleLikeComment,
        createReel,
        deleteReel,
      }}
    >
      {children}
    </ReelContext.Provider>
  );
}

export function useReels() {
  const context = useContext(ReelContext);
  if (!context) {
    throw new Error("useReels must be used within a ReelProvider");
  }
  return context;
}
