"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAIChat } from "../../context/AIChatContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { GlassCard } from "../ui/GlassCard";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import {
  Sparkles,
  Bot,
  Plus,
  Send,
  Trash2,
  Copy,
  Check,
  Share2,
  Zap,
} from "lucide-react";

interface AICopilotViewProps {
  onInsertToPost?: (content: string) => void;
}

export function AICopilotView({ onInsertToPost }: AICopilotViewProps) {
  const {
    sessions,
    activeSession,
    createNewSession,
    selectSession,
    deleteSession,
    sendMessage,
    isGenerating,
    promptTemplates,
  } = useAIChat();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [inputPrompt, setInputPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isGenerating]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputPrompt.trim() || isGenerating) return;
    sendMessage(inputPrompt.trim());
    setInputPrompt("");
  };

  const handleApplyTemplate = (templatePrompt: string) => {
    sendMessage(templatePrompt);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("AI response copied to clipboard", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertPost = (text: string) => {
    onInsertToPost?.(text);
    showToast("Transferred to Post Composer", "success");
  };

  return (
    <div className="h-[calc(100vh-5rem)] pb-16 lg:pb-0 select-none">
      <GlassCard className="h-full overflow-hidden flex bg-white dark:bg-[#0d0d0d] border-slate-200/80 dark:border-white/[0.08] rounded-3xl" elevated>
        {/* Left AI Sessions Sidebar */}
        <div className="w-[280px] shrink-0 border-r border-slate-200/80 dark:border-white/[0.08] flex-col hidden md:flex bg-slate-50/70 dark:bg-[#0f0f0f]">
          {/* Top New Chat Button */}
          <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.06]">
            <Button
              variant="primary"
              size="md"
              onClick={() => createNewSession()}
              className="w-full py-2.5 rounded-xl text-xs font-bold gap-2 shadow-xs"
            >
              <Plus size={15} strokeWidth={2.5} />
              New Conversation
            </Button>
          </div>

          {/* Model Status Badge */}
          <div className="px-4 py-2.5 bg-slate-100/60 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.04] flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
              <Zap size={13} className="text-primary" />
              Engine
            </span>
            <span className="text-primary font-mono text-[10px] font-semibold bg-blue-50 dark:bg-primary/10 px-2 py-0.5 rounded-md border border-blue-200 dark:border-primary/20">
              Copilot 4.5 Neural
            </span>
          </div>

          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto hide-scroll p-2 space-y-1">
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Recent Dialogs
            </div>

            {sessions.map((session) => {
              const isSelected = activeSession?.id === session.id;
              return (
                <div
                  key={session.id}
                  onClick={() => selectSession(session.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition text-xs ${
                    isSelected
                      ? "bg-blue-50/80 dark:bg-[#1a1a1a] text-primary dark:text-white border border-blue-200 dark:border-primary/30 shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sparkles
                      size={13}
                      className={isSelected ? "text-primary" : "text-slate-400 dark:text-zinc-500"}
                    />
                    <span className="truncate font-medium">{session.title}</span>
                  </div>

                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 p-1 transition"
                      title="Delete Session"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Chat Interface */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0a0a0a]">
          {/* Header */}
          <div className="h-16 px-5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-white dark:bg-[#121212] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-primary/20 to-purple-500/20 text-primary border border-primary/30 shadow-xs">
                <Bot size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Nexus AI Copilot
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Neural Engine v4.5 • Contextual Creativity & Code
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] px-2.5 py-1 rounded-xl">
                <Zap size={12} className="text-primary" />
                Copilot 4.5 Neural
              </span>

              <button
                onClick={() => createNewSession()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-hover transition active:scale-95 shadow-xs"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span className="hidden sm:inline">New Session</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto hide-scroll p-4 space-y-6 bg-slate-50/30 dark:bg-transparent">
            {/* If fresh conversation: show greeting & prompt templates */}
            {activeSession && activeSession.messages.length === 0 && (
              <div className="max-w-2xl mx-auto my-auto pt-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid h-16 w-16 place-items-center mx-auto rounded-3xl bg-blue-50 dark:bg-primary/10 text-primary border border-blue-200 dark:border-primary/20 shadow-xs">
                  <Sparkles size={28} />
                </div>

                <div>
                  <h2 className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tight">
                    How can Copilot assist you today?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                    Generate post sparks, summarize your feed, draft technical shaders, or refine creative ideas.
                  </p>
                </div>

                {/* Prompt Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {promptTemplates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => handleApplyTemplate(tmpl.prompt)}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[var(--bg-panel)] hover:bg-slate-50 dark:hover:bg-[var(--bg-raised)] border border-slate-200/80 dark:border-white/[0.08] hover:border-primary/40 cursor-pointer transition group shadow-xs active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-base">{tmpl.icon}</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition">
                          {tmpl.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Render Chat Messages */}
            {activeSession?.messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 max-w-3xl ${
                    isUser ? "ml-auto justify-end" : "mr-auto"
                  }`}
                >
                  {!isUser && (
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 dark:bg-primary/15 text-primary border border-blue-200 dark:border-primary/25 shrink-0 shadow-xs mt-1">
                      <Bot size={16} />
                    </div>
                  )}

                  <div className="space-y-1.5 min-w-0">
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? "bg-primary text-white font-medium shadow-xs rounded-tr-xs"
                          : "bg-white dark:bg-[var(--bg-panel)] text-slate-800 dark:text-zinc-200 border border-slate-200/80 dark:border-white/[0.08] shadow-xs rounded-tl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-line select-text font-normal">
                        {msg.content}
                      </p>
                    </div>

                    {/* AI Message Action Bar (Copy & Insert into Post) */}
                    {!isUser && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-zinc-500 pl-1">
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition"
                        >
                          {copiedId === msg.id ? (
                            <Check size={11} className="text-primary" />
                          ) : (
                            <Copy size={11} />
                          )}
                          <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                        </button>

                        <span>•</span>

                        <button
                          onClick={() => handleInsertPost(msg.content)}
                          className="flex items-center gap-1 text-primary hover:text-primary-hover font-bold transition"
                        >
                          <Share2 size={11} />
                          <span>Insert into New Post</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <Avatar
                      src={currentUser.avatarUrl}
                      alt=""
                      size="sm"
                      className="mt-1"
                    />
                  )}
                </div>
              );
            })}

            {/* Streaming Indicator */}
            {isGenerating && (
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 dark:bg-primary/15 text-primary border border-blue-200 dark:border-primary/25 shrink-0 shadow-xs">
                  <Bot size={16} />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[var(--bg-panel)] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                    Nexus Copilot is thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Prompt Input Dock */}
          <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#121212]">
            <form onSubmit={handleSend} className="relative max-w-3xl mx-auto">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Nexus Copilot anything (e.g. Generate 3 post captions on Spatial UI, or summarize feed)..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl pl-4 pr-12 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary/50 focus:bg-white dark:focus:bg-[#1e1e1e] resize-none outline-none transition"
              />

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isGenerating}
                className="absolute right-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-xl bg-primary hover:bg-primary-hover text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition shadow-xs font-bold"
              >
                <Send size={14} />
              </button>
            </form>
            <div className="text-center text-[10px] text-slate-400 dark:text-zinc-600 mt-2 font-mono">
              Nexus Copilot v4.5 Neural Architecture • Encrypted session
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
