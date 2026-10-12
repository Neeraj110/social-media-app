"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const { login, signup, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const googleMutation = useMutation({
    mutationFn: async (credential: string) => {
      await loginWithGoogle(credential);
    },
    onSuccess: () => {
      showToast("Welcome to Nexus! 🎉", "success");
      onClose();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      showToast(message, "error");
    },
  });

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      showToast("Google sign-in failed — no credential returned.", "error");
      return;
    }
    googleMutation.mutate(credentialResponse.credential);
  };


  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "verify">(
    initialMode
  );

  // Login & Signup form state - Clean empty inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!email || !password) throw new Error("Please enter email and password");
      await login(email, password);
    },
    onSuccess: () => {
      showToast("Welcome back to Nexus!", "success");
      onClose();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Login failed";
      showToast(message, "error");
    },
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  const signupMutation = useMutation({
    mutationFn: async () => {
      if (!email || !displayName || !username || !password) {
        throw new Error("Please complete all required fields");
      }
      await signup({ displayName, username, email, password });
    },
    onSuccess: () => {
      showToast("Welcome to Nexus! Your account is ready. 🎉", "success");
      onClose();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Registration failed";
      showToast(message, "error");
    },
  });

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate();
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === "login"
          ? "Welcome Back to Nexus"
          : mode === "signup"
          ? "Join the Spatial Social Horizon"
          : "Reset Access Credentials"
      }
      maxWidth="md"
    >
      <div className="space-y-5 select-none">
        {/* VIEW 1: LOGIN */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email & Password Input */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#303030] rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#303030] rounded-xl pl-10 pr-10 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Google Sign In */}
            <div className="space-y-3">
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-700" />
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium shrink-0">or continue with</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-700" />
              </div>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => showToast("Google sign-in was cancelled or failed.", "error")}
                  theme="outline"
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                  logo_alignment="left"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2.5 rounded-xl text-xs font-bold shadow-sm gap-2"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In to Nexus"}
              {!loginMutation.isPending && <ArrowRight size={14} />}
            </Button>

            {/* Switch to Signup */}
            <div className="text-center text-xs text-slate-500 dark:text-zinc-400 pt-3 border-t border-slate-100 dark:border-zinc-800">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-primary font-bold hover:underline"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* VIEW 2: SIGNUP */}
        {mode === "signup" && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Full Name</label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Vance"
                    required
                    className="w-full bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#303030] rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Handle</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 text-xs font-mono">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alexvance"
                    required
                    className="w-full bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#303030] rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#303030] rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Role or Passions (Optional)</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Creative Technologist"
                  className="w-full bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#303030] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Create Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#303030] rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Google Sign Up */}
            <div className="space-y-3">
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-700" />
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium shrink-0">or sign up with</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-700" />
              </div>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => showToast("Google sign-in was cancelled or failed.", "error")}
                  theme="outline"
                  shape="rectangular"
                  size="large"
                  text="signup_with"
                  logo_alignment="left"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full py-2.5 rounded-xl text-xs font-bold shadow-sm gap-2"
            >
              {signupMutation.isPending ? "Creating account..." : "Continue to Verification"}
              {!signupMutation.isPending && <ArrowRight size={14} />}
            </Button>


            <div className="text-center text-xs text-slate-500 dark:text-zinc-400 pt-3 border-t border-slate-100 dark:border-zinc-800">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-primary font-bold hover:underline"
              >
                Log In
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: FORGOT PASSWORD */}
        {mode === "forgot" && (
          <div className="space-y-4">
            {!forgotSent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSent(true);
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Enter your registered email address to receive secure password recovery instructions.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#303030] rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold shadow-sm"
                >
                  Send Recovery Link
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-3 py-4 animate-in fade-in">
                <div className="grid h-12 w-12 place-items-center mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Recovery Email Dispatched
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-xs mx-auto">
                  We sent a reset link to <strong>{email}</strong>. Please check your inbox or spam folder.
                </p>
              </div>
            )}

            <div className="text-center text-xs text-slate-500 dark:text-zinc-400 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setForgotSent(false);
                  setMode("login");
                }}
                className="text-primary font-bold hover:underline"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}
