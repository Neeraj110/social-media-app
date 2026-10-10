"use client";

import React, { useState, useRef, useEffect } from "react";
import { Post, ReactionType, User } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { usePost } from "../../context/PostContext";
import { useToast } from "../../context/ToastContext";
import { useSocial } from "../../context/SocialContext";
import { GlassCard } from "../ui/GlassCard";
import { Avatar } from "../ui/Avatar";
import { Badge, VerifiedBadge } from "../ui/Badge";
import { ReactionPicker, REACTION_CONFIG } from "./ReactionPicker";
import { MediaCarousel } from "./MediaCarousel";
import { PollCard } from "./PollCard";
import { ShareModal } from "./ShareModal";
import { LightboxModal } from "../ui/LightboxModal";
import { CommentSection } from "../comments/CommentSection";
import {
  Heart,
  MessageSquare,
  Repeat,
  Bookmark,
  Share2,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  Sparkles,
  Copy,
  Trash2,
  ShieldAlert,
  UserX,
  Code2,
  Check,
} from "lucide-react";

interface PostCardProps {
  post: Post;
  onSelectUser?: (user: User) => void;
  onOpenReport?: (post: Post) => void;
  onOpenBlock?: (user: User) => void;
}

export function PostCard({
  post,
  onSelectUser,
  onOpenReport,
  onOpenBlock,
}: PostCardProps) {
  const { currentUser } = useAuth();
  const { reactToPost, removeReaction, toggleSavePost: bookmarkPost, votePoll, deletePost, sharePost: repostPost } =
    usePost();
  const { showToast } = useToast();

  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const pickerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthor = currentUser.id === post.author.id;

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnterReact = () => {
    if (pickerTimeoutRef.current) clearTimeout(pickerTimeoutRef.current);
    pickerTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker(true);
    }, 250);
  };

  const handleMouseLeaveReact = () => {
    if (pickerTimeoutRef.current) clearTimeout(pickerTimeoutRef.current);
    pickerTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker(false);
    }, 400);
  };

  const handleReact = (type: ReactionType) => {
    if (post.userReaction === type) {
      removeReaction(post.id);
      showToast("Reaction removed", "info");
    } else {
      reactToPost(post.id, type);
      const conf = REACTION_CONFIG[type];
      showToast(`Reacted ${conf.emoji} ${conf.label}`, "success");
    }
    setShowReactionPicker(false);
  };

  const handleQuickLike = () => {
    if (post.userReaction) {
      removeReaction(post.id);
    } else {
      reactToPost(post.id, "like");
    }
  };

  const handleCopyCode = () => {
    if (!post.codeSnippet) return;
    navigator.clipboard.writeText(post.codeSnippet.code);
    setCopiedCode(true);
    showToast("Code snippet copied to clipboard!", "success");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyPostLink = () => {
    navigator.clipboard.writeText(`https://nexus.social/p/${post.id}`);
    showToast("Post link copied!", "success");
    setShowMenu(false);
  };

  const handleDelete = () => {
    deletePost(post.id);
    showToast("Post deleted successfully", "info");
    setShowMenu(false);
  };

  const formatRelativeTime = (timestamp: string) => {
    return timestamp;
  };

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case "public":
        return <span title="Public"><Globe size={11} className="text-zinc-400" /></span>;
      case "friends":
        return <span title="Friends Only"><Users size={11} className="text-zinc-400" /></span>;
      case "private":
        return <span title="Only Me"><Lock size={11} className="text-zinc-400" /></span>;
    }
  };

  const topReactions = Object.entries(post.reactions)
    .filter(([key, count]) => key !== "total" && key !== "userReaction" && (count as number) > 0)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3);

  // Content formatting for hashtags & mentions
  const renderFormattedContent = (text: string) => {
    const parts = text.split(/(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("#")) {
        return (
          <span
            key={i}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            {part}
          </span>
        );
      }
      if (part.startsWith("@")) {
        return (
          <span
            key={i}
            className="text-primary-light font-bold hover:underline cursor-pointer"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const isLongText = post.content.length > 280;
  const displayContent =
    isLongText && !isExpanded ? `${post.content.slice(0, 260)}...` : post.content;

  return (
    <GlassCard className="p-4 sm:p-5 mb-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]" elevated hoverEffect>
      {/* Repost Badge Banner if applicable */}
      {post.isRepost && post.repostedBy && (
        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-white/[0.06] text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
          <Repeat size={13} className="text-primary" />
          <span>
            Reposted by{" "}
            <span className="text-slate-900 dark:text-white font-bold">
              {post.repostedBy.displayName}
            </span>
          </span>
        </div>
      )}

      {/* Author Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onSelectUser?.(post.author)}
        >
          <Avatar
            src={post.author.avatarUrl}
            alt={post.author.displayName}
            size="md"
            status={post.author.status}
            isVerified={post.author.isVerified}
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition">
                {post.author.displayName}
              </span>
              {post.author.isVerified && (
                <VerifiedBadge />
              )}
              {post.author.role && (
                <Badge variant="secondary" size="sm">
                  {post.author.role}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              <span>@{post.author.username}</span>
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
              <span>•</span>
              <span className="flex items-center">{getVisibilityIcon()}</span>
            </div>
          </div>
        </div>

        {/* 3-Dot Options Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition active:scale-95"
            title="More Options"
          >
            <MoreHorizontal size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-zinc-900 rounded-2xl p-1.5 shadow-2xl border border-slate-200/90 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150 z-30 select-none">
              <button
                onClick={() => {
                  bookmarkPost(post.id);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl transition"
              >
                <Bookmark
                  size={14}
                  className={post.isSaved ? "text-amber-500 fill-amber-500" : ""}
                />
                {post.isSaved ? "Remove Bookmark" : "Save Bookmark"}
              </button>

              <button
                onClick={handleCopyPostLink}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl transition"
              >
                <Copy size={14} />
                Copy Post Link
              </button>

              <button
                onClick={() => {
                  setShowShareModal(true);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl transition"
              >
                <Repeat size={14} />
                Repost Spark
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />

              {!isAuthor && (
                <>
                  <button
                    onClick={() => {
                      onOpenReport?.(post);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition"
                  >
                    <ShieldAlert size={14} />
                    Report Spark
                  </button>

                  <button
                    onClick={() => {
                      onOpenBlock?.(post.author);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition"
                  >
                    <UserX size={14} />
                    Block @{post.author.username}
                  </button>
                </>
              )}

              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition"
                >
                  <Trash2 size={14} />
                  Delete Spark
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Body Content */}
      <div className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line mb-3">
        {renderFormattedContent(displayContent)}
        {isLongText && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary font-bold ml-1.5 hover:underline"
          >
            {isExpanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Code Snippet Block if present */}
      {post.codeSnippet && (
        <div className="my-3 rounded-2xl overflow-hidden bg-slate-900 dark:bg-[#09090b] border border-slate-800 dark:border-white/[0.08] select-text shadow-xs">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 dark:bg-white/[0.03] border-b border-slate-700/60 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Code2 size={13} className="text-blue-400 dark:text-primary" />
              <span className="text-[11px] font-mono font-bold text-blue-400 dark:text-primary uppercase tracking-wider">
                {post.codeSnippet.language}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-[10px] font-mono text-slate-300 dark:text-zinc-400 hover:text-white flex items-center gap-1 transition active:scale-95"
            >
              {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copiedCode ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-[11px] font-mono text-teal-200 leading-relaxed hide-scroll">
            <code>{post.codeSnippet.code}</code>
          </pre>
        </div>
      )}

      {/* Interactive Poll if present */}
      {post.poll && (
        <PollCard
          poll={post.poll}
          onVote={(optId) => votePoll(post.id, optId)}
        />
      )}

      {/* Media Carousel / Single Media if present */}
      {post.media && post.media.length > 0 && (
        <MediaCarousel
          media={post.media}
          onOpenLightbox={(idx) => setLightboxIndex(idx)}
        />
      )}

      {/* Stats Summary Line (Reactions + Comments/Shares count) */}
      <div className="flex items-center justify-between pt-2 pb-1 text-[11px] text-slate-500 dark:text-zinc-400 select-none">
        {/* Reaction Breakdown */}
        <div className="flex items-center gap-1.5">
          {topReactions.length > 0 ? (
            <div className="flex items-center -space-x-1">
              {topReactions.map(([type]) => (
                <span
                  key={type}
                  className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 dark:bg-raised border border-slate-200 dark:border-white/10 text-xs shadow-xs"
                  title={REACTION_CONFIG[type as ReactionType].label}
                >
                  {REACTION_CONFIG[type as ReactionType].emoji}
                </span>
              ))}
              <span className="pl-2 font-semibold text-slate-700 dark:text-zinc-300">
                {post.reactionCount}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 dark:text-zinc-500">Be the first to react</span>
          )}
        </div>

        {/* Comments & Repost Counts */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:text-slate-900 dark:hover:text-zinc-200 hover:underline transition"
          >
            {post.commentsCount} {post.commentsCount === 1 ? "comment" : "comments"}
          </button>
          <span>•</span>
          <button
            onClick={() => setShowShareModal(true)}
            className="hover:text-slate-900 dark:hover:text-zinc-200 hover:underline transition"
          >
            {post.sharesCount} {post.sharesCount === 1 ? "share" : "shares"}
          </button>
        </div>
      </div>

      {/* Primary Action Button Bar */}
      <div className="relative mt-2 pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between select-none">
        {/* Hover Reaction Popup */}
        {showReactionPicker && (
          <div
            className="absolute -top-12 left-0 z-30"
            onMouseEnter={handleMouseEnterReact}
            onMouseLeave={handleMouseLeaveReact}
          >
            <ReactionPicker
              currentReaction={post.userReaction}
              onSelectReaction={handleReact}
            />
          </div>
        )}

        {/* Reaction / Like Action Button */}
        <button
          onClick={handleQuickLike}
          onMouseEnter={handleMouseEnterReact}
          onMouseLeave={handleMouseLeaveReact}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
            post.userReaction
              ? `${REACTION_CONFIG[post.userReaction].color} bg-blue-50 dark:bg-white/[0.04]`
              : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
          }`}
        >
          {post.userReaction ? (
            <>
              <span className="text-base leading-none">
                {REACTION_CONFIG[post.userReaction].emoji}
              </span>
              <span>{REACTION_CONFIG[post.userReaction].label}</span>
            </>
          ) : (
            <>
              <Heart size={16} />
              <span>React</span>
            </>
          )}
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
            showComments
              ? "text-primary bg-blue-50 dark:bg-primary/10"
              : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
          }`}
        >
          <MessageSquare size={16} />
          <span>Comment</span>
        </button>

        {/* Repost / Share Button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition active:scale-95"
        >
          <Repeat size={16} />
          <span>Share</span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={() => bookmarkPost(post.id)}
          className={`p-2 rounded-xl transition active:scale-95 ${
            post.isSaved
              ? "text-amber-500 bg-amber-50 dark:bg-amber-400/10"
              : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
          }`}
          title={post.isSaved ? "Saved in Bookmarks" : "Save to Bookmarks"}
        >
          <Bookmark
            size={16}
            className={post.isSaved ? "fill-amber-500" : ""}
          />
        </button>
      </div>

      {/* Threaded Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06] animate-in fade-in duration-200">
          <CommentSection postId={post.id} />
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && post.media && (
        <LightboxModal
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          mediaList={post.media}
          initialIndex={lightboxIndex}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={post}
          onRepost={() => repostPost(post.id)}
        />
      )}
    </GlassCard>
  );
}
