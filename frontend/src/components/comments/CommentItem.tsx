"use client";

import React, { useState } from "react";
import { Comment, User } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useComment } from "../../context/CommentContext";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../ui/Badge";
import { CommentInput } from "./CommentInput";
import {
  Heart,
  Reply,
  Trash2,
} from "lucide-react";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onSelectUser?: (user: User) => void;
  depth?: number;
}

export function CommentItem({
  comment,
  postId,
  onSelectUser,
  depth = 0,
}: CommentItemProps) {
  const { currentUser } = useAuth();
  const { toggleLikeComment, deleteComment, addComment } = useComment();
  const [isReplying, setIsReplying] = useState(false);
  const [repliesExpanded, setRepliesExpanded] = useState(true);

  const isAuthor = currentUser.id === comment.author.id;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleReplySubmit = (text: string) => {
    addComment(postId, text, comment.id);
    setIsReplying(false);
    setRepliesExpanded(true);
  };

  // Render mentions with highlight
  const renderCommentText = (text: string) => {
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span key={i} className="text-primary font-bold hover:underline">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`group/comment relative ${depth > 0 ? "ml-6 sm:ml-8 mt-2.5" : "mt-3.5"}`}>
      {/* Thread Connection Line for Nested Depth */}
      {depth > 0 && (
        <div className="absolute -left-4 top-3.5 w-3.5 h-4 border-l-2 border-b-2 border-slate-200 dark:border-white/10 rounded-bl-lg pointer-events-none" />
      )}

      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div
          className="cursor-pointer shrink-0"
          onClick={() => onSelectUser?.(comment.author)}
        >
          <Avatar
            src={comment.author.avatarUrl}
            alt={comment.author.displayName}
            size="xs"
            isVerified={comment.author.isVerified}
          />
        </div>

        {/* Comment Bubble & Actions */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] p-3 hover:border-slate-300 dark:hover:border-white/15 transition">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={() => onSelectUser?.(comment.author)}
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white hover:text-primary transition truncate">
                  {comment.author.displayName}
                </span>
                {comment.author.isVerified && <VerifiedBadge size={14} />}
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono truncate">
                  @{comment.author.username}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {comment.createdAt}
                </span>

                {isAuthor && (
                  <button
                    onClick={() => deleteComment(postId, comment.id)}
                    className="opacity-0 group-hover/comment:opacity-100 text-slate-400 dark:text-zinc-500 hover:text-rose-500 transition"
                    title="Delete Comment"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Comment Body */}
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed break-words">
              {renderCommentText(comment.content)}
            </p>
          </div>

          {/* Action Row below bubble */}
          <div className="flex items-center gap-4 mt-1.5 pl-2 text-[11px] text-slate-500 dark:text-zinc-500 select-none">
            {/* Like */}
            <button
              onClick={() => toggleLikeComment(postId, comment.id)}
              className={`flex items-center gap-1 transition ${
                comment.isLiked ? "text-rose-500 font-bold" : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Heart
                size={12}
                className={comment.isLiked ? "fill-rose-500" : ""}
              />
              <span>
                {comment.likesCount > 0 ? comment.likesCount : "Like"}
              </span>
            </button>

            {/* Reply Button */}
            {depth < 3 && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 hover:text-primary transition active:scale-95"
              >
                <Reply size={12} />
                <span>Reply</span>
              </button>
            )}

            {/* Toggle replies */}
            {hasReplies && (
              <button
                onClick={() => setRepliesExpanded(!repliesExpanded)}
                className="text-[10px] font-semibold text-primary hover:underline ml-auto active:scale-95"
              >
                {repliesExpanded
                  ? `Hide replies (${comment.replies?.length})`
                  : `View ${comment.replies?.length} ${
                      comment.replies?.length === 1 ? "reply" : "replies"
                    }`}
              </button>
            )}
          </div>

          {/* Inline Reply Box */}
          {isReplying && (
            <div className="mt-2.5 pl-2">
              <CommentInput
                onSubmit={handleReplySubmit}
                replyingToUser={comment.author.username}
                onCancelReply={() => setIsReplying(false)}
                autoFocus
                placeholder={`Reply to @${comment.author.username}...`}
              />
            </div>
          )}

          {/* Render Nested Thread Replies */}
          {hasReplies && repliesExpanded && (
            <div className="space-y-2 mt-1">
              {comment.replies?.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onSelectUser={onSelectUser}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
