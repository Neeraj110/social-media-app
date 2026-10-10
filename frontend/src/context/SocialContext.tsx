"use client";

import React, { createContext, useContext, useMemo } from "react";
import { User, FriendRequest } from "../types";
import { useAuth } from "./AuthContext";
import {
  useFriends,
  useFriendRequests,
  useSentFriendRequests,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useCancelFriendRequest,
  useFollowUser,
  useUnfollowUser,
  useBlockUser,
  useUnblockUser,
} from "../hooks/useSocialQueries";
import { useFollowing, useFollowers } from "../hooks/useUsers";

interface SocialContextType {
  friends: User[];
  friendRequests: FriendRequest[];
  followers: User[];
  following: User[];
  blockedUsers: User[];
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  sendFriendRequest: (user: User) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  toggleFollow: (user: User) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  isFriend: (userId: string) => boolean;
  blockUser: (user: User) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  isBlocked: (userId: string) => boolean;
  followUser: (userOrId: User | string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  getFriendshipStatus: (userId: string) => 'none' | 'pending' | 'friends';
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();

  const { data: friends = [] } = useFriends();
  const { data: friendRequests = [] } = useFriendRequests();
  const { data: sentRequests = [] } = useSentFriendRequests();
  const { data: following = [] } = useFollowing(currentUser?.id);
  const { data: followers = [] } = useFollowers(currentUser?.id);

  const sendRequestMutation = useSendFriendRequest();
  const acceptRequestMutation = useAcceptFriendRequest();
  const rejectRequestMutation = useRejectFriendRequest();
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();

  const isFollowing = (userId: string): boolean => {
    return following.some((u) => u.id === userId);
  };

  const isFriend = (userId: string): boolean => {
    return friends.some((u) => u.id === userId);
  };

  const isBlocked = (_userId: string): boolean => {
    return false;
  };

  const acceptFriendRequest = async (requestId: string) => {
    await acceptRequestMutation.mutateAsync(requestId);
  };

  const declineFriendRequest = async (requestId: string) => {
    await rejectRequestMutation.mutateAsync(requestId);
  };

  const sendFriendRequest = async (user: User) => {
    await sendRequestMutation.mutateAsync(user.id);
  };

  const removeFriend = async (userId: string) => {
    // Typically removing a friend unfollows or deletes friendship
    await unfollowMutation.mutateAsync(userId);
  };

  const toggleFollow = async (user: User) => {
    if (isFollowing(user.id)) {
      await unfollowMutation.mutateAsync(user.id);
    } else {
      await followMutation.mutateAsync(user.id);
    }
  };

  const followUser = async (userOrId: User | string) => {
    const id = typeof userOrId === "object" && userOrId !== null ? userOrId.id : userOrId;
    await followMutation.mutateAsync(id);
  };

  const unfollowUser = async (userId: string) => {
    await unfollowMutation.mutateAsync(userId);
  };

  const blockUser = async (user: User) => {
    await blockMutation.mutateAsync(user.id);
  };

  const unblockUser = async (userId: string) => {
    await unblockMutation.mutateAsync(userId);
  };

  const getFriendshipStatus = (userId: string): 'none' | 'pending' | 'friends' => {
    if (friends.some((u) => u.id === userId)) return 'friends';
    if (friendRequests.some((r) => r.sender.id === userId)) return 'pending';
    if (sentRequests.some((r: any) => String(r.receiver_id) === userId && r.status === 'pending')) return 'pending';
    return 'none';
  };

  return (
    <SocialContext.Provider
      value={{
        friends,
        friendRequests,
        followers,
        following,
        blockedUsers: [],
        acceptFriendRequest,
        declineFriendRequest,
        sendFriendRequest,
        removeFriend,
        toggleFollow,
        isFollowing,
        isFriend,
        blockUser,
        unblockUser,
        isBlocked,
        followUser,
        unfollowUser,
        getFriendshipStatus,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error("useSocial must be used within a SocialProvider");
  }
  return context;
}
