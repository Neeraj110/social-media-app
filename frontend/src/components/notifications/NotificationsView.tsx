"use client";

import React, { useState } from "react";
import { Notification, NotificationType, User, AppView } from "../../types";
import { useNotifications } from "../../context/NotificationContext";
import { useSocial } from "../../context/SocialContext";
import { useToast } from "../../context/ToastContext";
import { GlassCard } from "../ui/GlassCard";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  AtSign,
  Shield,
  CheckCheck,
  Trash2,
  Check,
  X,
} from "lucide-react";

interface NotificationsViewProps {
  onNavigate: (view: AppView) => void;
  onSelectUser: (user: User) => void;
}

export function NotificationsView({
  onNavigate,
  onSelectUser,
}: NotificationsViewProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
  } = useNotifications();

  const { acceptFriendRequest, declineFriendRequest } = useSocial();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "reaction" | "comment" | "friend_request" | "system"
  >("all");

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === "unread") return !notif.isRead;
    if (activeFilter === "reaction") return notif.type === "reaction";
    if (activeFilter === "comment")
      return notif.type === "comment" || notif.type === "reply";
    if (activeFilter === "friend_request") return notif.type === "friend_request";
    if (activeFilter === "system") return notif.type === "system";
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "reaction":
        return (
          <div className="grid h-7 w-7 place-items-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25">
            <Heart size={14} className="fill-rose-400" />
          </div>
        );
      case "comment":
      case "reply":
        return (
          <div className="grid h-7 w-7 place-items-center rounded-xl bg-primary/15 text-primary border border-primary/25">
            <MessageSquare size={14} />
          </div>
        );
      case "friend_request":
      case "follow":
        return (
          <div className="grid h-7 w-7 place-items-center rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/25">
            <UserPlus size={14} />
          </div>
        );
      case "mention":
        return (
          <div className="grid h-7 w-7 place-items-center rounded-xl bg-primary/15 text-primary border border-primary/25">
            <AtSign size={14} />
          </div>
        );
      case "system":
      default:
        return (
          <div className="grid h-7 w-7 place-items-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <Shield size={14} />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-8 select-none">
      {/* Header Card */}
      <GlassCard className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]" elevated>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 dark:bg-primary/15 text-primary border border-blue-200 dark:border-primary/25 shadow-xs">
                <Bell size={16} />
              </div>
              <h1 className="font-display font-black text-xl text-slate-900 dark:text-white">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-mono font-black shadow-xs">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Real-time activity on your sparks, reactions, mentions, and friend requests.
            </p>
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
                className="rounded-xl text-xs font-bold gap-1.5 active:scale-95"
              >
                <CheckCheck size={14} className="text-primary" />
                Mark all read
              </Button>
            )}

            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="rounded-xl text-xs text-slate-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 active:scale-95"
              >
                <Trash2 size={14} />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-5 border-t border-slate-100 dark:border-white/[0.06] mt-5 overflow-x-auto hide-scroll">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 active:scale-95 ${
              activeFilter === "all"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Activity
          </button>

          <button
            onClick={() => setActiveFilter("unread")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeFilter === "unread"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter("reaction")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 active:scale-95 ${
              activeFilter === "reaction"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Reactions
          </button>

          <button
            onClick={() => setActiveFilter("comment")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 active:scale-95 ${
              activeFilter === "comment"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Comments & Replies
          </button>

          <button
            onClick={() => setActiveFilter("friend_request")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 active:scale-95 ${
              activeFilter === "friend_request"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Friend Requests
          </button>

          <button
            onClick={() => setActiveFilter("system")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 active:scale-95 ${
              activeFilter === "system"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            System & AI
          </button>
        </div>
      </GlassCard>

      {/* Notifications Stream */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={24} />}
            title="All caught up!"
            description="You don't have any notifications in this category right now."
          />
        ) : (
          filteredNotifications.map((notif) => (
            <GlassCard
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-4 flex items-start justify-between gap-4 transition border ${
                !notif.isRead
                  ? "bg-blue-50/40 dark:bg-zinc-900/90 border-blue-200 dark:border-primary/30 shadow-xs"
                  : "bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Icon or Actor Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  {notif.actor ? (
                    <div
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectUser(notif.actor!);
                      }}
                    >
                      <Avatar
                        src={notif.actor.avatarUrl}
                        alt={notif.actor.displayName}
                        size="md"
                        status={notif.actor.status}
                      />
                      <div className="absolute -bottom-1 -right-1">
                        {getNotificationIcon(notif.type)}
                      </div>
                    </div>
                  ) : (
                    getNotificationIcon(notif.type)
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 space-y-1">
                  <div className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {notif.actor && (
                      <strong
                        className="text-slate-900 dark:text-white hover:text-primary transition cursor-pointer mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUser(notif.actor!);
                        }}
                      >
                        {notif.actor.displayName}
                      </strong>
                    )}
                    <span>{notif.message}</span>
                  </div>

                  {/* Quoted target preview if present */}
                  {notif.actionData?.snippet && (
                    <div className="text-[11px] text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-1.5 max-w-lg truncate font-mono">
                      &quot;{notif.actionData.snippet}&quot;
                    </div>
                  )}

                  {/* Inline Friend Request action buttons */}
                  {notif.type === "friend_request" && notif.actor && (
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptFriendRequest(notif.actor!.id);
                          markAsRead(notif.id);
                          showToast(`Accepted friend request from @${notif.actor!.username}`, "success");
                        }}
                        className="rounded-xl text-xs font-bold gap-1 shadow-xs"
                      >
                        <Check size={12} />
                        Confirm
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          declineFriendRequest(notif.actor!.id);
                          markAsRead(notif.id);
                          showToast("Friend request declined", "info");
                        }}
                        className="rounded-xl text-xs text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                      >
                        <X size={12} />
                        Decline
                      </Button>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{notif.createdAt}</div>
                </div>
              </div>

              {/* Right Indicator / Delete */}
              <div className="flex items-center gap-2 shrink-0">
                {!notif.isRead && (
                  <span className="h-2 w-2 rounded-full bg-primary shadow-xs animate-pulse" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="text-slate-400 hover:text-rose-500 dark:text-zinc-600 dark:hover:text-rose-400 p-1 transition"
                  title="Remove"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
