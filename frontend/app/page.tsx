"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { AppView, User } from "../src/types";
import { useAuth } from "../src/context/AuthContext";
import { LeftSidebar } from "../src/components/layout/LeftSidebar";
import { RightRail } from "../src/components/layout/RightRail";
import { MobileBottomNav } from "../src/components/layout/MobileBottomNav";
import { ViewSkeleton, ProfileSkeleton } from "../src/components/ui/Skeleton";
import { Heart, Search } from "lucide-react";

// Lazy-loaded Views (Code-split into separate on-demand chunks)
const LandingAuthView = dynamic(
  () => import("../src/components/auth/LandingAuthView").then((mod) => mod.LandingAuthView),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen grid place-items-center bg-[var(--bg-app)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ),
  }
);

const FeedView = dynamic(
  () => import("../src/components/feed/FeedView").then((mod) => mod.FeedView),
  { ssr: false, loading: () => <ViewSkeleton /> }
);

const ExploreView = dynamic(
  () => import("../src/components/explore/ExploreView").then((mod) => mod.ExploreView),
  { ssr: false, loading: () => <ViewSkeleton /> }
);

const ReelsView = dynamic(
  () => import("../src/components/reels/ReelsView").then((mod) => mod.ReelsView),
  { ssr: false, loading: () => <ViewSkeleton /> }
);

const DirectMessagesView = dynamic(
  () => import("../src/components/chat/DirectMessagesView").then((mod) => mod.DirectMessagesView),
  { ssr: false, loading: () => <ViewSkeleton /> }
);

const FriendsView = dynamic(
  () => import("../src/components/friends/FriendsView").then((mod) => mod.FriendsView),
  { ssr: false, loading: () => <ViewSkeleton /> }
);

const AICopilotView = dynamic(
  () => import("../src/components/ai/AICopilotView").then((mod) => mod.AICopilotView),
  { ssr: false, loading: () => <ViewSkeleton /> }
);

const BookmarksView = dynamic(
  () => import("../src/components/bookmarks/BookmarksView").then((mod) => mod.BookmarksView),
  { ssr: false, loading: () => <ViewSkeleton /> }
);

const NotificationsView = dynamic(
  () => import("../src/components/notifications/NotificationsView").then((mod) => mod.NotificationsView),
  { ssr: false, loading: () => <ViewSkeleton /> }
);

const ProfileView = dynamic(
  () => import("../src/components/profile/ProfileView").then((mod) => mod.ProfileView),
  { ssr: false, loading: () => <ProfileSkeleton /> }
);

const SettingsView = dynamic(
  () => import("../src/components/settings/SettingsView").then((mod) => mod.SettingsView),
  { ssr: false, loading: () => <ViewSkeleton /> }
);

// Lazy-loaded Modals (Loaded only when user opens them)
const CreatePostModal = dynamic(
  () => import("../src/components/feed/CreatePostModal").then((mod) => mod.CreatePostModal),
  { ssr: false }
);

const AuthModal = dynamic(
  () => import("../src/components/auth/AuthModal").then((mod) => mod.AuthModal),
  { ssr: false }
);

const ReportModal = dynamic(
  () => import("../src/components/modals/ReportModal").then((mod) => mod.ReportModal),
  { ssr: false }
);

const BlockUserModal = dynamic(
  () => import("../src/components/modals/BlockUserModal").then((mod) => mod.BlockUserModal),
  { ssr: false }
);

const EditProfileModal = dynamic(
  () => import("../src/components/profile/EditProfileModal").then((mod) => mod.EditProfileModal),
  { ssr: false }
);


