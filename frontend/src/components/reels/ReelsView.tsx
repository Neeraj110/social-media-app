"use client";

import React, { useState, useRef, useEffect } from "react";
import { useReels } from "../../context/ReelContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { CreateReelModal } from "./CreateReelModal";
import { Reel } from "../../types";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music,
  Plus,
  Send,
  MoreVertical,
  Film,
  Sparkles,
  X,
} from "lucide-react";

export function ReelsView() {
  const {
    reels,
    toggleLikeReel,
    toggleSaveReel,
    shareReel,
    incrementReelViews,
    comments,
    addReelComment,
    toggleLikeComment,
    isCreateReelOpen,
    setIsCreateReelOpen,
  } = useReels();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeReelId, setActiveReelId] = useState<string>("");
  const [muted, setMuted] = useState<boolean>(true);
  const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({});
  const [activeCommentsReel, setActiveCommentsReel] = useState<Reel | null>(null);
  const [commentInput, setCommentInput] = useState<string>("");
  const [showHeartBurst, setShowHeartBurst] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

  useEffect(() => {
    if (reels.length > 0 && !activeReelId) {
      setActiveReelId(reels[0].id);
      setPlayingMap({ [reels[0].id]: true });
    }
  }, [reels, activeReelId]);

  const handleTogglePlay = (reelId: string) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlayingMap((prev) => ({ ...prev, [reelId]: true }));
    } else {
      video.pause();
      setPlayingMap((prev) => ({ ...prev, [reelId]: false }));
    }
  };

  const handleDoubleTap = (reel: Reel) => {
    if (!reel.isLiked) {
      toggleLikeReel(reel.id);
    }
    setShowHeartBurst(reel.id);
    setTimeout(() => {
      setShowHeartBurst(null);
    }, 900);
  };

  const handleShare = (reel: Reel) => {
    shareReel(reel.id);
    navigator.clipboard?.writeText(window.location.href);
    showToast("Reel link copied to clipboard!", "spark");
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentsReel || !commentInput.trim()) return;
    addReelComment(activeCommentsReel.id, commentInput);
    setCommentInput("");
    showToast("Comment added!", "success");
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start select-none">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-20 w-full max-w-xl flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-[var(--bg-app)]/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Film size={20} className="text-primary" />
          <h2 className="font-display font-black text-lg tracking-tight text-slate-900 dark:text-white">
            Reels
          </h2>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateReelOpen(true)}
          className="gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold shadow-sm"
        >
          <Plus size={14} />
          Create Reel
        </Button>
      </div>

      {/* Main Reels Snap Container */}
      {reels.length > 0 ? (
        <div
          ref={containerRef}
          className="w-full max-w-[460px] h-[calc(100vh-8.5rem)] overflow-y-scroll snap-y snap-mandatory scrollbar-none flex flex-col items-center gap-8 py-2 px-3"
        >
          {reels.map((reel) => {
            const isPlaying = playingMap[reel.id] ?? true;
            const isBursting = showHeartBurst === reel.id;

            return (
              <div
                key={reel.id}
                className="relative w-full max-w-[400px] h-[calc(100vh-9.5rem)] max-h-[760px] snap-center rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 flex-shrink-0 flex items-center justify-center group"
                onDoubleClick={() => handleDoubleTap(reel)}
              >
                {/* Reel Video or Media */}
                {reel.videoUrl?.includes(".mp4") || reel.videoUrl?.includes(".webm") || reel.videoUrl?.startsWith("blob:") ? (
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current[reel.id] = el;
                    }}
                    src={reel.videoUrl}
                    loop
                    autoPlay
                    muted={muted}
                    playsInline
                    onClick={() => handleTogglePlay(reel.id)}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                ) : (
                  <img
                    src={reel.videoUrl || reel.thumbnailUrl}
                    alt={reel.caption}
                    className="w-full h-full object-cover"
                    onClick={() => handleTogglePlay(reel.id)}
                  />
                )}

                {/* Double Tap Heart Burst Animation */}
                {isBursting && (
                  <div className="absolute inset-0 grid place-items-center pointer-events-none z-30 animate-in zoom-in-50 fade-in duration-200">
                    <Heart
                      size={100}
                      className="text-white fill-rose-500 stroke-white drop-shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-bounce"
                    />
                  </div>
                )}

                {/* Top Video Controls: Mute & Filter tag */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
                  {reel.filterPreset && reel.filterPreset !== "Normal" && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/15 shadow">
                      <Sparkles size={11} className="text-amber-400" />
                      {reel.filterPreset}
                    </span>
                  )}
                  <button
                    onClick={() => setMuted(!muted)}
                    className="ml-auto p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition shadow active:scale-95"
                    title={muted ? "Unmute" : "Mute"}
                  >
                    {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>
                </div>

                {/* Vertical Creator Action Rail (Right side) */}
                <div className="absolute right-3 bottom-16 flex flex-col items-center gap-5 z-20">
                  {/* Creator Avatar */}
                  <div className="relative cursor-pointer group/avatar">
                    <Avatar
                      src={reel.author?.avatarUrl}
                      alt={reel.author?.displayName}
                      size="sm"
                      className="ring-2 ring-white shadow-md group-hover/avatar:scale-105 transition-transform"
                    />
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={() => toggleLikeReel(reel.id)}
                    className="flex flex-col items-center gap-1 text-white group/btn active:scale-90 transition-transform"
                  >
                    <div
                      className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
                        reel.isLiked
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                          : "bg-black/50 hover:bg-black/70 text-white"
                      }`}
                    >
                      <Heart
                        size={20}
                        className={reel.isLiked ? "fill-white" : ""}
                      />
                    </div>
                    <span className="text-[11px] font-bold drop-shadow">
                      {reel.likesCount}
                    </span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => setActiveCommentsReel(reel)}
                    className="flex flex-col items-center gap-1 text-white group/btn active:scale-90 transition-transform"
                  >
                    <div className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-colors">
                      <MessageCircle size={20} />
                    </div>
                    <span className="text-[11px] font-bold drop-shadow">
                      {reel.commentsCount}
                    </span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare(reel)}
                    className="flex flex-col items-center gap-1 text-white group/btn active:scale-90 transition-transform"
                  >
                    <div className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-colors">
                      <Share2 size={20} />
                    </div>
                    <span className="text-[11px] font-bold drop-shadow">
                      {reel.sharesCount}
                    </span>
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleSaveReel(reel.id)}
                    className="flex flex-col items-center gap-1 text-white group/btn active:scale-90 transition-transform"
                  >
                    <div
                      className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
                        reel.isSaved
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                          : "bg-black/50 hover:bg-black/70 text-white"
                      }`}
                    >
                      <Bookmark
                        size={20}
                        className={reel.isSaved ? "fill-white" : ""}
                      />
                    </div>
                  </button>

                  {/* Spinning Audio Vinyl Disc */}
                  <div className="relative h-9 w-9 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-950 p-1 ring-2 ring-white/40 shadow-xl animate-spin [animation-duration:4s]">
                    <div className="h-full w-full rounded-full bg-zinc-900 grid place-items-center">
                      <Music size={12} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Bottom Overlay: Creator info, caption, audio marquee */}
                <div className="absolute bottom-0 left-0 right-14 p-4 z-20 text-white bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 pointer-events-none">
                  <div className="flex items-center gap-2 mb-2 pointer-events-auto">
                    <span className="font-display font-bold text-xs hover:underline cursor-pointer">
                      @{reel.author?.username || "creator"}
                    </span>
                    <button className="px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-[10px] font-bold transition">
                      Follow
                    </button>
                  </div>

                  {/* Caption */}
                  {reel.caption && (
                    <p className="text-xs text-white/95 line-clamp-2 leading-relaxed mb-2 drop-shadow pointer-events-auto">
                      {reel.caption}
                    </p>
                  )}

                  {/* Audio Marquee */}
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-white/90 drop-shadow">
                    <Music size={12} className="text-primary flex-shrink-0 animate-pulse" />
                    <span className="truncate">
                      {reel.audioTrack?.title || "Original Audio"} · {reel.audioTrack?.artist || reel.author?.displayName}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md my-auto">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-blue-100 dark:bg-primary/20 text-primary border border-blue-200 dark:border-primary/30 shadow-xl mb-5 animate-pulse">
            <Film size={36} />
          </div>
          <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mb-2">
            No Reels Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
            Be the first pioneer to publish a vertical 9:16 video or photo Reel. Enjoy instant background uploads and custom Instagram filters.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsCreateReelOpen(true)}
            className="gap-2 font-bold px-6 shadow-md rounded-2xl"
          >
            <Plus size={16} />
            Create Your First Reel
          </Button>
        </div>
      )}

      {/* Slide-over Comments Modal */}
      {activeCommentsReel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] h-[550px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-primary" />
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Comments ({comments[activeCommentsReel.id]?.length || 0})
                </h4>
              </div>
              <button
                onClick={() => setActiveCommentsReel(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Comments Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {(comments[activeCommentsReel.id] || []).length > 0 ? (
                comments[activeCommentsReel.id].map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={c.author?.avatarUrl}
                        alt={c.author?.displayName}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {c.author?.displayName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {c.createdAt}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-zinc-300 mt-1 leading-relaxed">
                          {c.content}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleLikeComment(activeCommentsReel.id, c.id)}
                      className={`flex flex-col items-center gap-0.5 p-1 transition ${
                        c.isLiked ? "text-rose-500 font-bold" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Heart size={14} className={c.isLiked ? "fill-rose-500" : ""} />
                      {c.likesCount > 0 && (
                        <span className="text-[9px]">{c.likesCount}</span>
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No comments yet. Start the conversation!
                </div>
              )}
            </div>

            {/* Add Comment Input Bar */}
            <form
              onSubmit={handleAddCommentSubmit}
              className="p-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/40"
            >
              <Avatar
                src={currentUser?.avatarUrl}
                alt={currentUser?.displayName}
                size="sm"
              />
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a thoughtful comment..."
                className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full px-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!commentInput.trim()}
                className="rounded-full px-3 py-2"
              >
                <Send size={13} />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Create Reel Modal */}
      <CreateReelModal
        isOpen={isCreateReelOpen}
        onClose={() => setIsCreateReelOpen(false)}
      />
    </div>
  );
}
