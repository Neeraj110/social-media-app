"use client";

import React, { useState } from "react";
import { User, AppView } from "../../types";
import { useSocial } from "../../context/SocialContext";
import { useChat } from "../../context/ChatContext";
import { useToast } from "../../context/ToastContext";
import { useSuggestedUsers } from "../../hooks/useUsers";
import { useChatStore } from "../../stores/useChatStore";
import { GlassCard } from "../ui/GlassCard";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import {
  Users,
  UserPlus,
  UserCheck,
  UserMinus,
  Search,
  Sparkles,
  MessageSquare,
  Check,
  X,
  Clock,
} from "lucide-react";

interface FriendsViewProps {
  onNavigate?: (view: AppView) => void;
  onSelectUser: (user: User) => void;
  onOpenChat?: (user?: User) => void;
}

export function FriendsView({ onNavigate, onSelectUser, onOpenChat }: FriendsViewProps) {
  const {
    friends,
    friendRequests,
    followers,
    following,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    sendFriendRequest,
    followUser,
    unfollowUser,
    isFollowing,
    getFriendshipStatus,
  } = useSocial();

  const { data: suggestedUsers = [], isLoading: isSuggestedLoading } = useSuggestedUsers(30);

  const { startNewConversation, selectConversation } = useChat();
  const { setActiveConversationId } = useChatStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "friends" | "requests" | "followers" | "following" | "suggestions"
  >("friends");
  const [searchQuery, setSearchQuery] = useState("");

  const handleMessage = async (user: User) => {
    try {
      const convId = await startNewConversation(user);
      setActiveConversationId(convId);
      selectConversation(convId);
      if (onOpenChat) {
        onOpenChat(user);
      } else if (onNavigate) {
        onNavigate("messages");
      }
    } catch (err) {
      showToast("Unable to start conversation", "error");
    }
  };

  const filteredFriends = friends.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFollowers = followers.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFollowing = following.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggestions = suggestedUsers.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 lg:pb-8 select-none">
      {/* Top Header Card */}
      <GlassCard className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]" elevated>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 dark:bg-primary/15 text-primary border border-blue-200 dark:border-primary/25 shadow-xs">
                <Users size={16} />
              </div>
              Connections & Social Graph
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Manage your direct friendships, peer requests, followers, and social network.
            </p>
          </div>

          {/* Search Connections Input */}
          <div className="relative sm:w-72">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your network..."
              className="w-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
            />
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-2 pt-5 border-t border-slate-100 dark:border-white/[0.06] mt-5 overflow-x-auto hide-scroll">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "friends"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>All Friends</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 font-mono">
              {friends.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "requests"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Friend Requests</span>
            {friendRequests.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono animate-pulse">
                {friendRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("following")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "following"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Following</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 font-mono">
              {following.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("followers")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "followers"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Followers</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 font-mono">
              {followers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("suggestions")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "suggestions"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles size={12} className={activeTab === "suggestions" ? "text-white" : "text-primary"} />
            <span>Discover Creators</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 font-mono">
              {suggestedUsers.length}
            </span>
          </button>
        </div>
      </GlassCard>

      {/* Tab Content 1: All Friends */}
      {activeTab === "friends" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredFriends.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={<Users size={24} />}
                title="No friends found"
                description="Connect with other creators or accept pending friend requests to build your network."
              />
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <GlassCard
                key={friend.id}
                className="p-4 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]"
                hoverEffect
              >
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => onSelectUser(friend)}
                >
                  <Avatar
                    src={friend.avatarUrl}
                    alt={friend.displayName}
                    size="md"
                    status={friend.status}
                    isVerified={friend.isVerified}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white hover:text-primary transition truncate">
                        {friend.displayName}
                      </span>
                      {friend.isVerified && <VerifiedBadge size={14} />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-500 truncate font-mono">
                      @{friend.username} • {friend.role || "Creator"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleMessage(friend)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-primary text-slate-600 hover:text-white dark:text-zinc-300 dark:hover:text-white transition active:scale-95"
                    title="Send Direct Message"
                  >
                    <MessageSquare size={14} />
                  </button>

                  <button
                    onClick={async () => {
                      await removeFriend(friend.id);
                      showToast(`Removed @${friend.username} from friends`, "info");
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-rose-50 text-slate-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 transition active:scale-95"
                    title="Remove Friend"
                  >
                    <UserMinus size={14} />
                  </button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {/* Tab Content 2: Friend Requests */}
      {activeTab === "requests" && (
        <div className="space-y-3">
          {friendRequests.length === 0 ? (
            <EmptyState
              icon={<UserPlus size={24} />}
              title="No pending requests"
              description="When other creators send you a friend request, they will appear here."
            />
          ) : (
            friendRequests.map((req) => (
              <GlassCard
                key={req.id}
                className="p-4 flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]"
                hoverEffect
              >
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => onSelectUser(req.sender)}
                >
                  <Avatar
                    src={req.sender.avatarUrl}
                    alt={req.sender.displayName}
                    size="lg"
                    status={req.sender.status}
                    isVerified={req.sender.isVerified}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white hover:text-primary transition truncate">
                        {req.sender.displayName}
                      </span>
                      {req.sender.isVerified && (
                        <VerifiedBadge size={14} />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      @{req.sender.username} • {req.sender.role || "Creator"}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 font-mono">
                      Sent {req.createdAt}
                    </div>
                  </div>
                </div>

                {/* Accept / Decline Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      await acceptFriendRequest(req.id);
                      showToast(`Accepted friend request from @${req.sender.username}`, "success");
                    }}
                    className="rounded-xl text-xs font-bold gap-1.5 shadow-xs"
                  >
                    <Check size={13} />
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await declineFriendRequest(req.id);
                      showToast("Friend request declined", "info");
                    }}
                    className="rounded-xl text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X size={13} />
                    Delete
                  </Button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {/* Tab Content 3: Following */}
      {activeTab === "following" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredFollowing.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={<Users size={24} />}
                title="Not following anyone yet"
                description="Explore creators across the network to populate your feed."
              />
            </div>
          ) : (
            filteredFollowing.map((user) => (
              <GlassCard
                key={user.id}
                className="p-4 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]"
                hoverEffect
              >
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => onSelectUser(user)}
                >
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.displayName}
                    size="md"
                    status={user.status}
                    isVerified={user.isVerified}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white hover:text-primary transition truncate">
                      {user.displayName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-500 truncate font-mono">
                      @{user.username}
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    await unfollowUser(user.id);
                    showToast(`Unfollowed @${user.username}`, "info");
                  }}
                  className="rounded-xl text-xs font-bold gap-1 text-primary hover:text-rose-500"
                >
                  <UserCheck size={13} />
                  Following
                </Button>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {/* Tab Content 4: Followers */}
      {activeTab === "followers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredFollowers.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={<Users size={24} />}
                title="No followers yet"
                description="Publish insightful sparks and engage with creators to grow your reach."
              />
            </div>
          ) : (
            filteredFollowers.map((user) => {
              const followingUser = isFollowing(user.id);
              return (
                <GlassCard
                  key={user.id}
                  className="p-4 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]"
                  hoverEffect
                >
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                    onClick={() => onSelectUser(user)}
                  >
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.displayName}
                      size="md"
                      status={user.status}
                      isVerified={user.isVerified}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white hover:text-primary transition truncate">
                        {user.displayName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 truncate font-mono">
                        @{user.username}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={followingUser ? "secondary" : "primary"}
                    size="sm"
                    onClick={async () => {
                      if (followingUser) {
                        await unfollowUser(user.id);
                        showToast(`Unfollowed @${user.username}`, "info");
                      } else {
                        await followUser(user);
                        showToast(`Now following @${user.username}!`, "success");
                      }
                    }}
                    className="rounded-xl text-xs font-bold gap-1 shadow-xs"
                  >
                    {followingUser ? "Following" : "Follow Back"}
                  </Button>
                </GlassCard>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content 5: Discover Creators */}
      {activeTab === "suggestions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredSuggestions.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={<Sparkles size={24} />}
                title={isSuggestedLoading ? "Discovering creators..." : "No suggestions right now"}
                description="Explore creators across the network or check back soon as more users join."
              />
            </div>
          ) : (
            filteredSuggestions.map((user: User) => {
              const friendshipStatus = getFriendshipStatus(user.id);
              const followingUser = isFollowing(user.id);

              return (
                <GlassCard
                  key={user.id}
                  className="p-4 flex flex-col justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]"
                  hoverEffect
                >
                  <div
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => onSelectUser(user)}
                  >
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.displayName}
                      size="lg"
                      status={user.status}
                      isVerified={user.isVerified}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white hover:text-primary transition truncate">
                          {user.displayName}
                        </span>
                        {user.isVerified && <VerifiedBadge size={14} />}
                      </div>
                      <div className="text-[11px] text-primary font-mono">
                        @{user.username}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1">
                        {user.bio || user.title || user.role || "Community Creator"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                    <Button
                      variant={followingUser ? "secondary" : "primary"}
                      size="sm"
                      onClick={async () => {
                        if (followingUser) {
                          await unfollowUser(user.id);
                          showToast(`Unfollowed @${user.username}`, "info");
                        } else {
                          await followUser(user);
                          showToast(`Now following @${user.username}!`, "success");
                        }
                      }}
                      className="flex-1 rounded-xl text-xs font-bold gap-1.5 shadow-xs"
                    >
                      <Sparkles size={12} />
                      {followingUser ? "Following" : "Follow"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (friendshipStatus === "none") {
                          try {
                            await sendFriendRequest(user);
                            showToast(`Friend request sent to @${user.username}`, "success");
                          } catch {
                            showToast("Unable to send friend request", "error");
                          }
                        }
                      }}
                      disabled={friendshipStatus !== "none"}
                      className={`rounded-xl text-xs font-bold gap-1.5 border border-slate-200 dark:border-white/10 ${
                        friendshipStatus === "friends"
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                          : friendshipStatus === "pending"
                          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                          : "hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      {friendshipStatus === "friends" ? (
                        <>
                          <UserCheck size={13} />
                          Friends
                        </>
                      ) : friendshipStatus === "pending" ? (
                        <>
                          <Clock size={13} />
                          Pending
                        </>
                      ) : (
                        <>
                          <UserPlus size={13} />
                          Add Friend
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMessage(user)}
                      className="rounded-xl text-xs p-2 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                      title="Direct Message"
                    >
                      <MessageSquare size={14} />
                    </Button>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
