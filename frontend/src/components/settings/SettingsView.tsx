"use client";

import React, { useState } from "react";
import { User, AppView } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useSocial } from "../../context/SocialContext";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import { GlassCard } from "../ui/GlassCard";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import {
  User as UserIcon,
  Shield,
  Bell,
  Ban,
  Laptop,
  Smartphone,
  Tablet,
  LogOut,
  Trash2,
  Lock,
  Moon,
  Sun,
  Eye,
  Check,
} from "lucide-react";

interface SettingsViewProps {
  onNavigate: (view: AppView) => void;
}

export function SettingsView({ onNavigate }: SettingsViewProps) {
  const { currentUser, updateProfile, logout } = useAuth();
  const { blockedUsers, unblockUser } = useSocial();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<
    "account" | "privacy" | "notifications" | "blocked" | "sessions"
  >("account");

  // Account State
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [email, setEmail] = useState(currentUser.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Privacy State
  const [messagePrivacy, setMessagePrivacy] = useState("everyone");
  const [commentPrivacy, setCommentPrivacy] = useState("everyone");
  const [showPresence, setShowPresence] = useState(true);
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);

  // Notification State
  const [notifReactions, setNotifReactions] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifFriendReq, setNotifFriendReq] = useState(true);
  const [notifAISummary, setNotifAISummary] = useState(true);

  // Active Sessions Mock
  const [sessions, setSessions] = useState([
    {
      id: "sess_1",
      device: "MacBook Pro M3 Max • Chrome 130",
      location: "San Francisco, US",
      ip: "192.0.2.45",
      isCurrent: true,
      lastActive: "Active now",
      icon: Laptop,
    },
    {
      id: "sess_2",
      device: "iPhone 16 Pro • Nexus iOS App",
      location: "San Francisco, US",
      ip: "198.51.100.12",
      isCurrent: false,
      lastActive: "14 minutes ago",
      icon: Smartphone,
    },
    {
      id: "sess_3",
      device: "iPad Pro 13 • Safari 18",
      location: "San Jose, US",
      ip: "203.0.113.88",
      isCurrent: false,
      lastActive: "Yesterday at 4:12 PM",
      icon: Tablet,
    },
  ]);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ displayName, email });
    showToast("Account settings updated!", "success");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast("Please fill all password fields", "error");
      return;
    }
    showToast("Password updated securely!", "success");
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast("Device session terminated", "info");
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-8 select-none">
      {/* Header */}
      <GlassCard className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]" elevated>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 dark:bg-primary/15 text-primary border border-blue-200 dark:border-primary/25 shadow-xs">
                <Shield size={16} />
              </div>
              Settings & Privacy Controls
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Configure your spatial security, visibility, notifications, and device sessions.
            </p>
          </div>

          {/* Theme Quick Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] text-xs text-slate-700 dark:text-zinc-300 transition border border-slate-200/80 dark:border-white/[0.06] active:scale-95"
          >
            {theme === "dark" ? (
              <>
                <Moon size={14} className="text-primary" />
                <span>Soft Dark</span>
              </>
            ) : (
              <>
                <Sun size={14} className="text-amber-500" />
                <span>Clean Light</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-2 pt-5 border-t border-slate-100 dark:border-white/[0.06] mt-5 overflow-x-auto hide-scroll">
          <button
            onClick={() => setActiveTab("account")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "account"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <UserIcon size={13} />
            Account & Profile
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "privacy"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Lock size={13} />
            Privacy & Permissions
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "notifications"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Bell size={13} />
            Notifications
          </button>

          <button
            onClick={() => setActiveTab("blocked")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "blocked"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Ban size={13} />
            Blocked Users
            {blockedUsers.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono font-bold">
                {blockedUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
              activeTab === "sessions"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Laptop size={13} />
            Active Sessions
          </button>
        </div>
      </GlassCard>

      {/* Tab 1: Account Settings */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <GlassCard className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] space-y-4" elevated>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Profile Details</h3>
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="sm" type="submit" className="shadow-xs font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </GlassCard>

          {/* Change Password */}
          <GlassCard className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] space-y-4" elevated>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Security & Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="secondary" size="sm" type="submit" className="font-bold">
                  Update Password
                </Button>
              </div>
            </form>
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard className="p-6 border-rose-500/20 bg-rose-50/40 dark:bg-rose-500/[0.02] space-y-3">
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 font-display">Account Management</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Log Out from Session</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">End your current session on this device.</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 gap-1.5 active:scale-95 font-bold"
              >
                <LogOut size={13} />
                Log Out
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 2: Privacy Controls */}
      {activeTab === "privacy" && (
        <GlassCard className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] space-y-6" elevated>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Direct Communication</h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Who can send you Direct Messages?</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Control who can initiate encrypted chats with you.</div>
              </div>
              <select
                value={messagePrivacy}
                onChange={(e) => {
                  setMessagePrivacy(e.target.value);
                  showToast("Message privacy updated", "success");
                }}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-primary shadow-xs"
              >
                <option value="everyone">Everyone 🌐</option>
                <option value="friends">Friends Only 👥</option>
                <option value="none">Nobody 🔒</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Who can comment on your sparks?</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Manage comment permissions on published posts.</div>
              </div>
              <select
                value={commentPrivacy}
                onChange={(e) => {
                  setCommentPrivacy(e.target.value);
                  showToast("Comment permissions updated", "success");
                }}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-primary shadow-xs"
              >
                <option value="everyone">Everyone 🌐</option>
                <option value="friends">Friends Only 👥</option>
                <option value="mentions">Mentioned Only @</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Presence & Visibility</h3>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Show Online Presence Dot</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Let peers see when you are active on Nexus.</div>
              </div>
              <input
                type="checkbox"
                checked={showPresence}
                onChange={(e) => {
                  setShowPresence(e.target.checked);
                  showToast(e.target.checked ? "Online status visible" : "Online status hidden", "info");
                }}
                className="toggle-checkbox h-5 w-5 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Private Account</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Only approved followers can view your sparks and media.</div>
              </div>
              <input
                type="checkbox"
                checked={isPrivateAccount}
                onChange={(e) => {
                  setIsPrivateAccount(e.target.checked);
                  showToast(e.target.checked ? "Account switched to Private" : "Account switched to Public", "info");
                }}
                className="toggle-checkbox h-5 w-5 rounded accent-primary cursor-pointer"
              />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab 3: Notification Preferences */}
      {activeTab === "notifications" && (
        <GlassCard className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] space-y-4" elevated>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Activity Notification Toggles</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Reactions on your sparks</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Notify when peers react with ❤️, 👍, 😆 etc.</div>
              </div>
              <input
                type="checkbox"
                checked={notifReactions}
                onChange={(e) => setNotifReactions(e.target.checked)}
                className="h-5 w-5 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Comments and Threaded Replies</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Notify when someone joins your post discussion.</div>
              </div>
              <input
                type="checkbox"
                checked={notifComments}
                onChange={(e) => setNotifComments(e.target.checked)}
                className="h-5 w-5 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Friend Requests & New Followers</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Notify on incoming social connection requests.</div>
              </div>
              <input
                type="checkbox"
                checked={notifFriendReq}
                onChange={(e) => setNotifFriendReq(e.target.checked)}
                className="h-5 w-5 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Nexus Copilot AI Summaries</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Weekly feed briefings and creative spark alerts.</div>
              </div>
              <input
                type="checkbox"
                checked={notifAISummary}
                onChange={(e) => setNotifAISummary(e.target.checked)}
                className="h-5 w-5 rounded accent-primary cursor-pointer"
              />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab 4: Blocked Users */}
      {activeTab === "blocked" && (
        <GlassCard className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] space-y-4" elevated>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Blocked Accounts</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Blocked accounts cannot view your sparks, send direct messages, or find your profile.
            </p>
          </div>

          <div className="space-y-2">
            {blockedUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-500 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200/60 dark:border-transparent">
                You haven&apos;t blocked any users.
              </div>
            ) : (
              blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08]"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatarUrl} alt="" size="sm" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{user.displayName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">@{user.username}</div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => unblockUser(user.id)}
                    className="text-xs text-primary hover:text-primary-hover font-bold"
                  >
                    Unblock
                  </Button>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      )}

      {/* Tab 5: Active Sessions */}
      {activeTab === "sessions" && (
        <GlassCard className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] space-y-4" elevated>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Logged-In Devices</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage devices currently authorized to access your Nexus account.
            </p>
          </div>

          <div className="space-y-3">
            {sessions.map((sess) => {
              const IconComp = sess.icon;
              return (
                <div
                  key={sess.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 dark:bg-white/[0.04] text-primary border border-blue-200 dark:border-white/[0.06] shadow-xs">
                      <IconComp size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{sess.device}</span>
                        {sess.isCurrent && (
                          <span className="text-[9px] bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                            Current Device
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 font-mono">
                        {sess.location} • IP: {sess.ip} • {sess.lastActive}
                      </div>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 active:scale-95 font-bold"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
