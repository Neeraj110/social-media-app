"use client";

import React, { useState } from "react";
import { User, AppView } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useSocial } from "../../context/SocialContext";
import { useChat } from "../../context/ChatContext";
import { useToast } from "../../context/ToastContext";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { EditProfileModal } from "./EditProfileModal";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Sparkles,
  UserPlus,
  UserCheck,
  MessageSquare,
  Edit3,
  Share2,
  MoreHorizontal,
  ShieldAlert,
  Ban,
  Settings,
} from "lucide-react";

interface ProfileHeaderProps {
  user: User;
  onNavigate?: (view: AppView) => void;
  onOpenReport?: (user: User) => void;
  onOpenBlock?: (user: User) => void;
  onStartChat?: (user?: User) => void;
  onEditProfile?: () => void;
}

export function ProfileHeader({
  user,
  onNavigate,
  onOpenReport,
  onOpenBlock,
  onStartChat,
  onEditProfile,
}: ProfileHeaderProps) {
  const { currentUser } = useAuth();
  const {
    isFollowing,
    followUser,
    unfollowUser,
    getFriendshipStatus,
    sendFriendRequest,
    removeFriend,
  } = useSocial();
  const { startNewConversation, selectConversation } = useChat();
  const { showToast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const isMe = currentUser.id === user.id;
  const following = isFollowing(user.id);
  const friendshipStatus = getFriendshipStatus(user.id);

  const handleMessage = async () => {
    try {
      const convId = await startNewConversation(user);
      selectConversation(convId);
      if (onStartChat) {
        onStartChat(user);
      } else {
        onNavigate?.("messages");
      }
    } catch {
      showToast("Unable to start conversation", "error");
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast(`Copied @${user.username}'s profile link`, "success");
  };

  const handleFriendshipAction = async () => {
    if (friendshipStatus === "none") {
      try {
        await sendFriendRequest(user);
        showToast(`Sent friend request to @${user.username}`, "success");
      } catch {
        showToast("Unable to send friend request", "error");
      }
    } else if (friendshipStatus === "friends") {
      try {
        await removeFriend(user.id);
        showToast(`Removed @${user.username} from friends`, "info");
      } catch {
        showToast("Unable to remove friend", "error");
      }
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-zinc-900 select-none shadow-sm">
      {/* Cover Banner */}
      <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-slate-100 dark:bg-zinc-900">
        {user.coverUrl ? (
          <img
            src={user.coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-blue-100 via-blue-50 to-indigo-100 dark:from-zinc-900 dark:via-primary/10 dark:to-zinc-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Main Profile Info Container */}
      <div className="px-5 sm:px-8 pb-6 relative -mt-16 sm:-mt-20">
        {/* Top Row: Avatar + Dynamic Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div className="relative inline-block">
            <div className="p-1 rounded-3xl bg-white dark:bg-zinc-900 shadow-md inline-block">
              <Avatar
                src={user.avatarUrl}
                alt={user.displayName}
                size="2xl"
                status={user.status}
              />
            </div>
            {user.isVerified && (
              <div className="absolute bottom-2 right-2 bg-white dark:bg-zinc-900 p-1 rounded-full shadow-xs">
                <VerifiedBadge size={16} />
              </div>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center flex-wrap gap-2.5">
            {isMe ? (
              <>
                <Button
                  variant="primary"
                  size="md"
                  onClick={onEditProfile || (() => setIsEditModalOpen(true))}
                  className="rounded-xl shadow-xs gap-2 text-xs font-bold"
                >
                  <Edit3 size={14} />
                  Edit Profile
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleShareProfile}
                  className="rounded-xl gap-2 text-xs"
                >
                  <Share2 size={14} />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => onNavigate?.("settings")}
                  className="rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                  title="Settings"
                >
                  <Settings size={16} />
                </Button>
              </>
            ) : (
              <>
                {/* Follow Button */}
                <Button
                  variant={following ? "secondary" : "primary"}
                  size="md"
                  onClick={async () => {
                    if (following) {
                      await unfollowUser(user.id);
                      showToast(`Unfollowed @${user.username}`, "info");
                    } else {
                      await followUser(user.id);
                      showToast(`Now following @${user.username}!`, "success");
                    }
                  }}
                  className="rounded-xl text-xs font-bold gap-1.5 shadow-xs"
                >
                  {following ? (
                    <>
                      <UserCheck size={14} className="text-primary" />
                      Following
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Follow
                    </>
                  )}
                </Button>

                {/* Friendship Button */}
                <Button
                  variant={friendshipStatus === "friends" ? "secondary" : "ghost"}
                  size="md"
                  onClick={handleFriendshipAction}
                  className="rounded-xl text-xs font-bold gap-1.5 border border-slate-200/80 dark:border-white/[0.08]"
                >
                  {friendshipStatus === "friends" && (
                    <>
                      <UserCheck size={14} className="text-emerald-500" />
                      Friends
                    </>
                  )}
                  {friendshipStatus === "pending" && (
                    <>
                      <UserPlus size={14} className="text-amber-500" />
                      Request Sent
                    </>
                  )}
                  {friendshipStatus === "none" && (
                    <>
                      <UserPlus size={14} />
                      Add Friend
                    </>
                  )}
                </Button>

                {/* Direct Message Button */}
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleMessage}
                  className="rounded-xl text-xs font-bold gap-1.5"
                >
                  <MessageSquare size={14} />
                  Message
                </Button>

                {/* More Options Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition active:scale-95"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {showOptionsMenu && (
                    <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95">
                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          handleShareProfile();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05] flex items-center gap-2"
                      >
                        <Share2 size={13} />
                        Share Profile Link
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-white/[0.06] my-1" />

                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          onOpenReport?.(user);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 flex items-center gap-2"
                      >
                        <ShieldAlert size={13} />
                        Report User
                      </button>

                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          onOpenBlock?.(user);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2"
                      >
                        <Ban size={13} />
                        Block @{user.username}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* User Titles & Bio */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                {user.displayName}
              </h1>
              {user.role && (
                <span className="text-[10px] font-mono font-bold bg-blue-50 dark:bg-primary/15 text-primary border border-blue-200 dark:border-primary/25 px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">@{user.username}</p>
          </div>

          {user.bio && (
            <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-200 leading-relaxed max-w-2xl">
              {user.bio}
            </p>
          )}

          {/* Metadata Chips: Location, Website, Joined, Status */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-zinc-400 pt-1">
            {user.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400 dark:text-zinc-500" />
                <span>{user.location}</span>
              </div>
            )}

            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline font-medium"
              >
                <LinkIcon size={13} />
                <span>{user.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}

            {user.joinedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400 dark:text-zinc-500" />
                <span>Joined {user.joinedDate}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  user.status === "online"
                    ? "bg-emerald-500"
                    : "bg-slate-400 dark:bg-zinc-500"
                }`}
              />
              <span>
                {user.status === "online"
                  ? "Active now"
                  : user.lastSeen || "Offline"}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm text-slate-900 dark:text-white">
                {user.stats?.postsCount || 0}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-500">Sparks</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm text-slate-900 dark:text-white">
                {(user.stats?.followersCount || 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-500">Followers</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm text-slate-900 dark:text-white">
                {(user.stats?.followingCount || 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-500">Following</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm text-slate-900 dark:text-white">
                {user.stats?.friendsCount || 0}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-500">Friends</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isMe && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={currentUser}
        />
      )}
    </div>
  );
}
