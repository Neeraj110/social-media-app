"use client";

import React, { useState, useEffect } from "react";
import { useStory } from "../../context/StoryContext";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useToast } from "../../context/ToastContext";
import { StoryItem, User } from "../../types";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../ui/Badge";

const STORY_DURATION = 5000; // 5 seconds per story

interface StoryViewerModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  stories?: StoryItem[];
  user?: User;
}

export function StoryViewerModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  stories: propStories,
  user: propUser,
}: StoryViewerModalProps = {}) {
  const {
    activeStoryGroup,
    activeStoryIndex,
    isViewerOpen: contextIsOpen,
    closeStoryViewer,
    nextStory,
    prevStory,
  } = useStory();
  const { currentUser } = useAuth();
  const { startNewConversation, sendMessage } = useChat();
  const { showToast } = useToast();

  const isVisible = propIsOpen !== undefined ? propIsOpen : contextIsOpen;
  const handleClose = propOnClose || closeStoryViewer;

  const activeStories = propStories || activeStoryGroup?.stories || [];
  const activeUser = propUser || activeStoryGroup?.user;
  const currentStory = activeStories[activeStoryIndex] || activeStories[0];
  const isOwner = activeUser?.id === currentUser.id;

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewersSheet, setShowViewersSheet] = useState(false);
  const [replyText, setReplyText] = useState("");

  // Story Progress Timer
  useEffect(() => {
    if (!isVisible || !currentStory || isPaused) return;

    const interval = 50; // tick every 50ms
    const totalSteps = STORY_DURATION / interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 100 / totalSteps;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible, activeStoryIndex, currentStory, isPaused, nextStory]);

  // Reset progress on story change
  useEffect(() => {
    setProgress(0);
  }, [activeStoryIndex, activeStoryGroup]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") nextStory();
      if (e.key === "ArrowLeft") prevStory();
      if (e.key === " ") setIsPaused((p) => !p);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleClose, nextStory, prevStory]);

  if (!isVisible || !activeUser || !currentStory) return null;

  const handleSendReaction = (emoji: string) => {
    if (isOwner) return;
    startNewConversation(activeUser);
    sendMessage(`Reacted ${emoji} to your story!`);
    showToast(`Sent ${emoji} to ${activeUser.displayName}`, "success");
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isOwner) return;
    startNewConversation(activeUser);
    sendMessage(`Replied to story: "${replyText.trim()}"`);
    setReplyText("");
    showToast(`Reply sent to ${activeUser.displayName}`, "success");
  };

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.35) {
      prevStory();
    } else {
      nextStory();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl select-none animate-in fade-in duration-200">
      {/* Desktop Prev / Next Big Buttons */}
      <button
        onClick={prevStory}
        className="hidden md:grid absolute left-8 top-1/2 -translate-y-1/2 h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition z-30 active:scale-95"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextStory}
        className="hidden md:grid absolute right-8 top-1/2 -translate-y-1/2 h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition z-30 active:scale-95"
      >
        <ChevronRight size={24} />
      </button>

      {/* Main Story Phone Stage */}
      <div
        className="relative w-full max-w-[420px] h-full sm:h-[85vh] sm:max-h-[780px] bg-zinc-950 sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Story Background Media / Gradient */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={handleScreenClick}
        >
          {currentStory.mediaUrl ? (
            <img
              src={currentStory.mediaUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center p-8 bg-gradient-to-br ${
                currentStory.backgroundGradient || "from-teal-800 via-zinc-900 to-black"
              }`}
            >
              <p className="text-xl font-display font-black text-white text-center drop-shadow-md leading-relaxed">
                {currentStory.textOverlay || currentStory.caption}
              </p>
            </div>
          )}

          {/* Gradient Scrims */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/85 pointer-events-none" />
        </div>

        {/* Top Header Layer: Progress Bars & Author */}
        <div className="relative z-20 p-3 sm:p-4 space-y-3 pointer-events-auto">
          {/* Segmented Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {activeStories.map((story, idx) => {
              let fillWidth = "0%";
              if (idx < activeStoryIndex) fillWidth = "100%";
              else if (idx === activeStoryIndex) fillWidth = `${progress}%`;

              return (
                <div
                  key={story.id || idx}
                  className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all duration-75"
                    style={{ width: fillWidth }}
                  />
                </div>
              );
            })}
          </div>

          {/* Author info & Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar
                src={activeUser.avatarUrl}
                alt={activeUser.displayName}
                size="sm"
                isVerified={activeUser.isVerified}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white drop-shadow">
                    {activeUser.displayName}
                  </span>
                  {activeUser.isVerified && (
                    <VerifiedBadge size={14} />
                  )}
                </div>
                <span className="text-[10px] text-zinc-300 font-medium">
                  {currentStory.createdAt || 'Recently'}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Text Overlay on image if present */}
        {currentStory.textOverlay && currentStory.mediaUrl && (
          <div className="relative z-10 my-auto px-6 text-center pointer-events-none">
            <div className="inline-block px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-sm font-bold text-white shadow-lg">
              {currentStory.textOverlay}
            </div>
          </div>
        )}

        {/* Bottom Interactive Area */}
        <div className="relative z-20 mt-auto p-4 space-y-3 pointer-events-auto">
          {/* If Owner: Viewers summary */}
          {isOwner ? (
            <button
              onClick={() => setShowViewersSheet(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white text-xs font-semibold transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-primary" />
                <span>
                  {(currentStory.viewers && currentStory.viewers.length) || 12} people viewed this spark
                </span>
              </div>
              <span className="text-[11px] text-primary font-bold">Details →</span>
            </button>
          ) : (
            <>
              {/* Quick emoji reactions */}
              <div className="flex items-center justify-around py-1">
                {["❤️", "🔥", "👏", "🚀", "😍", "✨"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendReaction(emoji)}
                    className="text-xl hover:scale-125 transition-transform active:scale-95 filter drop-shadow"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Reply Input Dock */}
              <form
                onSubmit={handleSendReply}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${activeUser.displayName.split(" ")[0]}...`}
                  className="flex-1 glass-input rounded-full px-4 py-2 text-xs text-white placeholder:text-zinc-400 bg-black/50 border-white/20 focus:border-primary/50 outline-none"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="grid h-9 w-9 place-items-center rounded-full bg-primary text-zinc-950 font-bold disabled:opacity-40 transition shadow-sm active:scale-95"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          )}
        </div>

        {/* Viewers Bottom Sheet Modal (For Story Owner) */}
        {showViewersSheet && (
          <div className="absolute inset-x-0 bottom-0 max-h-[70%] bg-zinc-900/95 backdrop-blur-2xl rounded-t-3xl border-t border-white/15 p-4 z-40 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Eye size={15} className="text-primary" />
                <span>Story Insights & Viewers</span>
              </div>
              <button
                onClick={() => setShowViewersSheet(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto hide-scroll">
              {[
                { name: "Elena Rostova", user: "@elena", time: "2m ago" },
                { name: "Marcus Vance", user: "@marcus", time: "14m ago" },
                { name: "Sarah Lin", user: "@sarah", time: "28m ago" },
                { name: "Kai Jenkins", user: "@kai", time: "1h ago" },
                { name: "Amara Li", user: "@amara", time: "2h ago" },
              ].map((v, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary text-zinc-950 font-bold text-xs grid place-items-center">
                      {v.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {v.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">{v.user}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500">{v.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
