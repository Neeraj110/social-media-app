"use client";

import React, { useRef } from "react";
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
    <div className="relative mb-6 select-none group/rail py-3 px-3 rounded-2xl bg-white dark:bg-[#000000] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
      {/* Scroll Arrows on Desktop */}
      <button
        onClick={() => handleScroll("left")}
        className="hidden md:grid absolute -left-2 top-8 -translate-y-1/2 z-20 h-7 w-7 place-items-center rounded-full bg-white dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 opacity-0 group-hover/rail:opacity-100 transition shadow-lg active:scale-90"
        title="Scroll left"
      >
        <ChevronLeft size={16} />
      </button>

      <button
        onClick={() => handleScroll("right")}
        className="hidden md:grid absolute -right-2 top-8 -translate-y-1/2 z-20 h-7 w-7 place-items-center rounded-full bg-white dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 opacity-0 group-hover/rail:opacity-100 transition shadow-lg active:scale-90"
        title="Scroll right"
      >
        <ChevronRight size={16} />
      </button>

      {/* Horizontal Stories Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto hide-scroll py-2 px-1"
      >
        {/* Create Your Story Card (Instagram circular style) */}
        <div
          onClick={handleCreate}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group select-none"
        >
          <div className="relative p-[2.5px] rounded-full">
            <div className="h-16 w-16 sm:h-[66px] sm:w-[66px] rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-[var(--bg-app)]">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="w-full h-full grid place-items-center font-bold text-slate-500">
                  {currentUser.displayName?.[0] || "U"}
                </div>
              )}
            </div>
            {/* Plus icon badge on bottom right */}
            <div className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full bg-primary text-white border-2 border-white dark:border-[var(--bg-app)] shadow-sm group-hover:scale-110 transition">
              <Plus size={12} strokeWidth={3} />
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 max-w-[72px] truncate text-center">
            Your story
          </span>
        </div>

        {/* Existing User Stories */}
        {stories.map((group) => {
          const hasUnseen = group.hasUnseen;

          return (
            <div
              key={group.id}
              onClick={() => openStoryViewer(group.id)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group select-none"
            >
              <div
                className={`p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-105 ${
                  hasUnseen
                    ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-sm"
                    : "bg-slate-300 dark:bg-zinc-700"
                }`}
              >
                <div className="h-16 w-16 sm:h-[66px] sm:w-[66px] rounded-full overflow-hidden border-2 border-white dark:border-[var(--bg-app)] bg-slate-100 dark:bg-zinc-800">
                  <img
                    src={group.user.avatarUrl || "https://i.pravatar.cc/100"}
                    alt={group.user.displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              </div>

              {/* Bottom user name */}
              <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 max-w-[74px] truncate text-center">
                {group.user.username || group.user.displayName.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
