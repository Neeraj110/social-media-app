"use client";

import React, { useState } from "react";
import { User, AppView, Post } from "../../types";
import { usePosts } from "../../context/PostContext";
import { useToast } from "../../context/ToastContext";
import { GlassCard } from "../ui/GlassCard";
import { PostCard } from "../feed/PostCard";
import { EmptyState } from "../ui/EmptyState";
import {
  Bookmark,
  Search,
  FolderPlus,
  LayoutGrid,
  List,
  Sparkles,
  Share2,
  Trash2,
} from "lucide-react";

interface BookmarksViewProps {
  onNavigate: (view: AppView) => void;
  onSelectUser: (user: User) => void;
  onOpenReport?: (user: User) => void;
}

const COLLECTIONS = [
  { id: "all", label: "All Saved Sparks" },
  { id: "spatial", label: "Spatial UI" },
  { id: "code", label: "Code & Shaders" },
  { id: "inspiration", label: "Design Systems" },
];

export function BookmarksView({
  onNavigate,
  onSelectUser,
  onOpenReport,
}: BookmarksViewProps) {
  const { savedPosts } = usePosts();
  const { showToast } = useToast();

  const [activeCollection, setActiveCollection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = savedPosts.filter(
    (p) =>
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 lg:pb-8 select-none">
      {/* Header Card */}
      <GlassCard className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]" elevated>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 dark:bg-primary/15 text-primary border border-blue-200 dark:border-primary/25 shadow-xs">
                <Bookmark size={16} />
              </div>
              Saved Sparks & Collections
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Your private sanctuary of saved thoughts, code snippets, and inspirations.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative sm:w-72">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in saved..."
              className="w-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
            />
          </div>
        </div>

        {/* Collection Filter Folders */}
        <div className="flex items-center gap-2 pt-5 border-t border-slate-100 dark:border-white/[0.06] mt-5 overflow-x-auto hide-scroll">
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              onClick={() => setActiveCollection(col.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
                activeCollection === col.id
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{col.label}</span>
              {col.id === "all" && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 font-mono">
                  {savedPosts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Bookmarked Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <EmptyState
            icon={<Bookmark size={24} />}
            title="No saved sparks in this collection"
            description="Click the bookmark icon on any post across Nexus to save it for quick reference."
          />
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onSelectUser={onSelectUser}
              onOpenReport={(p: Post) => onOpenReport?.(p.author)}
            />
          ))
        )}
      </div>
    </div>
  );
}