export default function HomePage() {
  const { currentUser, isAuthenticated } = useAuth();

  const [currentView, setCurrentView] = useState<AppView>("feed");
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);

  // Modals state
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<User | null>(null);
  const [blockTarget, setBlockTarget] = useState<User | null>(null);
  const [composerPrefillText, setComposerPrefillText] = useState("");

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("sidebarExpanded");
    if (saved !== null) {
      setIsSidebarExpanded(saved === "true");
    }
  }, []);

  const handleToggleSidebar = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
    localStorage.setItem("sidebarExpanded", String(expanded));
  };

  const handleSelectUser = (user: User) => {
    setSelectedProfileUser(user);
    setCurrentView("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenMyProfile = () => {
    setSelectedProfileUser(currentUser);
    setCurrentView("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInsertAICaptionToPost = (text: string) => {
    setComposerPrefillText(text);
    setIsCreatePostOpen(true);
  };

  // Determine container width based on view
  const isFullWidthView =
    currentView === "messages" || currentView === "copilot" || currentView === "profile" || currentView === "reels";

  if (!isAuthenticated) {
    return <LandingAuthView />;
  }

  // --- APP RENDER (When Authenticated) ---
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col antialiased">
      {/* Mobile Top Header (only on mobile screens < lg) */}
      <div className="lg:hidden sticky top-0 inset-x-0 h-14 z-30 bg-white/95 dark:bg-[#000000]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between px-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setCurrentView("feed")}
        >
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-primary to-purple-600 text-white font-bold text-sm shadow-xs">
            N
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            Nexus
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentView("explore")}
            className="p-2 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
            title="Search"
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => setCurrentView("notifications")}
            className="p-2 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
            title="Notifications"
          >
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* 2. LEFT DESKTOP SIDEBAR (Icons by default, expands on hover) */}
      <LeftSidebar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === "profile") {
            handleOpenMyProfile();
          } else {
            setCurrentView(view);
          }
        }}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
      />

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main
        className="flex w-full pt-2 lg:pt-6 pb-16 transition-all duration-300 ease-in-out lg:pl-[72px]"
      >
        <div
          className={`mx-auto flex w-full justify-center gap-6 px-3 sm:px-6 ${isFullWidthView ? "max-w-[1440px]" : "max-w-[1050px]"
            }`}
        >
          {/* CENTER CONTENT COLUMN */}
          <section
            className={`w-full min-w-0 ${isFullWidthView ? "flex-1" : "max-w-[650px] flex-1"
              }`}
          >
            {/* VIEW ROUTING */}
            {currentView === "feed" && (
              <FeedView
                onNavigate={setCurrentView}
                onSelectUser={handleSelectUser}
                onOpenReport={(u) => setReportTarget(u)}
                onOpenBlock={(u) => setBlockTarget(u)}
                onOpenCopilot={() => setCurrentView("copilot")}
              />
            )}

            {currentView === "reels" && <ReelsView />}

            {currentView === "explore" && (
              <ExploreView
                onNavigate={setCurrentView}
                onSelectUser={handleSelectUser}
                onOpenReport={(u) => setReportTarget(u)}
              />
            )}

            {currentView === "messages" && (
              <DirectMessagesView
                onSelectUser={handleSelectUser}
                onOpenReport={(u) => setReportTarget(u)}
                onOpenBlock={(u) => setBlockTarget(u)}
              />
            )}

            {currentView === "friends" && (
              <FriendsView
                onSelectUser={handleSelectUser}
                onOpenChat={() => setCurrentView("messages")}
              />
            )}

            {currentView === "copilot" && (
              <AICopilotView onInsertToPost={handleInsertAICaptionToPost} />
            )}

            {currentView === "saved" && (
              <BookmarksView
                onNavigate={setCurrentView}
                onSelectUser={handleSelectUser}
                onOpenReport={(u) => setReportTarget(u)}
              />
            )}

            {currentView === "notifications" && (
              <NotificationsView
                onNavigate={setCurrentView}
                onSelectUser={handleSelectUser}
              />
            )}

            {currentView === "profile" && (
              <ProfileView
                user={selectedProfileUser || currentUser}
                onSelectUser={handleSelectUser}
                onOpenReport={(u) => setReportTarget(u)}
                onOpenBlock={(u) => setBlockTarget(u)}
                onStartChat={() => setCurrentView("messages")}
                onEditProfile={() => setIsEditProfileOpen(true)}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === "settings" && (
              <SettingsView onNavigate={setCurrentView} />
            )}
          </section>

          {/* RIGHT DESKTOP CONTEXTUAL RAIL */}
          {!isFullWidthView && (
            <RightRail
              onNavigate={setCurrentView}
              onSelectUser={handleSelectUser}
            />
          )}
        </div>
      </main>

      {/* 4. MOBILE BOTTOM NAVIGATION */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={(view) => {
          if (view === "profile") {
            handleOpenMyProfile();
          } else {
            setCurrentView(view);
          }
        }}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
      />

      {/* 5. GLOBAL FLOATING MODALS (Lazy mounted on-demand) */}
      {isCreatePostOpen && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          prefillContent={composerPrefillText}
          onClose={() => {
            setIsCreatePostOpen(false);
            setComposerPrefillText("");
          }}
          onOpenCopilot={() => {
            setIsCreatePostOpen(false);
            setCurrentView("copilot");
          }}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetUser={reportTarget}
        />
      )}

      {blockTarget && (
        <BlockUserModal
          isOpen={!!blockTarget}
          onClose={() => setBlockTarget(null)}
          user={blockTarget}
        />
      )}

      {isEditProfileOpen && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
        />
      )}
    </div>
  );
}

