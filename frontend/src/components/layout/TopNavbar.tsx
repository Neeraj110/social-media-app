"use client";

import React, { useState, useRef, useEffect } from "react";
import { AppView } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNotification } from "../../context/NotificationContext";
import { useChat } from "../../context/ChatContext";
import { Avatar } from "../ui/Avatar";
import {
  Search,
  Sparkles,
  Bell,
  Sun,
  Moon,
  Bookmark,
  Settings,
  LogOut,
  UserCheck,
  ChevronDown,
  Bot,
  MessageSquare,
  Home,
  Compass,
} from "lucide-react";

interface TopNavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCreatePost: () => void;
  onSearchFocus?: () => void;
}

export function TopNavbar({
  currentView,
  onNavigate,
  onOpenCreatePost,
  onSearchFocus,
}: TopNavbarProps) {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();
  const { unreadTotal } = useChat();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems: { view: AppView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { view: "feed", label: "Home", icon: <Home size={16} /> },
    { view: "explore", label: "Explore", icon: <Compass size={16} /> },
    {
      view: "messages",
      label: "Messages",
      icon: <MessageSquare size={16} />,
      badge: unreadTotal > 0 ? unreadTotal : undefined,
    },
    { view: "copilot", label: "AI Copilot", icon: <Bot size={16} /> },
    {
      view: "notifications",
      label: "Alerts",
      icon: <Bell size={16} />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] bg-white/85 dark:bg-zinc-950/85 px-4 backdrop-blur-xl transition-all duration-300 lg:left-[260px] lg:px-8 select-none">
      {/* Mobile Branding */}
      <div
        className="flex items-center gap-2.5 lg:hidden cursor-pointer group"
        onClick={() => onNavigate("feed")}
      >
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-white font-display font-black text-sm shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105 active:scale-95">
          N
        </div>
        <span className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-white">
          Nexus
        </span>
      </div>

      {/* Global Search Omnibox */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            onClick={onSearchFocus}
            type="text"
            placeholder="Search creators, #tags, sparks (Press ⌘K)..."
            className="w-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700 rounded-full pl-10 pr-12 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white focus:outline-none transition"
          />
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded bg-white dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-600 shadow-xs pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Desktop Horizontal Fast Nav */}
      <nav className="hidden xl:flex items-center gap-1.5">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                isActive
                  ? "bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right User Actions & Switchers */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 transition shadow-xs active:scale-95"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? (
            <Sun size={15} className="text-amber-400" />
          ) : (
            <Moon size={15} className="text-primary" />
          )}
        </button>

        {/* Quick AI Trigger */}
        <button
          onClick={() => onNavigate("copilot")}
          className="relative grid h-9 w-9 place-items-center rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-primary/15 dark:hover:bg-primary/25 border border-blue-200 dark:border-primary/30 text-primary transition shadow-xs active:scale-95"
          title="Launch Nexus Copilot"
        >
          <Sparkles size={16} />
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => onNavigate("notifications")}
          className="relative grid h-9 w-9 place-items-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 transition active:scale-95"
          title="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse ring-2 ring-white" />
          )}
        </button>

        {/* User Avatar & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.04] transition active:scale-95"
          >
            <Avatar
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              size="sm"
              status={currentUser.status}
              isVerified={currentUser.isVerified}
            />
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Popover */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl p-2 shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150 z-50">
              {/* User Header */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer"
                onClick={() => {
                  onNavigate("profile");
                  setIsMenuOpen(false);
                }}
              >
                <Avatar
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  size="md"
                  status={currentUser.status}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                    @{currentUser.username}
                  </div>
                </div>
              </div>

              <div className="my-1.5 border-t border-slate-100 dark:border-zinc-800" />

              {/* Navigation Links */}
              <button
                onClick={() => {
                  onNavigate("profile");
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                <UserCheck size={15} className="text-slate-400" />
                View Profile
              </button>

              <button
                onClick={() => {
                  onNavigate("saved");
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                <Bookmark size={15} className="text-slate-400" />
                Saved Bookmarks
              </button>

              <button
                onClick={() => {
                  onNavigate("settings");
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                <Settings size={15} className="text-slate-400" />
                Settings & Privacy
              </button>

              <div className="my-1.5 border-t border-slate-100 dark:border-zinc-800" />

              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition"
              >
                <LogOut size={15} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
