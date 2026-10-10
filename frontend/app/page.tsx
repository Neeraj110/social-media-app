"use client";

import React, { useState } from "react";
import { AppView, User, Post } from "../src/types";
import { useAuth } from "../src/context/AuthContext";
import { TopNavbar } from "../src/components/layout/TopNavbar";
import { LeftSidebar } from "../src/components/layout/LeftSidebar";
import { RightRail } from "../src/components/layout/RightRail";
import { MobileBottomNav } from "../src/components/layout/MobileBottomNav";
import { FeedView } from "../src/components/feed/FeedView";
import { ExploreView } from "../src/components/explore/ExploreView";
import { DirectMessagesView } from "../src/components/chat/DirectMessagesView";
import { FriendsView } from "../src/components/friends/FriendsView";
import { AICopilotView } from "../src/components/ai/AICopilotView";
import { BookmarksView } from "../src/components/bookmarks/BookmarksView";
import { NotificationsView } from "../src/components/notifications/NotificationsView";
import { ProfileView } from "../src/components/profile/ProfileView";
import { SettingsView } from "../src/components/settings/SettingsView";
import { ReelsView } from "../src/components/reels/ReelsView";
import { CreatePostModal } from "../src/components/feed/CreatePostModal";
import { AuthModal } from "../src/components/auth/AuthModal";
import { ReportModal } from "../src/components/modals/ReportModal";
import { BlockUserModal } from "../src/components/modals/BlockUserModal";
import { EditProfileModal } from "../src/components/profile/EditProfileModal";

