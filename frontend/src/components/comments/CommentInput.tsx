"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../ui/Avatar";
import { Send, Smile, X } from "lucide-react";

interface CommentInputProps {
  onSubmit: (text: string) => void;
  replyingToUser?: string;
  onCancelReply?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const QUICK_EMOJIS = ["✨", "🔥", "🚀", "❤️", "👏", "🤯"];

export function CommentInput({
  onSubmit,
  replyingToUser,
  onCancelReply,
  placeholder = "Write a thoughtful reply...",
  autoFocus = false,
}: CommentInputProps) {
  const { currentUser } = useAuth();
  const [text, setText] = useState("");
  const [showEmojiTray, setShowEmojiTray] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
    setShowEmojiTray(false);
  };

  const handleAddEmoji = (emoji: string) => {
    setText((prev) => `${prev}${emoji}`);
  };

  return (
    <div className="space-y-2 select-none">
      {/* Replying banner */}
      {replyingToUser && (
        <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl">
          <span>
            Replying to <strong className="text-primary font-mono">@{replyingToUser}</strong>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-zinc-400 hover:text-white"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Main input bar */}
      <form onSubmit={handleSubmit} className="flex items-start gap-2.5">
        <Avatar
          src={currentUser.avatarUrl}
          alt={currentUser.displayName}
          size="sm"
        />

        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            autoFocus={autoFocus}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/90 dark:border-white/10 rounded-2xl pl-3.5 pr-20 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
          />

          {/* Quick Actions inside input */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowEmojiTray(!showEmojiTray)}
              className="p-1 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-amber-500 transition"
              title="Add Emoji"
            >
              <Smile size={15} />
            </button>

            <button
              type="submit"
              disabled={!text.trim()}
              className="grid h-7 w-7 place-items-center rounded-xl bg-primary text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition shadow-xs"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      </form>

      {/* Quick emoji drawer */}
      {showEmojiTray && (
        <div className="flex items-center gap-1.5 pl-10 animate-in fade-in zoom-in-95 duration-150">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="text-base hover:scale-125 transition-transform p-1 rounded-lg hover:bg-white/[0.05]"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
