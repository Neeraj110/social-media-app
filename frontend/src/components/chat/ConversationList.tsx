"use client";

import React, { useState } from "react";
import { Conversation, User } from "../../types";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useSocial } from "../../context/SocialContext";
import { Avatar } from "../ui/Avatar";
import { Search, Plus } from "lucide-react";

interface ConversationListProps {
  onSelectConversation: (conv: Conversation) => void;
  onOpenNewChat: () => void;
  selectedConversationId?: string;
}

export function ConversationList({
  onSelectConversation,
  onOpenNewChat,
  selectedConversationId,
}: ConversationListProps) {
  const { conversations } = useChat();
  const { currentUser } = useAuth();
  const { friends } = useSocial();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const getRecipient = (conv: Conversation) => conv.recipient || conv.participants.find((p) => p.id !== currentUser.id) || conv.participants[0];

  const filteredConversations = conversations.filter((conv) => {
    const recipient = getRecipient(conv);
    if (!recipient) return false;
    const matchesSearch =
      recipient.displayName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      recipient.username
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.text?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "unread") {
      return matchesSearch && conv.unreadCount > 0;
    }
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Messages
          </h2>
          <button
            onClick={onOpenNewChat}
            className="grid h-8 w-8 place-items-center rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-xs transition active:scale-95"
            title="Start New Thread"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search direct messages..."
            className="w-full bg-slate-100 dark:bg-zinc-800/70 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-lg transition ${
              activeTab === "all"
                ? "bg-slate-200 dark:bg-white/[0.08] text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300"
            }`}
          >
            All Threads
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-3 py-1 rounded-lg transition ${
              activeTab === "unread"
                ? "bg-blue-50 dark:bg-primary/20 text-primary border border-blue-200 dark:border-primary/30"
                : "text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Online Pulse Tray */}
      {friends.length > 0 && (
        <div className="p-3 border-b border-slate-200/80 dark:border-white/[0.06] overflow-x-auto hide-scroll flex items-center gap-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => {
                const existing = conversations.find(
                  (c) => getRecipient(c)?.id === friend.id
                );
                if (existing) onSelectConversation(existing);
                else onOpenNewChat();
              }}
              className="flex flex-col items-center gap-1 cursor-pointer group shrink-0"
            >
              <div className="relative">
                <Avatar
                  src={friend.avatarUrl}
                  alt={friend.displayName}
                  size="md"
                  status="online"
                />
              </div>
              <span className="text-[10px] text-slate-600 dark:text-zinc-400 group-hover:text-primary dark:group-hover:text-white truncate max-w-[54px] text-center transition">
                {friend.displayName.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto hide-scroll p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 dark:text-zinc-500">
            No active conversations found
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = selectedConversationId === conv.id;
            const recipient = getRecipient(conv);
            if (!recipient) return null;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition border ${
                  isSelected
                    ? "bg-blue-50/80 dark:bg-raised border-blue-200 dark:border-primary/30 shadow-xs"
                    : "border-transparent hover:bg-slate-100/70 dark:hover:bg-white/[0.03] hover:border-slate-200/60 dark:hover:border-white/[0.05]"
                }`}
              >
                <Avatar
                  src={recipient.avatarUrl}
                  alt={recipient.displayName}
                  size="md"
                  status={recipient.status}
                  isVerified={recipient.isVerified}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? "text-primary" : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {recipient.displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0">
                      {conv.lastMessage?.createdAt || ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      {conv.isTyping ? (
                        <span className="text-primary font-bold animate-pulse">
                          Typing...
                        </span>
                      ) : (
                        conv.lastMessage?.text || "Started a conversation"
                      )}
                    </p>

                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 h-4 min-w-4 px-1.5 rounded-full bg-primary text-white text-[9px] font-black grid place-items-center shadow-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
