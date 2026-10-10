"use client";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { ThemeProvider } from "./ThemeContext";
import { ToastProvider } from "./ToastContext";
import { AuthProvider } from "./AuthContext";
import { PostProvider } from "./PostContext";
import { CommentProvider } from "./CommentContext";
import { StoryProvider } from "./StoryContext";
import { ReelProvider } from "./ReelContext";
import { ChatProvider } from "./ChatContext";
import { SocialProvider } from "./SocialContext";
import { NotificationProvider } from "./NotificationContext";
import { AIChatProvider } from "./AIChatContext";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <SocialProvider>
              <PostProvider>
                <CommentProvider>
                  <StoryProvider>
                    <ReelProvider>
                      <ChatProvider>
                        <NotificationProvider>
                          <AIChatProvider>{children}</AIChatProvider>
                        </NotificationProvider>
                      </ChatProvider>
                    </ReelProvider>
                  </StoryProvider>
                </CommentProvider>
              </PostProvider>
            </SocialProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

