"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, UserRole } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../ui/Modal";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Camera, Image as ImageIcon, Sparkles, UploadCloud, Zap, CheckCircle2 } from "lucide-react";
import { useBackgroundUploader, BackgroundUploadTask } from "../../lib/backgroundUploader";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces",
];

const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1200&h=400&fit=crop",
];

export function EditProfileModal({ isOpen, onClose, user: propUser }: EditProfileModalProps) {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { startUpload, resolveMediaUrl } = useBackgroundUploader();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const activeUser = propUser || currentUser;

  const [displayName, setDisplayName] = useState(activeUser.displayName);
  const [username, setUsername] = useState(activeUser.username);
  const [bio, setBio] = useState(activeUser.bio || "");
  const [role, setRole] = useState<UserRole>(activeUser.role || "creator");
  const [location, setLocation] = useState(activeUser.location || "");
  const [website, setWebsite] = useState(activeUser.website || "");
  const [avatarUrl, setAvatarUrl] = useState(activeUser.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(activeUser.coverUrl || PRESET_COVERS[0]);

  const [avatarTask, setAvatarTask] = useState<BackgroundUploadTask | null>(null);
  const [coverTask, setCoverTask] = useState<BackgroundUploadTask | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(activeUser.displayName);
      setUsername(activeUser.username);
      setBio(activeUser.bio || "");
      setRole(activeUser.role || "creator");
      setLocation(activeUser.location || "");
      setWebsite(activeUser.website || "");
      setAvatarUrl(activeUser.avatarUrl);
      setCoverUrl(activeUser.coverUrl || PRESET_COVERS[0]);
      setAvatarTask(null);
      setCoverTask(null);
    }
  }, [isOpen, activeUser]);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const task = startUpload(file, { folder: "avatars" });
      setAvatarTask(task);
      setAvatarUrl(task.previewUrl);
      showToast("⚡ Avatar background sync started", "info");
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const task = startUpload(file, { folder: "covers" });
      setCoverTask(task);
      setCoverUrl(task.previewUrl);
      showToast("⚡ Cover banner background sync started", "info");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim()) {
      showToast("Display name and username are required", "error");
      return;
    }

    setIsSaving(true);

    try {
      let finalAvatarUrl = avatarUrl;
      let finalCoverUrl = coverUrl;

      if (avatarTask) {
        finalAvatarUrl = await resolveMediaUrl(avatarTask.id);
      }
      if (coverTask) {
        finalCoverUrl = await resolveMediaUrl(coverTask.id);
      }

      updateProfile({
        displayName: displayName.trim(),
        username: username.trim().replace(/^@/, ""),
        bio: bio.trim(),
        role: role,
        location: location.trim(),
        website: website.trim(),
        avatarUrl: finalAvatarUrl || avatarUrl,
        coverUrl: finalCoverUrl || coverUrl,
      });

      setIsSaving(false);
      showToast("Profile changes saved instantly!", "success");
      onClose();
    } catch (err: any) {
      setIsSaving(false);
      showToast("Failed to save profile: " + err?.message, "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile" maxWidth="lg">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFile}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverFile}
      />

      <form onSubmit={handleSave} className="space-y-5 select-none">
        {/* Cover Photo Editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Cover Banner</label>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <UploadCloud size={13} /> Upload Custom Banner
            </button>
          </div>

          <div
            onClick={() => coverInputRef.current?.click()}
            className="relative h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 group cursor-pointer"
          >
            <img
              src={coverUrl}
              alt="Cover Preview"
              className="w-full h-full object-cover"
            />
            {coverTask && (
              <div className="absolute top-2 right-2">
                {coverTask.status === "ready" ? (
                  <div className="bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <CheckCircle2 size={11} strokeWidth={3} /> Ready
                  </div>
                ) : (
                  <div className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1 animate-pulse">
                    <Zap size={11} fill="white" /> Syncing {coverTask.progress}%
                  </div>
                )}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="text-xs text-white font-bold flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md">
                <ImageIcon size={14} /> Click to change cover
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1 overflow-x-auto hide-scroll">
            {PRESET_COVERS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCoverUrl(preset);
                  setCoverTask(null);
                }}
                className={`h-10 w-20 rounded-lg overflow-hidden shrink-0 border-2 transition active:scale-95 ${
                  coverUrl === preset && !coverTask ? "border-primary shadow-xs" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={preset} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Avatar Editor */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Avatar</label>
          <div className="flex items-center gap-4">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative cursor-pointer group"
            >
              <Avatar src={avatarUrl} alt="Avatar" size="xl" />
              <div className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full bg-primary text-white shadow-xs text-[10px] group-hover:scale-110 transition">
                <Camera size={12} />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Presets or upload your own:
                </span>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <UploadCloud size={12} /> Upload Photo
                </button>
              </div>
              <div className="flex gap-2">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(preset);
                      setAvatarTask(null);
                    }}
                    className={`rounded-full p-0.5 border-2 transition active:scale-95 ${
                      avatarUrl === preset && !avatarTask ? "border-primary scale-110 shadow-xs" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Avatar src={preset} alt="" size="sm" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Handle / Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 text-xs font-mono">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Role / Tier</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
            >
              <option value="creator">Creator</option>
              <option value="pro">Pro</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Website / Portfolio Link</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourportfolio.dev"
              className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Bio Narrative</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell the community about your craft and passions..."
              className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 outline-none transition resize-none"
            />
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isSaving}
            className="gap-2 shadow-xs font-bold bg-gradient-to-r from-blue-600 via-primary to-emerald-500 hover:brightness-110"
          >
            <Sparkles size={14} />
            Save Profile Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
