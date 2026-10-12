"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  AtSign,
  Film,
  Radio,
  Cpu,
  Layers,
  CheckCircle2,
} from "lucide-react";

export function LandingAuthView() {
  const { login, signup, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Interactive mock state in showcase
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(14289);
  const [previewTab, setPreviewTab] = useState<"feed" | "copilot">("feed");

  // Mutations
  const loginMutation = useMutation({
    mutationFn: async ({ loginEmail, loginPass }: { loginEmail?: string; loginPass?: string }) => {
      const e = loginEmail || email;
      const p = loginPass || password;
      if (!e || !p) throw new Error("Please enter your email or username and password");
      await login(e, p);
    },
    onSuccess: () => {
      showToast("Welcome back to Nexus! 🎉", "success");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      showToast(message, "error");
    },
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      if (!email || !displayName || !username || !password) {
        throw new Error("Please complete all required fields");
      }
      await signup({ displayName, username, email, password });
    },
    onSuccess: () => {
      showToast("Welcome to Nexus! Your profile is ready. 🎉", "success");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Registration failed";
      showToast(message, "error");
    },
  });

  const googleMutation = useMutation({
    mutationFn: async (credential: string) => {
      await loginWithGoogle(credential);
    },
    onSuccess: () => {
      showToast("Google sign-in successful! Welcome to Nexus 🎉", "success");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      showToast(message, "error");
    },
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({});
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate();
  };

  const handleDemoLogin = async (
    demoUser: string,
    demoPass: string,
    demoName: string,
    demoUsername: string
  ) => {
    setActiveDemo(demoUser);
    setEmail(demoUser);
    setPassword(demoPass);
    try {
      await login(demoUser, demoPass);
      showToast(`Welcome back, ${demoName}! 🎉`, "success");
    } catch {
      // Auto-fallback: If account does not exist in DB yet, auto-register and sign in
      try {
        await signup({
          displayName: demoName,
          username: demoUsername,
          email: demoUser,
          password: demoPass,
        });
        showToast(`Demo persona logged in as ${demoName}! 🎉`, "success");
      } catch (regErr: unknown) {
        const msg = regErr instanceof Error ? regErr.message : "Demo sign in failed";
        showToast(msg, "error");
      }
    } finally {
      setActiveDemo(null);
    }
  };

  const toggleMockLike = () => {
    if (isPostLiked) {
      setIsPostLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      setIsPostLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-between selection:bg-primary/30 selection:text-white relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-1/4 w-[650px] h-[650px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* 1. TOP GLOBAL NAVIGATION */}
      <header className="relative z-30 w-full border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary via-purple-500 to-rose-500 p-[1px] shadow-lg shadow-primary/20">
              <div className="w-full h-full bg-[#0d0d12] rounded-[11px] flex items-center justify-center">
                <span className="font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-tr from-primary to-rose-400">
                  N
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                Nexus
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-white/[0.08] text-zinc-400 font-semibold border border-white/[0.06]">
                  v2.4
                </span>
              </span>
            </div>
          </div>

          {/* Center Protocol Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400 text-[11px] font-mono">Real-time WebSockets & Copilot Active</span>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
              }}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/[0.05]"
            >
              {mode === "login" ? "Create Account" : "Sign In"}
            </button>
            <button
              onClick={() => handleDemoLogin("jane@gmail.com", "password123", "Jane Doe", "jane1")}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition border border-white/10 flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <Zap size={13} className="text-amber-400" />
              <span>Instant Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SHOWCASE SECTION */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: Value Proposition & Professional Auth Dock */}
          <div className="lg:col-span-6 space-y-7 text-left">
            
            {/* Pill Announcement */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent border border-primary/20 text-[11px] font-medium text-primary">
              <Sparkles size={12} className="text-primary" />
              <span>The Next-Generation Social Media Experience</span>
              <ArrowRight size={11} className="text-primary/70" />
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                Connect with intent. <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Create with intelligence.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-lg">
                Engineered with instant WebSocket messaging, AI caption synthesis, and on-device WebGPU filter presets. Built for creators and developers who demand zero lag.
              </p>
            </div>

            {/* AUTH CARD */}
            <div className="bg-[#0f0f13]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-2xl relative ring-1 ring-white/[0.04]">
              
              {/* Segmented Mode Selector */}
              <div className="flex p-1 bg-zinc-900/80 rounded-xl border border-white/[0.06] mb-5">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    mode === "login"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    mode === "signup"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* LOGIN FORM */}
              {mode === "login" && (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Email or Username</label>
                    <div className="relative">
                      <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com or @username"
                        required
                        className="w-full bg-zinc-900/90 border border-white/[0.08] focus:border-primary/80 focus:ring-1 focus:ring-primary/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-zinc-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-zinc-400">Password</label>
                      <span className="text-[10px] text-zinc-500 hover:text-zinc-300 transition cursor-pointer">
                        Forgot password?
                      </span>
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full bg-zinc-900/90 border border-white/[0.08] focus:border-primary/80 focus:ring-1 focus:ring-primary/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-zinc-500 outline-none transition"
                      />
                      {password.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginMutation.isPending || !email || !password}
                    className="w-full mt-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-lg shadow-primary/20 active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing into Nexus...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* SIGNUP FORM */}
              {mode === "signup" && (
                <form onSubmit={handleSignupSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">Full Name</label>
                      <div className="relative">
                        <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Elena Rostova"
                          required
                          className="w-full bg-zinc-900/90 border border-white/[0.08] focus:border-primary/80 rounded-xl pl-9 pr-2 py-2 text-xs text-white placeholder:text-zinc-500 outline-none transition"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">Username</label>
                      <div className="relative">
                        <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                          placeholder="elena_design"
                          required
                          className="w-full bg-zinc-900/90 border border-white/[0.08] focus:border-primary/80 rounded-xl pl-9 pr-2 py-2 text-xs text-white placeholder:text-zinc-500 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="elena@studio.design"
                        required
                        className="w-full bg-zinc-900/90 border border-white/[0.08] focus:border-primary/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        minLength={6}
                        className="w-full bg-zinc-900/90 border border-white/[0.08] focus:border-primary/80 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder:text-zinc-500 outline-none transition"
                      />
                      {password.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-normal pt-0.5">
                    By signing up, you accept our Terms of Service and Privacy Policy.
                  </p>

                  <button
                    type="submit"
                    disabled={signupMutation.isPending || !email || !displayName || !username || !password}
                    className="w-full mt-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-lg shadow-primary/20 active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {signupMutation.isPending ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Or instant access
                </span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>

              {/* 1-Click Persona Cards */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
                  <span>Explore as Verified Persona</span>
                  <span className="text-[10px] font-mono text-zinc-500">1-Click Fast Pass</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!!activeDemo}
                    onClick={() => handleDemoLogin("jane@gmail.com", "password123", "Jane Doe", "jane1")}
                    className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/[0.06] hover:border-primary/40 text-left transition group active:scale-95 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"
                        alt=""
                        className="h-7 w-7 rounded-full object-cover ring-1 ring-primary/40"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                          Jane Doe
                          <CheckCircle2 size={11} className="text-primary fill-primary/20 shrink-0" />
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">Lead Designer</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={!!activeDemo}
                    onClick={() => handleDemoLogin("alex@example.com", "password123", "Alex Vance", "alexvance")}
                    className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/[0.06] hover:border-purple-500/40 text-left transition group active:scale-95 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
                        alt=""
                        className="h-7 w-7 rounded-full object-cover ring-1 ring-purple-500/40"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                          Alex Vance
                          <CheckCircle2 size={11} className="text-purple-400 fill-purple-400/20 shrink-0" />
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">AI Architect</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Google OAuth Button */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-center">
                <GoogleLogin
                  onSuccess={(res) => {
                    if (res.credential) googleMutation.mutate(res.credential);
                  }}
                  onError={() => showToast("Google authentication cancelled", "error")}
                  theme="filled_black"
                  shape="pill"
                  size="medium"
                  text="continue_with"
                />
              </div>
            </div>

            {/* Trust Points */}
            <div className="flex items-center gap-6 text-[11px] text-zinc-400 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" /> End-to-End Encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" /> Sub-50ms Sync
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" /> Integrated AI
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Live App Showcase Deck */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Ambient Multi-Layer Radial Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-purple-600/15 to-rose-500/10 rounded-3xl blur-2xl -z-10" />

            {/* Main Interactive Product Canvas */}
            <div className="w-full max-w-[440px] bg-[#0c0c10] border border-white/[0.1] rounded-3xl p-4 shadow-2xl space-y-4 ring-1 ring-white/[0.06] relative overflow-hidden">
              
              {/* Product Top Header */}
              <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-primary to-purple-600 grid place-items-center text-white text-[10px] font-black shadow-xs">
                    N
                  </div>
                  <span className="font-bold text-xs tracking-tight text-white">Live App Feed</span>
                </div>

                {/* Interactive Toggle between Feed & AI Copilot */}
                <div className="flex p-0.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-[10px]">
                  <button
                    onClick={() => setPreviewTab("feed")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      previewTab === "feed" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Feed
                  </button>
                  <button
                    onClick={() => setPreviewTab("copilot")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      previewTab === "copilot" ? "bg-primary text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    AI Copilot
                  </button>
                </div>
              </div>


              {/* Story Rail Preview */}
              <div className="flex items-center gap-3 overflow-x-hidden px-2 py-1 border-b border-white/[0.06]">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="h-11 w-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 cursor-pointer hover:scale-105 transition">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                      alt=""
                      className="h-full w-full rounded-full object-cover border border-[#0c0c10]"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono">Your story</span>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="h-11 w-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 cursor-pointer hover:scale-105 transition">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                      alt=""
                      className="h-full w-full rounded-full object-cover border border-[#0c0c10]"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono">marcus_c</span>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="h-11 w-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 cursor-pointer hover:scale-105 transition">
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop"
                      alt=""
                      className="h-full w-full rounded-full object-cover border border-[#0c0c10]"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono">sarah.k</span>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="h-11 w-11 rounded-full p-[2px] bg-zinc-700">
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop"
                      alt=""
                      className="h-full w-full rounded-full object-cover border border-[#0c0c10]"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono">dev_ken</span>
                </div>
              </div>

              {/* TAB 1: Real Live Post Card */}
              {previewTab === "feed" && (
                <div className="bg-[#14141b] border border-white/[0.08] rounded-2xl overflow-hidden space-y-3 p-3">
                  {/* Post Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                        alt=""
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/60"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white">Elena Rostova</span>
                          <CheckCircle2 size={12} className="text-primary fill-primary/20" />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">@elena_design • 12m ago</span>
                      </div>
                    </div>
                    <MoreHorizontal size={14} className="text-zinc-400" />
                  </div>

                  {/* High Quality Spatial Graphic */}
                  <div className="relative rounded-xl overflow-hidden h-48 w-full bg-zinc-950 group">
                    <img
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&auto=format&fit=crop"
                      alt=""
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-zinc-300">
                      WebGPU Filter: Cinematic
                    </div>
                  </div>

                  {/* Interactive Action Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={toggleMockLike}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition active:scale-90 ${
                          isPostLiked ? "text-rose-500" : "text-zinc-300 hover:text-white"
                        }`}
                      >
                        <Heart size={16} className={isPostLiked ? "fill-rose-500 text-rose-500" : ""} />
                        <span>{likeCount.toLocaleString()}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition">
                        <MessageCircle size={16} />
                        <span>184</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition">
                        <Send size={15} />
                        <span>42</span>
                      </button>
                    </div>
                    <Bookmark size={16} className="text-zinc-400 hover:text-white cursor-pointer" />
                  </div>

                  {/* Caption & Top Comment */}
                  <div className="space-y-1 text-xs">
                    <p className="text-zinc-200 leading-snug">
                      <span className="font-bold mr-1.5 text-white">Elena Rostova</span>
                      Exploring new spatial design systems and real-time interaction patterns. #GenerativeUI #WebGPU
                    </p>
                    <div className="pt-1 text-[11px] text-zinc-400 flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-300">Marcus Chen:</span>
                      <span className="truncate">Latency on this stream is unbelievable ⚡</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI Copilot Preview */}
              {previewTab === "copilot" && (
                <div className="bg-[#14141b] border border-white/[0.08] rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-primary to-purple-600 grid place-items-center text-white">
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        Nexus AI Copilot
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary/20 text-primary">
                          Streaming
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400">Context-aware post & caption generator</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] text-xs text-zinc-300 space-y-2 font-mono">
                    <div className="text-zinc-500 text-[10px]">// Generated Caption • 38ms</div>
                    <p className="text-zinc-200">
                      &quot;Redefining how creators broadcast ideas in zero latency. The bridge between spatial UX and human connection.&quot;
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="text-primary text-[10px]">#SpatialComputing</span>
                      <span className="text-primary text-[10px]">#CreativeTech</span>
                      <span className="text-primary text-[10px]">#NexusAI</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setPreviewTab("feed")}
                      className="flex-1 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[11px] font-semibold text-center transition shadow-xs"
                    >
                      Insert to Post Composer
                    </button>
                    <button
                      onClick={() => showToast("Prompt regenerated in 24ms ✨", "success")}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold transition"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}

              {/* FLOATING ACCESSORY CARD 1: Live Notification */}
              <div className="absolute -bottom-2 -left-3 hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#161622]/95 backdrop-blur-md border border-white/10 shadow-2xl ring-1 ring-white/5 animate-bounce-subtle">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop"
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
                </div>
                <div className="text-[11px] pr-1">
                  <div className="font-bold text-white">Marcus Chen</div>
                  <div className="text-[10px] text-zinc-400">Sent a new spark message 💬</div>
                </div>
              </div>

              {/* FLOATING ACCESSORY CARD 2: Performance Chip */}
              <div className="absolute -top-3.5 right-6 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-black/90 backdrop-blur-md border border-white/15 text-[10px] font-mono text-zinc-300 shadow-xl z-30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>60 FPS • WebSockets Live</span>
              </div>
            </div>
          </div>


        </div>

        {/* 3. PLATFORM FEATURES STRIP */}
        <div className="mt-16 lg:mt-24 pt-10 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition space-y-2">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 grid place-items-center text-blue-400">
              <Zap size={16} />
            </div>
            <h3 className="font-bold text-xs text-white">Sub-50ms Feed Sync</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Optimistic mutations and instant broadcast sockets ensure zero feed lag when reacting or sharing.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition space-y-2">
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 grid place-items-center text-purple-400">
              <Sparkles size={16} />
            </div>
            <h3 className="font-bold text-xs text-white">Autonomous AI Copilot</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Intelligent caption drafting, multimodal media insights, and style-adaptive prompt dock.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition space-y-2">
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 grid place-items-center text-rose-400">
              <Layers size={16} />
            </div>
            <h3 className="font-bold text-xs text-white">WebGPU Filter Studio</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Real-time canvas shader filters including Clarendon, Valencia, and custom intensity grading.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition space-y-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center text-emerald-400">
              <Film size={16} />
            </div>
            <h3 className="font-bold text-xs text-white">Spatial Reels & Stories</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              High-fidelity vertical video streaming and circular 24-hour status story rails.
            </p>
          </div>
        </div>
      </main>

      {/* 4. PROFESSIONAL CLEAN FOOTER */}
      <footer className="relative z-20 w-full border-t border-white/[0.06] bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-zinc-400 font-medium">All systems operational</span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-[11px]">Protocol v2.4</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] text-zinc-400">
            <span className="hover:text-white transition cursor-pointer">Security</span>
            <span className="hover:text-white transition cursor-pointer">Privacy</span>
            <span className="hover:text-white transition cursor-pointer">Terms</span>
            <span className="hover:text-white transition cursor-pointer">Architecture</span>
            <span className="hover:text-white transition cursor-pointer">Status</span>
          </div>

          <div className="text-[11px] font-mono text-zinc-500">
            © 2026 NEXUS PROTOCOL. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
