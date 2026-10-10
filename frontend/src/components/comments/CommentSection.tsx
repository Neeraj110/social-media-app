"use client";

import React, { useState } from "react";
import { useComment } from "../../context/CommentContext";
import { CommentInput } from "./CommentInput";
import { CommentItem } from "./CommentItem";
import { User } from "../../types";
import { MessageSquare, ArrowUpDown } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  onSelectUser?: (user: User) => void;
}

export function CommentSection({ postId, onSelectUser }: CommentSectionProps) {
  const { getCommentsForPost, addComment } = useComment();
  const [sortBy, setSortBy] = useState<"top" | "newest">("top");

  const comments = getCommentsForPost(postId);

  const handleAddTopComment = (text: string) => {
    addComment(postId, text);
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "top") return b.likesCount - a.likesCount;
    return 0; // Default order is chronological
  });

  return (
    <div className="space-y-4">
      {/* Top Input Bar */}
      <CommentInput
        onSubmit={handleAddTopComment}
        placeholder="Add your spark to the discussion..."
      />

      {/* Sort Filter & Comment Count Header */}
      {comments.length > 0 && (
        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
            <MessageSquare size={13} className="text-primary" />
            <span>
              {comments.length} {comments.length === 1 ? "Discussion" : "Discussions"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">Sort:</span>
            <button
              onClick={() => setSortBy(sortBy === "top" ? "newest" : "top")}
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 active:scale-95"
            >
              <ArrowUpDown size={10} />
              {sortBy === "top" ? "Top Sparks" : "Latest"}
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
          No comments yet. Ignite the conversation!
        </div>
      ) : (
        <div className="space-y-3">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onSelectUser={onSelectUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}
