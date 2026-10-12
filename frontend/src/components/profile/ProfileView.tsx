"use client";

import React, { useState } from "react";
import { User, AppView } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { usePosts } from "../../context/PostContext";
import { useSocial } from "../../context/SocialContext";
import { useChat } from "../../context/ChatContext";
import { ProfileHeader } from "./ProfileHeader";
import { PostCard } from "../feed/PostCard";
import { Avatar } from "../ui/Avatar";
import { GlassCard } from "../ui/GlassCard";
import { EmptyState } from "../ui/EmptyState";
import {
  Grid,
  Image as ImageIcon,
  Bookmark,
  Users,
  Heart,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface ProfileViewProps {
  user: User;
  onNavigate: (view: AppView) => void;
  onSelectUser: (user: User) => void;
  onOpenReport?: (user: User) => void;
  onOpenBlock?: (user: User) => void;
  onStartChat?: (user?: User) => void;
  onEditProfile?: () => void;
}

export function ProfileView({
  user,
  onNavigate,
  onSelectUser,
  onOpenReport,
  onOpenBlock,
  onStartChat,
  onEditProfile,
}: ProfileViewProps) {
  const { currentUser } = useAuth();
  const { posts, savedPosts: contextSavedPosts } = usePosts();
  const { friends } = useSocial();
  const { startNewConversation, selectConversation } = useChat();

  const [activeTab, setActiveTab] = useState<"posts" | "media" | "saved" | "friends">("posts");

  const isMe = currentUser.id === user.id;

  // Filter posts created by this user
  const userPosts = posts.filter((p) => p.author.id === user.id);

  // Extract all media items from user posts
  const userMediaPosts = userPosts.filter(
    (p) => p.media && p.media.length > 0
  );

  // Filter saved posts if viewing own profile
  const savedPosts = contextSavedPosts;

  return (
    <div className="space-y-6 pb-16 lg:pb-8">
      {/* Top Profile Header Component */}
      <ProfileHeader
        user={user}
        onNavigate={onNavigate}
        onOpenReport={onOpenReport}
        onOpenBlock={onOpenBlock}
        onStartChat={onStartChat}
        onEditProfile={onEditProfile}
      />

      {/* Profile Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] select-none">
        <div className="flex gap-4 sm:gap-8">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === "posts"
                ? "border-primary text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300"
            }`}
          >
            <Grid size={15} />
            <span>Sparks</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#242424] text-slate-600 dark:text-zinc-400">
              {userPosts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`flex items-center gap-2 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === "media"
                ? "border-primary text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300"
            }`}
          >
            <ImageIcon size={15} />
            <span>Media</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#242424] text-slate-600 dark:text-zinc-400">
              {userMediaPosts.length}
            </span>
          </button>

          {isMe && (
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
                activeTab === "saved"
                  ? "border-primary text-slate-900 dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
            >
              <Bookmark size={15} />
              <span>Saved</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#242424] text-slate-600 dark:text-zinc-400">
                {savedPosts.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("friends")}
            className={`flex items-center gap-2 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === "friends"
                ? "border-primary text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300"
            }`}
          >
            <Users size={15} />
            <span>Network</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#242424] text-slate-600 dark:text-zinc-400">
              {friends.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: User Sparks (Posts) */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={24} />}
              title="No sparks published yet"
              description={`@${user.username} hasn't published any sparks to the network.`}
            />
          ) : (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onSelectUser={onSelectUser}
              />
            ))
          )}
        </div>
      )}

      {/* Tab 2: Media Gallery */}
      {activeTab === "media" && (
        <div>
          {userMediaPosts.length === 0 ? (
            <EmptyState
              icon={<ImageIcon size={24} />}
              title="No media uploaded"
              description="Photos, shaders, and visual prototypes will appear in this gallery."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {userMediaPosts.flatMap((post) =>
                (post.media || []).map((med, idx) => (
                  <div
                    key={`${post.id}-${idx}`}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-[var(--bg-panel)] border border-slate-200 dark:border-[#303030] cursor-pointer"
                  >
                    <img
                      src={med.url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    {/* Hover Stats Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white text-xs font-bold backdrop-blur-xs">
                      <div className="flex items-center gap-1.5">
                        <Heart size={14} className="fill-rose-500 text-rose-500" />
                        <span>{post.reactionCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={14} />
                        <span>{post.commentsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Sparks (Own Profile Only) */}
      {activeTab === "saved" && isMe && (
        <div className="space-y-4">
          {savedPosts.length === 0 ? (
            <EmptyState
              icon={<Bookmark size={24} />}
              title="No bookmarked sparks"
              description="Bookmark any post across Nexus to store it in your private collection."
            />
          ) : (
            savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onSelectUser={onSelectUser}
              />
            ))
          )}
        </div>
      )}

      {/* Tab 4: Friends Network */}
      {activeTab === "friends" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {friends.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={<Users size={24} />}
                title="No connections yet"
                description="Explore suggested creators and send friend requests to build your spatial network."
              />
            </div>
          ) : (
            friends.map((friend) => (
              <GlassCard
                key={friend.id}
                className="p-4 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]"
                hoverEffect
              >
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => onSelectUser(friend)}
                >
                  <Avatar
                    src={friend.avatarUrl}
                    alt={friend.displayName}
                    size="md"
                    status={friend.status}
                    isVerified={friend.isVerified}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white hover:text-primary transition truncate">
                      {friend.displayName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-500 truncate font-mono">
                      @{friend.username} • {friend.role || "Creator"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      const convId = await startNewConversation(friend);
                      selectConversation(convId);
                      onNavigate("messages");
                    } catch (err) {
                      console.error("Failed to start conversation", err);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-primary text-slate-700 hover:text-white dark:text-white text-[11px] font-bold transition shrink-0 active:scale-95"
                >
                  Message
                </button>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}
