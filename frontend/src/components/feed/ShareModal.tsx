"use client";

import React, { useState } from "react";
import { Post, User } from "../../types";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { useToast } from "../../context/ToastContext";
import { useChat } from "../../context/ChatContext";
import { useSocial } from "../../context/SocialContext";
import {
  Copy,
  Check,
  Repeat,
  Link2,
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onRepost?: () => void;
}

export function ShareModal({
  isOpen,
  onClose,
  post,
  onRepost,
}: ShareModalProps) {
  const { showToast } = useToast();
  const { startNewConversation, sendMessage } = useChat();
  const { friends, following } = useSocial();
  const [copied, setCopied] = useState(false);
  const [searchFriend, setSearchFriend] = useState("");
  const [sentToUsers, setSentToUsers] = useState<string[]>([]);

  const postUrl = `https://nexus.social/p/${post.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    showToast("Post link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const connections = Array.from(
    new Map([...friends, ...following].map((u) => [u.id, u])).values()
  ).filter((f) =>
    f.displayName?.toLowerCase().includes(searchFriend.toLowerCase()) ||
    f.username?.toLowerCase().includes(searchFriend.toLowerCase())
  );

  const handleSendToFriend = (user: User) => {
    startNewConversation(user);
    sendMessage(`Check out this spark from @${post.author.username}: "${post.content.slice(0, 80)}..."\n${postUrl}`);
    setSentToUsers((prev) => [...prev, user.id]);
    showToast(`Shared to ${user.displayName}'s direct messages!`, "success");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Spark" maxWidth="md">
      <div className="space-y-4 select-none">
        {/* Post Preview Snippet */}
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-950/60 border border-white/[0.08]">
          <Avatar
            src={post.author.avatarUrl}
            alt={post.author.displayName}
            size="sm"
            status={post.author.status}
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              {post.author.displayName}
              <span className="text-[10px] font-mono text-zinc-500">
                @{post.author.username}
              </span>
            </div>
            <p className="text-xs text-zinc-300 line-clamp-2 mt-0.5">
              {post.content}
            </p>
          </div>
        </div>

        {/* Repost Quick Action */}
        <button
          onClick={() => {
            onRepost?.();
            onClose();
          }}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/25 text-white transition group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-zinc-950 font-bold shadow-sm">
              <Repeat size={16} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">Repost to your Feed</div>
              <div className="text-[10px] text-zinc-400">
                Share this spark with your followers
              </div>
            </div>
          </div>
          <span className="text-xs text-primary font-bold group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>

        {/* Direct Message Send Tray */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
            Send via Direct Message
          </div>
          <input
            type="text"
            value={searchFriend}
            onChange={(e) => setSearchFriend(e.target.value)}
            placeholder="Search connections..."
            className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 mb-2 focus:border-primary/50 outline-none"
          />

          <div className="max-h-40 overflow-y-auto space-y-1.5 hide-scroll">
            {connections.length === 0 ? (
              <div className="text-center py-4 text-xs text-zinc-500">
                No connections found
              </div>
            ) : (
              connections.map((friend) => {
                const alreadySent = sentToUsers.includes(friend.id);
                return (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        src={friend.avatarUrl}
                        alt={friend.displayName}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-200 truncate">
                          {friend.displayName}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono truncate">
                          @{friend.username}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="xs"
                      variant={alreadySent ? "secondary" : "primary"}
                      disabled={alreadySent}
                      onClick={() => handleSendToFriend(friend)}
                      className="rounded-full px-3 font-bold"
                    >
                      {alreadySent ? "Sent" : "Send"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Copy Link */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
            <Link2 size={14} className="text-zinc-500 shrink-0" />
            <span className="text-[11px] font-mono text-zinc-400 truncate flex-1">
              {postUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0 active:scale-95"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