// Landing Page Icons
import { ArrowRight, Sparkles, Zap, Shield, Heart, Users, PlaySquare, Hexagon, MessageCircle, Compass } from "lucide-react";

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
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-[#3B82F6] rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <Hexagon className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Nexus</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <a href="#" className="hover:text-slate-900 transition flex items-center gap-1">Features</a>
              <a href="#" className="hover:text-slate-900 transition">Creators</a>
              <a href="#" className="hover:text-slate-900 transition">Explore</a>
              <a href="#" className="hover:text-slate-900 transition">Pricing</a>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:block">Log in</button>
              <button onClick={() => setIsAuthModalOpen(true)} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-95">
                Join Nexus Free
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-32 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 pr-4">
            <h1 className="text-[3.5rem] md:text-[4.5rem] font-bold leading-[1.05] tracking-tight text-slate-900">
              Your Social World,<br/>
              Supercharged by AI.
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
              Connect with friends, discover viral trends, and create stunning posts instantly with your built-in AI Copilot. The next generation of social networking is here.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
              <button onClick={() => setIsAuthModalOpen(true)} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 py-4 rounded-full text-base font-semibold transition-all hover:shadow-xl hover:shadow-blue-500/30 active:scale-95">
                Get Started
              </button>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex text-yellow-400 text-sm">★★★★★</div>
                  <div className="text-sm font-bold text-slate-800">5M+ active users</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid Hero Images */}
          <div className="grid grid-cols-12 grid-rows-2 gap-4 h-[500px] lg:h-[600px] perspective-1000">
            {/* Card 1: Mobile UI mockup */}
            <div className="col-span-5 row-span-2 rounded-[2rem] overflow-hidden relative shadow-2xl group border border-slate-100 bg-slate-50">
               <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="App UI" />
               <div className="absolute inset-x-4 bottom-4 bg-white/30 backdrop-blur-xl border border-white/40 p-4 rounded-2xl text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <img src="https://i.pravatar.cc/100?img=1" className="w-6 h-6 rounded-full border border-white/50" alt="user" />
                    <div className="text-xs font-semibold drop-shadow-md">@creator_jane</div>
                  </div>
                  <p className="text-sm font-bold leading-tight drop-shadow-md">Generated a perfect caption in seconds with AI Copilot ✨</p>
               </div>
            </div>
            
            {/* Card 2: 1B+ Stat */}
            <div className="col-span-7 row-span-1 rounded-[2rem] bg-gradient-to-br from-[#4A85F6] to-[#2563EB] p-8 text-white flex flex-col justify-center shadow-xl relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl transform group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-5xl font-bold mb-2 tracking-tight drop-shadow-md">1B+</h3>
              <p className="text-lg font-medium text-blue-100 max-w-[200px] leading-tight">Messages sent on Nexus</p>
            </div>

            {/* Card 3: 100K+ Stat */}
            <div className="col-span-4 row-span-1 rounded-[2rem] bg-gradient-to-br from-[#FF8C73] to-[#FF6B6B] p-6 text-white flex flex-col justify-center shadow-xl group relative overflow-hidden">
               <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/20 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-4xl font-bold mb-2 drop-shadow-md">100K+</h3>
              <p className="text-sm font-semibold text-white/90 leading-tight">Trending topics explored daily</p>
            </div>

            {/* Card 4: Creator Image */}
            <div className="col-span-3 row-span-1 rounded-[2rem] overflow-hidden relative shadow-xl group border border-slate-100">
               <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Creator" />
               <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white">
                 <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border border-white/20 uppercase">
                   Viral
                 </div>
                 <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                   <Heart size={12} fill="white" />
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Logo Cloud */}
        <section className="border-y border-slate-100 py-12 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-semibold text-slate-500 mb-8 tracking-wide">Trusted by <span className="font-bold text-slate-800">88,500+</span> creators and communities.</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              {['Vogue', 'Spotify', 'Nike', 'Netflix', 'Twitch', 'Discord'].map((logo, idx) => (
                <span key={logo} className={`text-2xl font-bold text-slate-800 ${idx % 2 === 0 ? 'font-serif tracking-tighter' : 'tracking-wide'}`}>{logo}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 max-w-3xl mx-auto">
               <span className="text-[#3B82F6] font-bold text-sm tracking-widest uppercase mb-4 block">Platform Features</span>
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 tracking-tight text-slate-900">Everything you need to grow your social presence</h2>
              <p className="text-slate-600 text-lg font-medium leading-relaxed">From AI-assisted content creation to deep community engagement, Nexus provides the best toolkit.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-x-12 gap-y-16">
              {/* Feature 1 */}
              <div className="group">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">AI Copilot</h3>
                <p className="text-slate-600 mb-5 font-medium leading-relaxed">Stuck on what to post? Our AI Copilot drafts captions, suggests hashtags, and helps you refine your thoughts instantly.</p>
              </div>

              {/* Feature 2 */}
              <div className="group">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <MessageCircle size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Direct Messages</h3>
                <p className="text-slate-600 mb-5 font-medium leading-relaxed">Connect privately with friends and followers through fast, encrypted direct messaging that supports media and reactions.</p>
              </div>

              {/* Feature 3 */}
              <div className="group">
                <div className="w-14 h-14 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <Compass size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Smart Explore</h3>
                <p className="text-slate-600 mb-5 font-medium leading-relaxed">Discover trending content tailored just for you. The more you use Nexus, the better your explore feed gets.</p>
              </div>

              {/* Feature 4 */}
              <div className="group">
                <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Friends & Followers</h3>
                <p className="text-slate-600 mb-5 font-medium leading-relaxed">Build your inner circle of friends or grow a massive audience. Nexus gives you control over who sees your content.</p>
              </div>

              {/* Feature 5 */}
              <div className="group">
                <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                  <Heart size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Rich Interactions</h3>
                <p className="text-slate-600 mb-5 font-medium leading-relaxed">Like, comment, share, and bookmark. Engage with the content you love and keep track of your favorite posts.</p>
              </div>

              {/* Feature 6 */}
              <div className="group">
                <div className="w-14 h-14 bg-[#FFE8D6] text-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Safe & Secure</h3>
                <p className="text-slate-600 mb-5 font-medium leading-relaxed">Advanced blocking, reporting, and privacy settings ensure your social experience is safe and under your control.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer minimal */}
        <footer className="border-t border-slate-200 bg-white py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm font-medium">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-slate-200 rounded-md flex items-center justify-center">
                <Hexagon className="w-3 h-3 text-slate-400 fill-slate-400" />
              </div>
              <span className="font-bold text-slate-900">Nexus</span>
            </div>
            <p>© 2026 Nexus Social. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
               <a href="#" className="hover:text-slate-900 transition">Terms</a>
               <a href="#" className="hover:text-slate-900 transition">Privacy</a>
               <a href="#" className="hover:text-slate-900 transition">Contact</a>
            </div>
          </div>
        </footer>

        {/* Global Auth Modal for Landing Page */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  // --- APP RENDER (When Authenticated) ---
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col antialiased">
      {/* 1. TOP NAVBAR */}
      <TopNavbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === "profile") {
            handleOpenMyProfile();
          } else {
            setCurrentView(view);
          }
        }}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onSearchFocus={() => setCurrentView("explore")}
      />

      {/* 2. LEFT DESKTOP SIDEBAR */}
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
        className={`mx-auto flex w-full justify-center gap-6 px-3 sm:px-6 pt-20 pb-16 lg:pb-8 lg:pl-[280px] ${
          isFullWidthView ? "max-w-[1440px]" : "max-w-[1320px]"
        }`}
      >
        {/* CENTER CONTENT COLUMN */}
        <section
          className={`w-full min-w-0 ${
            isFullWidthView ? "flex-1" : "max-w-[650px] flex-1"
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

      {/* 5. GLOBAL FLOATING MODALS */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => {
          setIsCreatePostOpen(false);
          setComposerPrefillText("");
        }}
        onOpenCopilot={() => {
          setIsCreatePostOpen(false);
          setCurrentView("copilot");
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ReportModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        targetUser={reportTarget}
      />

      <BlockUserModal
        isOpen={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        user={blockTarget}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
}
