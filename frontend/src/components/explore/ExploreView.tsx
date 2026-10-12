"use client";

import React, { useState, useEffect } from "react";
import { User, AppView } from "../../types";
import { usePosts } from "../../context/PostContext";
import { useSocial } from "../../context/SocialContext";
import { useSuggestedUsers, useUserSearch } from "../../hooks/useUsers";
import { mapBackendUserToUser } from "../../lib/userMapper";
import { GlassCard } from "../ui/GlassCard";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { PostCard } from "../feed/PostCard";
import { EmptyState } from "../ui/EmptyState";
import {
  Search,
  Sparkles,
  Flame,
  Image as ImageIcon,
  Users,
  Heart,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";

interface ExploreViewProps {
  onNavigate: (view: AppView) => void;
  onSelectUser: (user: User) => void;
  onOpenReport?: (user: User) => void;
}

const TRENDING_TOPICS = [
  { tag: "SpatialComputing", count: "48.2k sparks", velocity: "+24% this hour", category: "Hardware & UI" },
  { tag: "GenerativeUI", count: "32.9k sparks", velocity: "+18% this hour", category: "Design Systems" },
  { tag: "WebGPU", count: "21.4k sparks", velocity: "+45% this hour", category: "Graphics" },
  { tag: "NextJS15", count: "19.8k sparks", velocity: "+12% this hour", category: "Frameworks" },
  { tag: "KineticDesign", count: "14.6k sparks", velocity: "+30% this hour", category: "Motion" },
  { tag: "AIHardware", count: "11.2k sparks", velocity: "+8% this hour", category: "Tech" },
];

export function ExploreView({
  onNavigate,
  onSelectUser,
  onOpenReport,
}: ExploreViewProps) {
  const { posts } = usePosts();
  const { isFollowing, followUser, unfollowUser, friends, following } = useSocial();
  const { data: suggestedUsers = [] } = useSuggestedUsers(30);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"foryou" | "trending" | "media" | "creators">("foryou");
  const { data: backendSearchResults = [], isFetching: isSearching } = useUserSearch(searchQuery);

  // Collect discovered creators from suggested users, post authors, friends, and following
  const creatorMap = new Map<string, User>();
  suggestedUsers.forEach((u) => creatorMap.set(u.id, u));
  friends.forEach((u) => creatorMap.set(u.id, u));
  following.forEach((u) => creatorMap.set(u.id, u));
  posts.forEach((p) => {
    if (p.author) creatorMap.set(p.author.id, p.author);
  });
  const allUsers = Array.from(creatorMap.values());

  // Filter posts based on search query
  const matchingPosts = posts.filter(
    (p) =>
      p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.hashtags || []).some((h) =>
        h.toLowerCase().includes(searchQuery.toLowerCase().replace(/^#/, ""))
      )
  );

  // Merge local matches and backend matches
  const localMatchingUsers = allUsers.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const mergedUsers = [...localMatchingUsers];
  backendSearchResults.forEach((bu) => {
    if (!mergedUsers.some((mu) => mu.id === bu.id)) {
      mergedUsers.push(bu);
    }
  });
  const matchingUsers = searchQuery ? mergedUsers : allUsers;

  // Extract all media items from posts
  const allMediaPosts = posts.filter((p) => p.media && p.media.length > 0);

  return (
    <div className="space-y-6 pb-16 lg:pb-8 select-none">
      {/* Universal Search & Hero Banner */}
      <GlassCard className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]" elevated>
        <div className="max-w-2xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-[11px] text-primary font-bold">
            <Sparkles size={12} />
            Nexus Neural Discovery
          </div>

          <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Explore the Horizon of Spatial Social
          </h1>

          {/* Omnibox Search Input */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sparks, creators (@username), or tags (#SpatialComputing)..."
              className="w-full bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#303030] rounded-2xl pl-12 pr-4 py-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-[#1B1B1B] shadow-sm outline-none transition"
              autoFocus={false}
            />
          </div>

          {/* Quick Tag Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {TRENDING_TOPICS.slice(0, 4).map((topic) => (
              <button
                key={topic.tag}
                onClick={() => setSearchQuery(`#${topic.tag}`)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-[11px] text-slate-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary border border-slate-200/80 dark:border-white/[0.04] transition flex items-center gap-1 active:scale-95"
              >
                <span>#{topic.tag}</span>
                <ArrowUpRight size={10} className="text-slate-400 dark:text-zinc-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Tab Filter Navigation */}
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-100 dark:border-white/[0.06] mt-6 overflow-x-auto hide-scroll">
          <button
            onClick={() => setActiveTab("foryou")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "foryou"
                ? "bg-primary text-white shadow-sm"
                : "bg-slate-100 dark:bg-[#242424] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles size={13} />
            For You
          </button>

          <button
            onClick={() => setActiveTab("trending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "trending"
                ? "bg-primary text-white shadow-sm"
                : "bg-slate-100 dark:bg-[#242424] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Flame size={13} />
            Trending Sparks
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "media"
                ? "bg-primary text-white shadow-sm"
                : "bg-slate-100 dark:bg-[#242424] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ImageIcon size={13} />
            Visual Grid
          </button>

          <button
            onClick={() => setActiveTab("creators")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "creators"
                ? "bg-primary text-white shadow-sm"
                : "bg-slate-100 dark:bg-[#242424] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users size={13} />
            Top Creators
          </button>
        </div>
      </GlassCard>

      {/* If Search Query is Active: Show Search Results */}
      {searchQuery.trim() ? (
        <div className="space-y-6">
          <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
            Showing results for &quot;<strong className="text-slate-900 dark:text-white">{searchQuery}</strong>&quot;
          </div>

          {/* User Results */}
          {matchingUsers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Creators Matching Search
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {matchingUsers.map((user) => (
                  <GlassCard
                    key={user.id}
                    className="p-3.5 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]"
                    hoverEffect
                  >
                    <div
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                      onClick={() => onSelectUser(user)}
                    >
                      <Avatar
                        src={user.avatarUrl}
                        alt={user.displayName}
                        size="md"
                        status={user.status}
                        isVerified={user.isVerified}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white hover:text-primary transition truncate">
                          {user.displayName}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Post Results */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Sparks ({matchingPosts.length})
            </h3>
            {matchingPosts.length === 0 ? (
              <EmptyState
                icon={<Search size={24} />}
                title="No sparks match your query"
                description="Try refining your search terms or exploring the trending topics tab."
              />
            ) : (
              matchingPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onSelectUser={onSelectUser}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Tab 1: For You Stream */}
          {activeTab === "foryou" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <EmptyState
                  icon={<Sparkles size={24} />}
                  title="No sparks published yet"
                  description="Be the first to share an idea, design snippet, or photo with the community."
                />
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelectUser={onSelectUser}
                  />
                ))
              )}
            </div>
          )}

          {/* Tab 2: Trending Sparks Rail */}
          {activeTab === "trending" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRENDING_TOPICS.map((topic, idx) => (
                <GlassCard
                  key={topic.tag}
                  onClick={() => setSearchQuery(`#${topic.tag}`)}
                  className="p-5 flex items-center justify-between bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] cursor-pointer"
                  hoverEffect
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-black text-xl text-primary/40">
                      0{idx + 1}
                    </span>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono uppercase tracking-wider">
                        {topic.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition">
                        #{topic.tag}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        <span>{topic.count}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                          {topic.velocity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400">
                    <ArrowUpRight size={16} />
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Tab 3: Visual Media Grid */}
          {activeTab === "media" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allMediaPosts.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon={<ImageIcon size={24} />}
                    title="No visual media found"
                    description="Upload photos and videos with Instagram filters to display them in the visual grid."
                  />
                </div>
              ) : (
                allMediaPosts.flatMap((post) =>
                  (post.media || []).map((med, idx) => (
                    <div
                      key={`${post.id}-${idx}`}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-[var(--bg-panel)] border border-slate-200/80 dark:border-white/[0.08] cursor-pointer"
                    >
                      <img
                        src={med.url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />

                      {/* Hover Stats */}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 text-white text-xs font-bold backdrop-blur-xs">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Heart size={14} className="fill-rose-500 text-rose-500" />
                            <span>{post.reactionCount || post.reactions.total}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MessageSquare size={14} />
                            <span>{post.commentsCount}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-300">
                          by @{post.author.username}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          )}

          {/* Tab 4: Top Creators Spotlight */}
          {activeTab === "creators" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allUsers.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon={<Users size={24} />}
                    title="No creators indexed yet"
                    description="Connect with new members as the community grows."
                  />
                </div>
              ) : (
                allUsers.map((user) => {
                  const following = isFollowing(user.id);
                  return (
                    <GlassCard
                      key={user.id}
                      className="p-5 flex flex-col justify-between text-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]"
                      hoverEffect
                    >
                      <div
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => onSelectUser(user)}
                      >
                        <Avatar
                          src={user.avatarUrl}
                          alt={user.displayName}
                          size="xl"
                          status={user.status}
                          isVerified={user.isVerified}
                          className="mb-2"
                        />
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white hover:text-primary transition">
                            {user.displayName}
                          </h4>
                          {user.isVerified && <VerifiedBadge size={14} />}
                        </div>
                        <span className="text-[11px] text-primary font-mono">
                          @{user.username}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 line-clamp-2">
                          {user.bio || user.role}
                        </p>
                      </div>

                      <Button
                        variant={following ? "secondary" : "primary"}
                        size="sm"
                        onClick={() =>
                          following ? unfollowUser(user.id) : followUser(user)
                        }
                        className="w-full rounded-xl text-xs font-bold shadow-xs"
                      >
                        {following ? "Following" : "Follow"}
                      </Button>
                    </GlassCard>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
