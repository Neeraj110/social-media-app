"use client";

import React, { useState } from "react";
import { User, Post, AppView } from "../../types";
import { usePosts } from "../../context/PostContext";
import { useStory } from "../../context/StoryContext";
import { useToast } from "../../context/ToastContext";
import { StoryRail } from "../stories/StoryRail";
import { StoryViewerModal } from "../stories/StoryViewerModal";
import { CreateStoryModal } from "../stories/CreateStoryModal";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";
import { CreatePostModal } from "./CreatePostModal";
import { ShareModal } from "./ShareModal";
import { EmptyState } from "../ui/EmptyState";
import { SkeletonPost } from "../ui/Skeleton";
import {
  Sparkles,
  Flame,
  Users,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";

interface FeedViewProps {
  onNavigate: (view: AppView) => void;
  onSelectUser: (user: User) => void;
  onOpenReport?: (user: User) => void;
  onOpenBlock?: (user: User) => void;
  onOpenCopilot?: () => void;
}

export function FeedView({
  onNavigate,
  onSelectUser,
  onOpenReport,
  onOpenBlock,
  onOpenCopilot,
}: FeedViewProps) {
  const { posts } = usePosts();
  const { isViewerOpen, isCreateStoryOpen, closeStoryViewer, setIsCreateStoryOpen } =
    useStory();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"foryou" | "following" | "trending" | "media">("foryou");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter posts based on active tab
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "media") {
      return post.media && post.media.length > 0;
    }
    if (activeTab === "trending") {
      const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);
      return totalReactions >= 40 || (post.hashtags && post.hashtags.length > 1);
    }
    if (activeTab === "following") {
      return ["user_elena", "user_marcus", "user_sarah"].includes(post.author.id);
    }
    return true;
  });

  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Feed refreshed with latest spatial sparks", "info");
    }, 600);
  };

  return (
    <div className="space-y-5 pb-16 lg:pb-8 select-none">
      {/* 1. TOP STORIES RAIL */}
      <StoryRail />

      {/* 2. INLINE COMPOSER CARD */}
      <PostComposer
        onOpenModal={() => setIsCreatePostOpen(true)}
      />

      {/* 3. FEED FILTER TABS & REFRESH */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.06] shadow-xs overflow-x-auto hide-scroll">
          <button
            onClick={() => setActiveTab("foryou")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
              activeTab === "foryou"
                ? "bg-primary text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles size={13} className={activeTab === "foryou" ? "text-white" : ""} />
            For You
          </button>

          <button
            onClick={() => setActiveTab("following")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
              activeTab === "following"
                ? "bg-primary text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users size={13} />
            Following
          </button>

          <button
            onClick={() => setActiveTab("trending")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
              activeTab === "trending"
                ? "bg-primary text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Flame size={13} className={activeTab === "trending" ? "text-white" : "text-amber-500"} />
            Trending Sparks
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
              activeTab === "media"
                ? "bg-primary text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ImageIcon size={13} />
            Media
          </button>
        </div>

        {/* Quick Refresh */}
        <button
          onClick={handleRefreshFeed}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition border border-slate-200/80 dark:border-white/[0.06] shrink-0 active:scale-95 shadow-xs"
          title="Refresh Feed"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin text-primary" : ""} />
        </button>
      </div>

      {/* 4. POST STREAM */}
      {isRefreshing ? (
        <div className="space-y-4">
          <SkeletonPost />
          <SkeletonPost />
        </div>
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={26} />}
          title="No sparks found in this stream"
          description="Try switching tabs or creating a new post to ignite the discussion."
          actionLabel="Create a Spark"
          onAction={() => setIsCreatePostOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onSelectUser={onSelectUser}
              onOpenReport={(p: Post) => onOpenReport?.(p.author)}
              onOpenBlock={onOpenBlock}
            />
          ))}
        </div>
      )}

      {/* 5. MODALS */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onOpenCopilot={onOpenCopilot}
      />

      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
      />

      <StoryViewerModal />

      {sharingPost && (
        <ShareModal
          isOpen={!!sharingPost}
          onClose={() => setSharingPost(null)}
          post={sharingPost}
        />
      )}
    </div>
  );
}
