"use client";

import React, { useState } from "react";
import { User, AppView } from "../../types";
import { useChat } from "../../context/ChatContext";
import { ConversationList } from "./ConversationList";
import { ActiveChatWindow } from "./ActiveChatWindow";
import { NewChatModal } from "./NewChatModal";
import { GlassCard } from "../ui/GlassCard";
import { MessageSquare, Sparkles } from "lucide-react";

interface DirectMessagesViewProps {
  onNavigate?: (view: AppView) => void;
  onSelectUser?: (user: User) => void;
  onOpenReport?: (user: User) => void;
  onOpenBlock?: (user: User) => void;
}

export function DirectMessagesView({
  onNavigate,
  onSelectUser,
  onOpenReport,
  onOpenBlock,
}: DirectMessagesViewProps) {
  const { conversations, activeConversation, selectConversation } = useChat();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  return (
    <div className="h-[calc(100vh-5rem)] pb-16 lg:pb-0 select-none">
      <GlassCard className="h-full overflow-hidden flex bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]" elevated>
        {/* Left Conversation List (Hidden on mobile if conversation is selected) */}
        <div
          className={`w-full lg:w-[340px] xl:w-[380px] shrink-0 border-r border-slate-200/80 dark:border-white/[0.06] flex flex-col ${
            activeConversation ? "hidden lg:flex" : "flex"
          }`}
        >
          <ConversationList
            selectedConversationId={activeConversation?.id}
            onSelectConversation={(conv) => selectConversation(conv.id)}
            onOpenNewChat={() => setIsNewChatOpen(true)}
          />
        </div>

        {/* Right Active Chat Window */}
        <div
          className={`flex-1 flex flex-col ${
            !activeConversation ? "hidden lg:flex" : "flex"
          }`}
        >
          {activeConversation ? (
            <ActiveChatWindow
              conversation={activeConversation}
              onBack={() => selectConversation("")}
              onSelectUser={onSelectUser}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-slate-50/50 dark:bg-[var(--bg-app)]">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 dark:bg-primary/10 text-primary border border-blue-200 dark:border-primary/20 mb-4 shadow-xs">
                <MessageSquare size={30} />
              </div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">
                Encrypted Direct Threads
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
                Connect directly with peers, exchange ideas, and collaborate in real time with high-fidelity messaging.
              </p>
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs active:scale-95 transition"
              >
                Start New Thread
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* New Conversation Modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectConversation={(conv) => selectConversation(conv.id)}
      />
    </div>
  );
}
