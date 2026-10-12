"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Avatar } from "../ui/Avatar";
import { User, Conversation } from "../../types";
import { useChat } from "../../context/ChatContext";
import { useSocial } from "../../context/SocialContext";
import { useSuggestedUsers } from "../../hooks/useUsers";
import { Search, MessageSquare, Users, Sparkles } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conv: Conversation) => void;
}

export function NewChatModal({
  isOpen,
  onClose,
  onSelectConversation,
}: NewChatModalProps) {
  const { startNewConversation, conversations } = useChat();
  const { friends, following } = useSocial();
  const { data: suggestedUsers = [] } = useSuggestedUsers(20);
  const [search, setSearch] = useState("");

  // Merge unique connections (friends + following + suggested users)
  const networkUsers = Array.from(
    new Map([...friends, ...following, ...suggestedUsers].map((u) => [u.id, u])).values()
  );

  const users = networkUsers.filter((u) =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectUser = async (user: User) => {
    try {
      const newConvId = await startNewConversation(user);
      const conv = conversations.find((c) => c.id === newConvId);
      if (conv) onSelectConversation(conv);
      onClose();
    } catch (err) {
      console.error("Failed to start conversation", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start Direct Message" maxWidth="md">
      <div className="space-y-4 select-none">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creators or friends by name or @username..."
            className="w-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-800 transition"
            autoFocus
          />
        </div>

        <div className="max-h-72 overflow-y-auto space-y-1 hide-scroll">
          {users.length === 0 ? (
            <div className="py-6">
              <EmptyState
                icon={<Users size={20} />}
                title="No users found"
                description="Search for any creator across the network to start messaging."
              />
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-white/[0.04] cursor-pointer transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.displayName}
                    size="md"
                    status={user.status}
                    showStatus={true}
                    isVerified={user.isVerified}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition truncate">
                      {user.displayName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-500 truncate">
                      @{user.username} • {user.role || "Creator"}
                    </div>
                  </div>
                </div>

                <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 dark:bg-white/[0.03] group-hover:bg-primary text-slate-500 dark:text-zinc-400 group-hover:text-white transition">
                  <MessageSquare size={14} />
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
