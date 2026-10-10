"use client";

import React from "react";
import { AppView } from "../../types";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { Home, Film, Compass, Plus, MessageSquare } from "lucide-react";

interface MobileBottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCreatePost: () => void;
}

export function MobileBottomNav({
  currentView,
  onNavigate,
  onOpenCreatePost,
}: MobileBottomNavProps) {
  const { unreadTotal } = useChat();
  const { currentUser } = useAuth();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 dark:bg-[var(--bg-app)]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/[0.08] px-2 py-2 flex items-center justify-around select-none">
      {/* Home Feed */}
      <button
        onClick={() => onNavigate("feed")}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition active:scale-95 ${
          currentView === "feed" ? "text-primary" : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <Home size={19} />
        <span className="text-[9px] font-semibold mt-0.5">Home</span>
      </button>

      {/* Reels */}
      <button
        onClick={() => onNavigate("reels")}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition active:scale-95 ${
          currentView === "reels" ? "text-primary font-bold" : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <Film size={19} />
        <span className="text-[9px] font-semibold mt-0.5">Reels</span>
      </button>

      {/* Center Create Spark Button */}
      <button
        onClick={onOpenCreatePost}
        className="relative -top-2.5 grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition flex-shrink-0"
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>

      {/* Messages */}
      <button
        onClick={() => onNavigate("messages")}
        className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition active:scale-95 ${
          currentView === "messages" ? "text-primary" : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <MessageSquare size={19} />
        {unreadTotal > 0 && (
          <span className="absolute top-1 right-1.5 h-3.5 w-3.5 rounded-full bg-primary text-white text-[8px] font-bold grid place-items-center shadow-xs">
            {unreadTotal}
          </span>
        )}
        <span className="text-[9px] font-semibold mt-0.5">DMs</span>
      </button>

      {/* Profile */}
      <button
        onClick={() => onNavigate("profile")}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition active:scale-95 ${
          currentView === "profile" ? "text-primary" : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <div className="relative">
          <img
            src={currentUser.avatarUrl}
            alt=""
            className={`h-4.5 w-4.5 rounded-full object-cover ${
              currentView === "profile" ? "ring-2 ring-primary" : ""
            }`}
          />
        </div>
        <span className="text-[9px] font-semibold mt-0.5">Profile</span>
      </button>
    </div>
  );
}
