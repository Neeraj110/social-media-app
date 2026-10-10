"use client";

import React, { createContext, useContext, useState } from "react";
import { AIChatSession, AIChatMessage, AIPromptTemplate } from "../types";

interface AIChatContextType {
  sessions: AIChatSession[];
  activeSession: AIChatSession | null;
  activeSessionId: string;
  isGenerating: boolean;
  promptTemplates: AIPromptTemplate[];
  selectSession: (id: string) => void;
  createNewSession: (title?: string) => string;
  deleteSession: (id: string) => void;
  sendMessage: (content: string) => void;
  runPromptTemplate: (template: AIPromptTemplate) => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export function AIChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<AIChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("session_1");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  const selectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const createNewSession = (title = "New Nexus Chat"): string => {
    const newSession: AIChatSession = {
      id: 'session_' + Date.now(),
      title,
      mode: 'social',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      messages: [
        {
          id: 'm_init_' + Date.now(),
          sender: 'assistant',
          content: `👋 Hello! I am **Nexus Copilot**, your autonomous network intelligence layer. I can assist you with:
- ✍️ Crafting viral post captions & technical breakdowns
- 📊 Summarizing your live social feed & trending discussions
- 🤝 Finding relevant creators & collaborators
- 💡 Brainstorming multi-part content series

What would you like to build or explore today?`,
          timestamp: 'Just now',
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const sendMessage = (content: string) => {
    if (!activeSession) return;

    const userMsg: AIChatMessage = {
      id: 'msg_u_' + Date.now(),
      sender: 'user',
      content,
      timestamp: 'Just now',
    };

    const targetSessionId = activeSession.id;

    // Append user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetSessionId
          ? {
              ...s,
              updatedAt: 'Just now',
              messages: [...s.messages, userMsg],
            }
          : s
      )
    );

    setIsGenerating(true);

    // Simulate AI response stream
    setTimeout(() => {
      let aiResponseText = `Here is what I synthesized based on your input:\n\n`;

      if (content.toLowerCase().includes('caption') || content.toLowerCase().includes('post')) {
        aiResponseText += `### ✨ Generated Caption Variations:\n\n1. **High Impact**: "Revolutionizing spatial canvases with 120fps Kinetic Glass Obsidian shaders. The future of interactive design is here. 🌌⚡ #SpatialComputing #Nexus"\n2. **Casual & Witty**: "Stayed up until 4am tuning sub-pixel light refractions so you don't have to. Rate the setup? 👇 #DeskLife #CreativeCoding"\n3. **Community Poll**: "Are design tokens officially replacing static UI kits for good? Drop your thoughts below! 🗳️"`;
      } else if (content.toLowerCase().includes('summar') || content.toLowerCase().includes('feed')) {
        aiResponseText += `### 📊 Live Feed Summary:\n- **Top Trend**: #SpatialComputing (+18.4k posts)\n- **Key Discussion**: Elena Rostova released the WebGL 2.0 Gaussian blur pipeline optimization.\n- **Network Pulse**: 5 mutual friends are currently active.`;
      } else if (content.toLowerCase().includes('friend') || content.toLowerCase().includes('creator')) {
        aiResponseText += `### 🤝 Recommended Creators to Connect With:\n1. **Amara Li** (@amarali) - Quantum computing visualizer & WebGPU researcher.\n2. **Kai Jenkins** (@kaijenkins) - Spatial 3D audio engineer.\n3. **Sarah Lin** (@sarahlin) - Lead Design Systems Director at Prism.`;
      } else {
        aiResponseText += `I processed your request regarding *"__${content.slice(0, 40)}..."__* and analyzed the latest Nexus network graph.\n\nEverything is indexed and optimized for real-time engagement. Would you like me to convert this into a draft post or prepare an automated thread?`;
      }

      const aiMsg: AIChatMessage = {
        id: 'msg_a_' + Date.now(),
        sender: 'assistant',
        content: aiResponseText,
        timestamp: 'Just now',
        suggestedActions: [
          {
            label: 'Insert into New Post Composer',
            action: 'insert_post',
            payload: aiResponseText.replace(/###/g, '').slice(0, 280),
          },
          {
            label: 'Refine with more technical depth',
            action: 'send_prompt',
            payload: 'Provide a deeper technical breakdown of the WebGL shader mechanics.',
          },
        ],
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? {
                ...s,
                messages: [...s.messages, aiMsg],
              }
            : s
        )
      );

      setIsGenerating(false);
    }, 1200);
  };

  const runPromptTemplate = (template: AIPromptTemplate) => {
    sendMessage(template.prompt);
  };

  return (
    <AIChatContext.Provider
      value={{
        sessions,
        activeSession,
        activeSessionId,
        isGenerating,
        promptTemplates: [],
        selectSession,
        createNewSession,
        deleteSession,
        sendMessage,
        runPromptTemplate,
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error("useAIChat must be used within an AIChatProvider");
  }
  return context;
}
