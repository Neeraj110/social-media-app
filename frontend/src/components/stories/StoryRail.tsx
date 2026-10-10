"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useStory } from "../../context/StoryContext";
import { useAuth } from "../../context/AuthContext";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface StoryRailProps {
  onOpenCreateStory?: () => void;
}

export function StoryRail({ onOpenCreateStory }: StoryRailProps) {
  const { stories, openStoryViewer, openCreateStory } = useStory();
  const { currentUser } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCreate = onOpenCreateStory || openCreateStory;

  const handleScroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -240 : 240,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative mb-5 select-none group/rail">
      {/* Scroll Arrows on Desktop */}
      <button
        onClick={() => handleScroll("left")}
        className="hidden md:grid absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-7 w-7 place-items-center rounded-full bg-white dark:bg-black/80 text-slate-700 dark:text-white border border-slate-200/80 dark:border-white/10 opacity-0 group-hover/rail:opacity-100 transition shadow-md"
      >
        <ChevronLeft size={16} />
      </button>

      <button
        onClick={() => handleScroll("right")}
        className="hidden md:grid absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-7 w-7 place-items-center rounded-full bg-white dark:bg-black/80 text-slate-700 dark:text-white border border-slate-200/80 dark:border-white/10 opacity-0 group-hover/rail:opacity-100 transition shadow-md"
      >
        <ChevronRight size={16} />
      </button>

      {/* Horizontal Stories Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto hide-scroll py-2 px-1"
      >
        {/* Create Your Story Card */}
        <div
          onClick={handleCreate}
          className="relative flex-shrink-0 w-24 h-36 rounded-2xl overflow-hidden cursor-pointer group border border-slate-200/80 dark:border-white/[0.08] hover:border-primary/50 transition duration-300 bg-white dark:bg-[var(--bg-panel)] shadow-xs active:scale-95"
        >
          {/* Top Half user avatar background */}
          <div className="h-24 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
            {currentUser.avatarUrl ? (
              <Image
                src={currentUser.avatarUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100px, 100px"
                className="object-cover group-hover:scale-105 transition duration-500 opacity-80"
              />
            ) : null}
          </div>

          {/* Plus icon badge */}
          <div className="absolute top-[82px] left-1/2 -translate-x-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full bg-primary text-white border-2 border-white dark:border-[var(--bg-panel)] shadow-sm group-hover:scale-110 transition">
            <Plus size={16} strokeWidth={2.5} />
          </div>

          {/* Bottom text */}
          <div className="absolute bottom-1.5 inset-x-0 text-center">
            <span className="text-[10px] font-bold text-slate-800 dark:text-white tracking-tight">
              Add Spark
            </span>
          </div>
        </div>

        {/* Existing User Stories */}
        {stories.map((group) => {
          const coverStory = group.stories[0];
          const hasUnseen = group.hasUnseen;

          return (
            <div
              key={group.id}
              onClick={() => openStoryViewer(group.id)}
              className="relative flex-shrink-0 w-24 h-36 rounded-2xl overflow-hidden cursor-pointer group border border-slate-200/80 dark:border-white/[0.08] hover:border-primary/50 transition duration-300 shadow-sm active:scale-95"
            >
              {/* Story preview image */}
              <Image
                src={coverStory.mediaUrl}
                alt={group.user.displayName}
                fill
                sizes="(max-width: 768px) 100px, 100px"
                className="object-cover group-hover:scale-105 transition duration-500 brightness-95 group-hover:brightness-100"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

              {/* Top Avatar with Gradient Ring */}
              <div className="absolute top-2 left-2">
                <div
                  className={`p-0.5 rounded-full ${
                    hasUnseen
                      ? "bg-primary ring-2 ring-primary/40 shadow-sm"
                      : "bg-white/20"
                  }`}
                >
                  <Image
                    src={group.user.avatarUrl}
                    alt=""
                    width={28}
                    height={28}
                      className="h-7 w-7 rounded-full object-cover border border-black"
                  />
                </div>
              </div>

              {/* Bottom user name */}
              <div className="absolute bottom-2 inset-x-2">
                <p className="text-[10px] font-bold text-white truncate shadow-sm">
                  {group.user.displayName.split(" ")[0]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
