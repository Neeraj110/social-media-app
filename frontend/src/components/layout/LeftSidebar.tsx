"use client";

import React, { useState } from "react";
import { AppView } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNotification } from "../../context/NotificationContext";
import { useChat } from "../../context/ChatContext";
import { Avatar } from "../ui/Avatar";
import {
  Home,
  Search,
  Compass,
  Film,
  MessageSquare,
  Heart,
  Sparkles,
  Users,
  Bookmark,
  Plus,
  Settings,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";

interface LeftSidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCreatePost: () => void;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

export function LeftSidebar({
  currentView,
  onNavigate,
  onOpenCreatePost,
}: LeftSidebarProps) {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();
  const { unreadTotal } = useChat();

  const [isHovered, setIsHovered] = useState(false);

  const navItems: {
    id: AppView | "search" | "create";
    label: string;
    icon: (active: boolean) => React.ReactNode;
    badge?: number;
    action?: () => void;
  }[] = [
    {
      id: "feed",
      label: "Home",
      icon: (active) => <Home size={24} strokeWidth={active ? 2.6 : 1.9} />,
      action: () => onNavigate("feed"),
    },
    {
      id: "search",
      label: "Search",
      icon: (active) => <Search size={24} strokeWidth={active ? 2.6 : 1.9} />,
      action: () => onNavigate("explore"),
    },
    {
      id: "explore",
      label: "Explore",
      icon: (active) => <Compass size={24} strokeWidth={active ? 2.6 : 1.9} />,
      action: () => onNavigate("explore"),
    },
    {
      id: "reels",
      label: "Reels",
      icon: (active) => <Film size={24} strokeWidth={active ? 2.6 : 1.9} />,
      action: () => onNavigate("reels"),
    },
    {
      id: "messages",
      label: "Messages",
      icon: (active) => <MessageSquare size={24} strokeWidth={active ? 2.6 : 1.9} />,
      badge: unreadTotal > 0 ? unreadTotal : undefined,
      action: () => onNavigate("messages"),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (active) => <Heart size={24} strokeWidth={active ? 2.6 : 1.9} className={active ? "fill-rose-500 text-rose-500" : ""} />,
      badge: unreadCount > 0 ? unreadCount : undefined,
      action: () => onNavigate("notifications"),
    },
    {
      id: "create",
      label: "Create",
      icon: () => (
        <div className="grid h-6 w-6 place-items-center rounded-lg border-2 border-current">
          <Plus size={16} strokeWidth={3} />
        </div>
      ),
      action: onOpenCreatePost,
    },
    {
      id: "copilot",
      label: "AI Copilot",
      icon: (active) => <Sparkles size={24} strokeWidth={active ? 2.6 : 1.9} className={active ? "text-primary" : ""} />,
      action: () => onNavigate("copilot"),
    },
    {
      id: "friends",
      label: "Community",
      icon: (active) => <Users size={24} strokeWidth={active ? 2.6 : 1.9} />,
      action: () => onNavigate("friends"),
    },
    {
      id: "saved",
      label: "Saved",
      icon: (active) => <Bookmark size={24} strokeWidth={active ? 2.6 : 1.9} />,
      action: () => onNavigate("saved"),
    },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden lg:flex fixed left-0 top-0 bottom-0 flex-col border-r border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#000000] py-5 z-50 select-none transition-all duration-300 ease-in-out ${
        isHovered
          ? "w-[245px] px-3.5 shadow-2xl shadow-black/25 dark:shadow-black/70"
          : "w-[72px] px-2"
      }`}
    >
      {/* Brand Logo Header */}
      <div
        onClick={() => onNavigate("feed")}
        className={`flex items-center h-12 mb-6 cursor-pointer group transition-all ${
          isHovered ? "px-3 gap-3" : "justify-center"
        }`}
        title="Nexus Home"
      >
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-primary to-purple-600 text-white font-bold text-lg shadow-md group-hover:scale-105 transition flex-shrink-0">
          N
        </div>
        {isHovered && (
          <div className="flex flex-col overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-none">
              Nexus
            </span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold tracking-wider uppercase mt-0.5">
              Social Network
            </span>
          </div>
        )}
      </div>

      {/* Main Navigation Stack */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden hide-scroll">
        {navItems.map((item) => {
          const isActive =
            item.id === "search"
              ? false
              : item.id === "create"
              ? false
              : currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={item.action}
              title={!isHovered ? item.label : undefined}
              className={`relative flex items-center rounded-xl transition-all duration-200 group active:scale-95 ${
                isHovered
                  ? "w-full px-3.5 py-3 gap-4"
                  : "w-12 h-12 mx-auto justify-center"
              } ${
                isActive
                  ? "bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white font-bold"
                  : "text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06]"
              }`}
            >
              {/* Icon Container with Badge */}
              <div className="relative flex-shrink-0 grid place-items-center">
                <span
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-primary dark:text-white" : ""
                  }`}
                >
                  {item.icon(isActive)}
                </span>

                {/* Badge for Collapsed State */}
                {!isHovered && item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-black" />
                )}
              </div>

              {/* Text Label & Badge for Hovered State */}
              {isHovered && (
                <div className="flex flex-1 items-center justify-between min-w-0 animate-in fade-in duration-200 overflow-hidden">
                  <span
                    className={`text-sm tracking-tight truncate ${
                      isActive ? "font-bold text-slate-900 dark:text-white" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* User Profile Navigation Item */}
        <button
          onClick={() => onNavigate("profile")}
          title={!isHovered ? "Profile" : undefined}
          className={`relative flex items-center rounded-xl transition-all duration-200 group active:scale-95 ${
            isHovered
              ? "w-full px-3.5 py-3 gap-4"
              : "w-12 h-12 mx-auto justify-center"
          } ${
            currentView === "profile"
              ? "bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white font-bold"
              : "text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06]"
          }`}
        >
          <div className="relative flex-shrink-0">
            <Avatar
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              size="sm"
              status={currentUser.status}
              isVerified={currentUser.isVerified}
              className={currentView === "profile" ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-black" : ""}
            />
          </div>

          {isHovered && (
            <div className="flex flex-1 flex-col items-start min-w-0 text-left overflow-hidden animate-in fade-in duration-200">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate w-full">
                {currentUser.displayName}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate w-full">
                @{currentUser.username}
              </span>
            </div>
          )}
        </button>
      </nav>

      {/* Bottom Utility Actions (Theme Toggle & Settings) */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] space-y-1">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={!isHovered ? `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode` : undefined}
          className={`flex items-center rounded-xl transition-all duration-200 group active:scale-95 ${
            isHovered
              ? "w-full px-3.5 py-2.5 gap-4"
              : "w-12 h-12 mx-auto justify-center"
          } text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06]`}
        >
          <div className="flex-shrink-0 grid place-items-center">
            {theme === "dark" ? (
              <Sun size={22} className="text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={22} className="text-primary group-hover:-rotate-12 transition-transform" />
            )}
          </div>
          {isHovered && (
            <span className="text-sm font-medium tracking-tight animate-in fade-in duration-200 whitespace-nowrap">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => onNavigate("settings")}
          title={!isHovered ? "Settings" : undefined}
          className={`flex items-center rounded-xl transition-all duration-200 group active:scale-95 ${
            isHovered
              ? "w-full px-3.5 py-2.5 gap-4"
              : "w-12 h-12 mx-auto justify-center"
          } ${
            currentView === "settings"
              ? "bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white font-bold"
              : "text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06]"
          }`}
        >
          <div className="flex-shrink-0 grid place-items-center">
            <Settings size={22} className="group-hover:rotate-45 transition-transform duration-300" />
          </div>
          {isHovered && (
            <span className="text-sm font-medium tracking-tight animate-in fade-in duration-200 whitespace-nowrap">
              Settings
            </span>
          )}
        </button>

        {/* Log Out */}
        {isHovered && (
          <button
            onClick={logout}
            className="flex items-center w-full px-3.5 py-2 gap-4 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95 animate-in fade-in duration-200"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className="text-sm font-medium tracking-tight whitespace-nowrap">
              Log Out
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
