"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../ui/Avatar";
import { GlassCard } from "../ui/GlassCard";
import {
  Image,
  Video,
  BarChart2,
  Sparkles,
  Smile,
  Globe,
  Code2,
} from "lucide-react";

interface PostComposerProps {
  onOpenModal: (initialType?: "media" | "poll" | "ai" | "code") => void;
}

export function PostComposer({ onOpenModal }: PostComposerProps) {
  const { currentUser } = useAuth();

  return (
    <GlassCard className="p-4 mb-5 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]" elevated>
      <div className="flex items-center gap-3">
        <Avatar
          src={currentUser.avatarUrl}
          alt={currentUser.displayName}
          size="md"
          status={currentUser.status}
        />

        {/* Input Trigger Bar */}
        <div
          onClick={() => onOpenModal()}
          className="flex-1 rounded-2xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.07] border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 px-4 py-3 cursor-pointer transition flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 group active:scale-[0.99]"
        >
          <span className="group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition truncate">
            What's igniting in your sphere, {currentUser.displayName.split(" ")[0]}?
          </span>
          <div className="flex items-center gap-1 text-[10px] text-primary font-mono font-semibold bg-blue-50 dark:bg-primary/10 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-primary/20">
            <Sparkles size={11} /> Spark
          </div>
        </div>
      </div>

      {/* Attachment Action Row */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between flex-wrap gap-2 select-none">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Photo/Video */}
          <button
            onClick={() => onOpenModal("media")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition active:scale-95"
          >
            <Image size={16} className="text-emerald-500" />
            <span className="hidden sm:inline">Photo/Video</span>
          </button>

          {/* Interactive Poll */}
          <button
            onClick={() => onOpenModal("poll")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition active:scale-95"
          >
            <BarChart2 size={16} className="text-amber-500" />
            <span className="hidden sm:inline">Poll</span>
          </button>

          {/* Code / Shader */}
          <button
            onClick={() => onOpenModal("code")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition active:scale-95"
          >
            <Code2 size={16} className="text-primary" />
            <span className="hidden sm:inline">Snippet</span>
          </button>

          {/* AI Assist */}
          <button
            onClick={() => onOpenModal("ai")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-primary hover:text-primary-hover hover:bg-blue-50 dark:hover:bg-primary/10 transition active:scale-95"
          >
            <Sparkles size={16} />
            <span className="hidden sm:inline">AI Prompt</span>
          </button>
        </div>

        <button
          onClick={() => onOpenModal()}
          className="ml-auto px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition"
        >
          Publish
        </button>
      </div>
    </GlassCard>
  );
}
