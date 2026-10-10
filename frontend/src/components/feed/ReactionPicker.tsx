"use client";

import React, { useState } from "react";
import { ReactionType } from "../../types";

interface ReactionPickerProps {
  currentReaction?: ReactionType;
  onSelectReaction: (type: ReactionType) => void;
  className?: string;
}

export const REACTION_CONFIG: Record<
  ReactionType,
  { label: string; emoji: string; color: string; bg: string }
> = {
  like: {
    label: "Like",
    emoji: "👍",
    color: "text-blue-600 dark:text-blue-400",
    bg: "hover:bg-blue-50 dark:hover:bg-blue-500/20",
  },
  love: {
    label: "Love",
    emoji: "❤️",
    color: "text-rose-600 dark:text-rose-500",
    bg: "hover:bg-rose-50 dark:hover:bg-rose-500/20",
  },
  haha: {
    label: "Haha",
    emoji: "😆",
    color: "text-amber-500 dark:text-amber-400",
    bg: "hover:bg-amber-50 dark:hover:bg-amber-500/20",
  },
  wow: {
    label: "Wow",
    emoji: "😮",
    color: "text-amber-500 dark:text-amber-300",
    bg: "hover:bg-amber-50 dark:hover:bg-amber-400/20",
  },
  sad: {
    label: "Sad",
    emoji: "😢",
    color: "text-teal-600 dark:text-teal-400",
    bg: "hover:bg-teal-50 dark:hover:bg-indigo-500/20",
  },
  angry: {
    label: "Angry",
    emoji: "😡",
    color: "text-orange-600 dark:text-orange-500",
    bg: "hover:bg-orange-50 dark:hover:bg-orange-500/20",
  },
};

const REACTIONS: ReactionType[] = ["like", "love", "haha", "wow", "sad", "angry"];

export function ReactionPicker({
  currentReaction,
  onSelectReaction,
  className = "",
}: ReactionPickerProps) {
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);

  return (
    <div
      className={`flex items-center gap-1.5 p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-white/15 shadow-2xl animate-in zoom-in-90 fade-in duration-200 select-none ${className}`}
    >
      {REACTIONS.map((type) => {
        const config = REACTION_CONFIG[type];
        const isSelected = currentReaction === type;
        const isHovered = hoveredReaction === type;

        return (
          <button
            key={type}
            type="button"
            onMouseEnter={() => setHoveredReaction(type)}
            onMouseLeave={() => setHoveredReaction(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectReaction(type);
            }}
            className={`relative flex flex-col items-center justify-center h-10 w-10 rounded-full transition-all duration-200 transform ${
              isHovered
                ? "scale-135 -translate-y-2 z-20 shadow-lg"
                : isSelected
                ? "scale-110 bg-slate-100 dark:bg-white/10"
                : "hover:scale-120 opacity-90 hover:opacity-100"
            }`}
          >
            {/* Tooltip on hover */}
            {isHovered && (
              <span className="absolute -top-7 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-wide shadow-md whitespace-nowrap animate-in fade-in zoom-in-75 duration-150 pointer-events-none">
                {config.label}
              </span>
            )}

            <span className="text-2xl filter drop-shadow-xs leading-none">
              {config.emoji}
            </span>
          </button>
        );
      })}
    </div>
  );
}
