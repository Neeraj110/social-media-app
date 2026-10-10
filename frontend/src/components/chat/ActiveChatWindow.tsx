"use client";

import React, { useState, useEffect, useRef } from "react";
import { Conversation, DirectMessage, User } from "../../types";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../ui/Badge";
import {
  Phone,
  Video,
  Info,
  Send,
  Image as ImageIcon,
  Smile,
  Mic,
  Reply,
  X,
  CheckCheck,
  Check,
  Sparkles,
  UploadCloud,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useBackgroundUploader, BackgroundUploadTask } from "../../lib/backgroundUploader";

interface ActiveChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
  onSelectUser?: (user: User) => void;
}

export function ActiveChatWindow({
  conversation,
  onBack,
  onSelectUser,
}: ActiveChatWindowProps) {
  const { sendMessage, activeMessages, isTyping } = useChat();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { startUpload, resolveMediaUrl } = useBackgroundUploader();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const recipient =
    conversation.participants.find((p) => p.id !== currentUser.id) ||
    conversation.participants[0];

  const [inputMessage, setInputMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<DirectMessage | null>(null);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [chatUploadTask, setChatUploadTask] = useState<BackgroundUploadTask | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, isTyping]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const task = startUpload(file, { folder: "messages" });
      setChatUploadTask(task);
      setImageUrlInput(task.previewUrl);
      setShowImagePrompt(true);
      showToast("⚡ Photo background sync started", "info");
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() && !imageUrlInput.trim() && !chatUploadTask) return;

    setIsSending(true);

    try {
      let finalMediaUrl = imageUrlInput.trim() || undefined;
      if (chatUploadTask) {
        finalMediaUrl = await resolveMediaUrl(chatUploadTask.id);
      }

      sendMessage(
        inputMessage.trim(),
        replyingTo
          ? { id: replyingTo.id, senderName: replyingTo.sender.displayName, text: replyingTo.text }
          : undefined,
        finalMediaUrl
      );

      setInputMessage("");
      setImageUrlInput("");
      setChatUploadTask(null);
      setReplyingTo(null);
      setShowImagePrompt(false);
      setIsSending(false);
    } catch (err: any) {
      setIsSending(false);
      showToast("Failed to send message: " + err?.message, "error");
    }
  };

  const handleVoiceCall = () => {
    showToast(`Connecting encrypted voice link to ${recipient.displayName}...`, "info");
  };

  const handleVideoCall = () => {
    showToast(`Starting spatial video stream with ${recipient.displayName}...`, "info");
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[var(--bg-app)] select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Top Chat Header */}
      <div className="h-16 px-4 border-b border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between bg-white/90 dark:bg-[var(--bg-app)]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white p-1 transition"
            >
              ←
            </button>
          )}

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onSelectUser?.(recipient)}
          >
            <Avatar
              src={recipient.avatarUrl}
              alt={recipient.displayName}
              size="md"
              status={recipient.status}
              isVerified={recipient.isVerified}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {recipient.displayName}
                </span>
                {recipient.isVerified && <VerifiedBadge size={14} />}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                {recipient.status === "online" ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 presence-dot" />
                    Active now
                  </span>
                ) : (
                  recipient.lastSeen || "Offline"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Header Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleVoiceCall}
            className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition active:scale-95"
            title="Start Audio Call"
          >
            <Phone size={16} />
          </button>
          <button
            onClick={handleVideoCall}
            className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition active:scale-95"
            title="Start Video Stream"
          >
            <Video size={16} />
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeMessages.map((msg) => {
          const isMe = msg.sender.id === currentUser.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {!isMe && (
                  <Avatar
                    src={msg.sender.avatarUrl}
                    alt={msg.sender.displayName}
                    size="xs"
                  />
                )}

                <div className="relative group">
                  {/* Reply Reference Bubble */}
                  {msg.replyTo && (
                    <div
                      className={`text-[10px] px-3 py-1 mb-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.05] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 ${
                        isMe ? "ml-auto" : "mr-auto"
                      }`}
                    >
                      <Reply size={10} className="text-primary" />
                      <span className="font-semibold">{msg.replyTo.senderName}:</span>
                      <span className="truncate max-w-[150px]">{msg.replyTo.text}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs break-words ${
                      isMe
                        ? "bg-primary text-white font-medium shadow-xs rounded-br-xs"
                        : "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/80 dark:border-white/[0.08] shadow-xs rounded-bl-xs"
                    }`}
                  >
                    {/* Media image if present */}
                    {msg.mediaUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 max-h-56">
                        <img
                          src={msg.mediaUrl}
                          alt="Attachment"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <p className="whitespace-pre-line select-text">{msg.text}</p>
                  </div>

                  {/* Hover Quick Actions (Reply) */}
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white shadow-xs ${
                      isMe ? "-left-8" : "-right-8"
                    }`}
                    title="Reply"
                  >
                    <Reply size={12} />
                  </button>
                </div>
              </div>

              {/* Message Footer: Timestamp & Read receipts */}
              <div
                className={`flex items-center gap-1 text-[9px] text-slate-400 dark:text-zinc-500 mt-1 px-1 ${
                  isMe ? "justify-end" : "justify-start pl-8"
                }`}
              >
                <span>{msg.createdAt}</span>
                {isMe && (
                  <span>
                    {msg.status === "read" ? (
                      <CheckCheck size={11} className="text-primary" />
                    ) : (
                      <Check size={11} className="text-slate-400 dark:text-zinc-500" />
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Peer Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <Avatar src={recipient.avatarUrl} alt="" size="xs" />
            <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Replying Banner in input dock */}
      {replyingTo && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-primary/10 border-t border-blue-200 dark:border-primary/20 flex items-center justify-between text-xs text-slate-700 dark:text-zinc-300">
          <div className="flex items-center gap-2 truncate">
            <Reply size={14} className="text-primary shrink-0" />
            <span className="truncate">
              Replying to: <em>&quot;{replyingTo.text}&quot;</em>
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Media Attachment Preview / URL Drawer */}
      {showImagePrompt && (
        <div className="p-3 bg-slate-50 dark:bg-[var(--bg-panel)] border-t border-slate-200/80 dark:border-white/[0.08] space-y-2 animate-in slide-in-from-bottom duration-150">
          {chatUploadTask && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                <img src={chatUploadTask.previewUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {chatUploadTask.fileName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                  {chatUploadTask.status === "ready" ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={11} strokeWidth={3} /> Ready (0ms)
                    </span>
                  ) : (
                    <span className="text-sky-500 font-semibold flex items-center gap-1 animate-pulse">
                      <Zap size={11} fill="currentColor" /> Uploading {chatUploadTask.progress}%
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setChatUploadTask(null);
                  setImageUrlInput("");
                }}
                className="text-rose-400 hover:text-rose-500 p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => {
                setImageUrlInput(e.target.value);
                setChatUploadTask(null);
              }}
              placeholder="Or paste image URL..."
              className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-bold flex items-center gap-1"
            >
              <UploadCloud size={13} /> Browse
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImagePrompt(false);
                setChatUploadTask(null);
                setImageUrlInput("");
              }}
              className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-2 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bottom Message Dock */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[var(--bg-app)] flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] border-transparent transition active:scale-95"
          title="Upload Photo (Instant Background Sync)"
        >
          <ImageIcon size={18} className="text-emerald-500" />
        </button>

        <button
          type="button"
          onClick={() => setShowImagePrompt(!showImagePrompt)}
          className={`p-2 rounded-xl border transition active:scale-95 ${
            showImagePrompt
              ? "bg-blue-50 text-primary border-blue-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
              : "text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] border-transparent"
          }`}
          title="Attach Image via URL"
        >
          <UploadCloud size={18} />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message ${recipient.displayName}...`}
            className="w-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-full pl-4 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
          />
          <button
            type="button"
            onClick={() => setInputMessage((p) => `${p}✨ `)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 hover:text-amber-500 transition"
          >
            <Smile size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => showToast("Voice note recording simulated", "info")}
          className="p-2 rounded-xl text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition active:scale-95"
          title="Send Voice Note"
        >
          <Mic size={18} />
        </button>

        <button
          type="submit"
          disabled={isSending || (!inputMessage.trim() && !imageUrlInput.trim() && !chatUploadTask)}
          className="grid h-9 w-9 place-items-center rounded-full bg-primary hover:bg-primary-hover text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition shadow-xs font-bold"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
