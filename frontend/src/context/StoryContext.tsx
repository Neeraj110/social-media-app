"use client";

import React, { createContext, useContext, useState } from "react";
import { StoryGroup, StoryItem } from "../types";
import { useAuth } from "./AuthContext";

interface StoryContextType {
  storyGroups: StoryGroup[];
  stories: (StoryGroup & { id: string })[];
  activeGroup: StoryGroup | null;
  activeStoryGroup: StoryGroup | null;
  activeStoryUser: StoryGroup | null;
  activeStoryIndex: number;
  isViewerOpen: boolean;
  isCreateOpen: boolean;
  isCreateStoryOpen: boolean;
  setIsCreateStoryOpen: (open: boolean) => void;
  openViewer: (userId: string, initialIndex?: number) => void;
  openStoryViewer: (userId: string, initialIndex?: number) => void;
  closeViewer: () => void;
  closeStoryViewer: () => void;
  nextStory: () => void;
  prevStory: () => void;
  openCreateStory: () => void;
  closeCreateStory: () => void;
  createStory: (mediaUrl?: string, textOverlay?: string, backgroundGradient?: string) => void;
  addStory: (mediaUrl: string, type?: 'image' | 'video', caption?: string) => void;
  markStoryViewed: (groupId: string, storyId: string) => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const activeGroup = storyGroups.find((g) => g.userId === activeGroupId || g.id === activeGroupId) || null;

  const openViewer = (userId: string, initialIndex = 0) => {
    setActiveGroupId(userId);
    setActiveStoryIndex(initialIndex);
    setIsViewerOpen(true);

    // Mark group as seen
    setStoryGroups((prev) =>
      prev.map((g) => (g.userId === userId || g.id === userId ? { ...g, hasUnseen: false } : g))
    );
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setActiveGroupId(null);
    setActiveStoryIndex(0);
  };

  const nextStory = () => {
    if (!activeGroup) return;

    if (activeStoryIndex < activeGroup.stories.length - 1) {
      setActiveStoryIndex((prev) => prev + 1);
    } else {
      // Move to next story group
      const currentGroupIndex = storyGroups.findIndex(
        (g) => g.userId === activeGroupId || g.id === activeGroupId
      );
      if (currentGroupIndex < storyGroups.length - 1) {
        const nextGroup = storyGroups[currentGroupIndex + 1];
        setActiveGroupId(nextGroup.userId || nextGroup.id || null);
        setActiveStoryIndex(0);
      } else {
        closeViewer();
      }
    }
  };

  const prevStory = () => {
    if (!activeGroup) return;

    if (activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => prev - 1);
    } else {
      // Move to prev story group
      const currentGroupIndex = storyGroups.findIndex(
        (g) => g.userId === activeGroupId || g.id === activeGroupId
      );
      if (currentGroupIndex > 0) {
        const prevGroup = storyGroups[currentGroupIndex - 1];
        setActiveGroupId(prevGroup.userId || prevGroup.id || null);
        setActiveStoryIndex(prevGroup.stories.length - 1);
      }
    }
  };

  const openCreateStory = () => setIsCreateOpen(true);
  const closeCreateStory = () => setIsCreateOpen(false);

  const createStory = (mediaUrl?: string, textOverlay?: string, backgroundGradient?: string) => {
    const newStory: StoryItem = {
      id: 'st_custom_' + Date.now(),
      mediaUrl,
      type: 'image',
      durationSeconds: 5,
      caption: textOverlay,
      textOverlay,
      backgroundGradient,
      createdAt: 'Just now',
      viewers: [],
    };

    setStoryGroups((prev) => {
      const userGroupIndex = prev.findIndex((g) => g.userId === currentUser.id);

      if (userGroupIndex !== -1) {
        const updated = [...prev];
        updated[userGroupIndex] = {
          ...updated[userGroupIndex],
          hasUnseen: false,
          lastUpdated: 'Just now',
          stories: [newStory, ...updated[userGroupIndex].stories],
        };
        return updated;
      } else {
        const newGroup: StoryGroup = {
          id: currentUser.id,
          userId: currentUser.id,
          user: currentUser,
          hasUnseen: false,
          lastUpdated: 'Just now',
          stories: [newStory],
        };
        return [newGroup, ...prev];
      }
    });

    closeCreateStory();
  };

  const addStory = (mediaUrl: string, type: 'image' | 'video' = 'image', caption?: string) => {
    createStory(mediaUrl, caption);
  };

  const markStoryViewed = (groupId: string, storyId: string) => {
    setStoryGroups((prev) =>
      prev.map((group) => {
        if (group.userId !== groupId && group.id !== groupId) return group;
        return {
          ...group,
          stories: group.stories.map((s) => {
            if (s.id !== storyId) return s;
            const alreadyViewed = s.viewers?.some((v) => v.user.id === currentUser.id);
            if (alreadyViewed) return s;
            return {
              ...s,
              viewers: [{ user: currentUser, viewedAt: 'Just now' }, ...(s.viewers || [])],
            };
          }),
        };
      })
    );
  };

  const storiesWithId = storyGroups.map((g) => ({
    ...g,
    id: g.id || g.userId,
  }));

  return (
    <StoryContext.Provider
      value={{
        storyGroups,
        stories: storiesWithId,
        activeGroup,
        activeStoryGroup: activeGroup,
        activeStoryUser: activeGroup,
        activeStoryIndex,
        isViewerOpen,
        isCreateOpen,
        isCreateStoryOpen: isCreateOpen,
        setIsCreateStoryOpen: setIsCreateOpen,
        openViewer,
        openStoryViewer: openViewer,
        closeViewer,
        closeStoryViewer: closeViewer,
        nextStory,
        prevStory,
        openCreateStory,
        closeCreateStory,
        createStory,
        addStory,
        markStoryViewed,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error("useStory must be used within a StoryProvider");
  }
  return context;
}

export const useStories = useStory;
