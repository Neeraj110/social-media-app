"use client";

import React from "react";
import { AppView } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { useChat } from "../../context/ChatContext";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import {
  Home,
  Film,
  Compass,
  MessageSquare,
  Users,
  Bot,
  Bookmark,
  Bell,
  Settings,
  Plus,
} from "lucide-react";

interface LeftSidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCreatePost: () => void;
}

export function LeftSidebar({
  currentView,
  onNavigate,
  onOpenCreatePost,
}: LeftSidebarProps) {
  const { currentUser } = useAuth();
  const { unreadCount } = useNotification();
  const { unreadTotal } = useChat();

  const primaryNav: {
    id: AppView;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: "feed", label: "Feed", icon: <Home size={18} /> },
    { id: "reels", label: "Reels", icon: <Film size={18} /> },
    { id: "explore", label: "Explore", icon: <Compass size={18} /> },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageSquare size={18} />,
      badge: unreadTotal > 0 ? unreadTotal : undefined,
    },
    { id: "friends", label: "Community", icon: <Users size={18} /> },
    { id: "copilot", label: "AI Copilot", icon: <Bot size={18} /> },
    { id: "saved", label: "Saved", icon: <Bookmark size={18} /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell size={18} />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] flex-col border-r border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[var(--bg-app)] px-4 py-5 z-40 overflow-y-auto hide-scroll select-none">
      {/* Nexus Logo Brand */}
      <div
        className="flex items-center gap-3 px-2 mb-8 cursor-pointer group"
        onClick={() => onNavigate("feed")}
      >
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display font-black text-white text-base shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
          N
        </div>
        <div>
          <div className="font-display font-black text-base text-slate-900 dark:text-white tracking-tight leading-none">
            Nexus
          </div>
          <div className="text-[10px] font-semibold text-primary tracking-wider uppercase mt-1">
            Spatial OS v3.2
          </div>
        </div>
      </div>

      {/* Main Navigation Stack */}
      <nav className="space-y-1">
        {primaryNav.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? "bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-white shadow-xs border border-blue-200/80 dark:border-primary/30"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={
                    isActive
                      ? "text-primary"
                      : "text-slate-400 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white"
                  }
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Create Post Action Button */}
      <div className="my-6">
        <Button
          variant="primary"
          size="md"
          onClick={onOpenCreatePost}
          className="w-full py-3 rounded-2xl shadow-md text-xs font-bold gap-2 active:scale-95"
        >
          <Plus size={16} />
          Create New Spark
        </Button>
      </div>

      {/* Pinned Communities Section */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center justify-between px-2 mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          <span>Pinned Communities</span>
          <span className="text-primary hover:underline cursor-pointer">
            Explore
          </span>
        </div>
        <div className="space-y-1">
          {[
            { name: "Spatial Computing", count: "14.2k nodes" },
            { name: "Design Systems", count: "8.9k nodes" },
            { name: "Generative UI", count: "11.4k nodes" },
            { name: "WebGPU & Shaders", count: "6.1k nodes" },
          ].map((comm, i) => (
            <div
              key={comm.name}
              onClick={() => onNavigate("explore")}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-pointer transition active:scale-[0.98]"
            >
              <div className="grid h-6 w-6 place-items-center rounded-lg bg-blue-50 dark:bg-zinc-800 text-[10px] font-mono font-bold text-primary border border-blue-200/60 dark:border-white/10">
                #{i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-300 truncate">
                  {comm.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-500">{comm.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-1">
        <button
          onClick={() => onNavigate("settings")}
          className={`flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
            currentView === "settings"
              ? "bg-blue-50 dark:bg-[var(--bg-raised)] text-blue-600 dark:text-white"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
          }`}
        >
          <Settings size={16} />
          Settings
        </button>

        {/* Mini Profile Card */}
        <div
          onClick={() => onNavigate("profile")}
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/[0.05] cursor-pointer transition border border-transparent hover:border-slate-200 dark:hover:border-white/10 mt-2"
        >
          <Avatar
            src={currentUser.avatarUrl}
            alt={currentUser.displayName}
            size="sm"
            status={currentUser.status}
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {currentUser.displayName}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-500 truncate">
              @{currentUser.username}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
