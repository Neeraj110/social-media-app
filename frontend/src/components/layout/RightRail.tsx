"use client";

import React from "react";
import { AppView, User } from "../../types";
import { useSocial } from "../../context/SocialContext";
import { useChat } from "../../context/ChatContext";
import { useToast } from "../../context/ToastContext";
import { useSuggestedUsers } from "../../hooks/useUsers";
import { GlassCard } from "../ui/GlassCard";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Sparkles, Flame, UserPlus, MessageCircle } from "lucide-react";

interface RightRailProps {
  onNavigate: (view: AppView) => void;
  onSelectUser?: (user: User) => void;
}

const DEFAULT_TRENDING_TOPICS = [
  { id: "top_1", tag: "#SpatialComputing", category: "Hardware & UI", isHot: true, postCountFormatted: "14.2k sparks" },
  { id: "top_2", tag: "#GenerativeUI", category: "Design Systems", isHot: true, postCountFormatted: "11.4k sparks" },
  { id: "top_3", tag: "#WebGPU", category: "Graphics", isHot: false, postCountFormatted: "8.9k sparks" },
  { id: "top_4", tag: "#NextJS15", category: "Frameworks", isHot: false, postCountFormatted: "6.1k sparks" },
];

export function RightRail({ onNavigate, onSelectUser }: RightRailProps) {
  const { friends, isFollowing, toggleFollow } = useSocial();
  const { data: suggestedUsers = [] } = useSuggestedUsers(5);
  const { startNewConversation } = useChat();
  const { showToast } = useToast();

  const handleQuickMessage = async (user: User) => {
    await startNewConversation(user);
    onNavigate("messages");
    showToast(`Opened direct message thread with ${user.displayName}`, "info");
  };

  const creatorsToShow = friends.length > 0 ? friends.slice(0, 4) : suggestedUsers.slice(0, 4);
  const sectionTitle = friends.length > 0 ? "Your Network" : "Suggested Creators";

  return (
    <aside className="hidden xl:block w-[320px] shrink-0 space-y-4 select-none">
      {/* What's Buzzing / Trending Sparks Card */}
      <GlassCard className="p-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800" elevated>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Flame size={15} className="text-amber-500" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Trending Sparks
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-primary bg-blue-50 dark:bg-primary/10 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-primary/20">
            Realtime
          </span>
        </div>

        <div className="space-y-2.5">
          {DEFAULT_TRENDING_TOPICS.map((topic) => (
            <div
              key={topic.id}
              onClick={() => onNavigate("explore")}
              className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] cursor-pointer transition border border-transparent hover:border-slate-200 dark:hover:border-white/[0.06] group active:scale-[0.98]"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-500 mb-0.5">
                <span>{topic.category}</span>
                {topic.isHot && (
                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                    <Sparkles size={10} /> HOT
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-primary transition">
                {topic.tag}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                {topic.postCountFormatted}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onNavigate("explore")}
          className="w-full mt-3 pt-2 text-center text-xs font-semibold text-primary hover:text-primary-hover transition border-t border-slate-100 dark:border-white/[0.06] block"
        >
          View all trending sparks →
        </button>
      </GlassCard>

      {/* Suggested Creators / Friends in Network */}
      {creatorsToShow.length > 0 && (
        <GlassCard className="p-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <UserPlus size={15} className="text-primary" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                {sectionTitle}
              </h3>
            </div>
            <button
              onClick={() => onNavigate("friends")}
              className="text-[10px] text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition"
            >
              See all
            </button>
          </div>

          <div className="space-y-3">
            {creatorsToShow.map((user) => {
              const following = isFollowing(user.id);
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition"
                >
                  <div
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                    onClick={() => onSelectUser?.(user)}
                  >
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.displayName}
                      size="sm"
                      status={user.status}
                      isVerified={user.isVerified}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.displayName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 truncate">
                        @{user.username}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={following ? "secondary" : "primary"}
                    size="xs"
                    onClick={async () => {
                      await toggleFollow(user);
                      showToast(
                        following
                          ? `Unfollowed ${user.displayName}`
                          : `Now following ${user.displayName}!`,
                        "success"
                      );
                    }}
                    className="rounded-full px-3 text-[11px]"
                  >
                    {following ? "Following" : "Follow"}
                  </Button>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Active Pulse (Online Friends) */}
      {friends.length > 0 && (
        <GlassCard className="p-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 presence-dot" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Active Pulse
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-500">{friends.length} Connected</span>
          </div>

          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={friend.avatarUrl}
                    alt={friend.displayName}
                    size="xs"
                    status="online"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                      {friend.displayName}
                    </div>
                    <div className="text-[9px] text-emerald-600 dark:text-emerald-400">
                      Active on Spatial Feed
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleQuickMessage(friend)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-primary text-slate-600 dark:text-zinc-400 hover:text-white transition active:scale-95"
                  title={`Message ${friend.displayName}`}
                >
                  <MessageCircle size={13} />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Footer Legal & Info */}
      <div className="px-3 pt-2 text-[10px] text-slate-400 dark:text-zinc-600 space-y-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="hover:text-slate-600 dark:hover:text-zinc-400 cursor-pointer">Privacy</span>
          <span className="hover:text-slate-600 dark:hover:text-zinc-400 cursor-pointer">Terms</span>
          <span className="hover:text-slate-600 dark:hover:text-zinc-400 cursor-pointer">Security</span>
          <span className="hover:text-slate-600 dark:hover:text-zinc-400 cursor-pointer">Nexus Protocol</span>
        </div>
        <div>Nexus Spatial Social © 2026. All rights reserved.</div>
      </div>
    </aside>
  );
}
