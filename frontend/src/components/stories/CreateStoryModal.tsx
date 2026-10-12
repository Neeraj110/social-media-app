"use client";

import React, { useState, useRef } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useStory } from "../../context/StoryContext";
import { useToast } from "../../context/ToastContext";
import { Image, Type, Palette, Check, UploadCloud, Zap, CheckCircle2 } from "lucide-react";
import { useBackgroundUploader, BackgroundUploadTask } from "../../lib/backgroundUploader";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADIENTS = [
  "from-teal-600 via-emerald-600 to-zinc-900",
  "from-emerald-600 via-teal-700 to-cyan-900",
  "from-zinc-800 via-zinc-900 to-black",
  "from-amber-600 via-rose-700 to-zinc-900",
  "from-teal-800 via-zinc-900 to-black",
];

const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
];

export function CreateStoryModal({ isOpen, onClose }: CreateStoryModalProps) {
  const { createStory } = useStory();
  const { showToast } = useToast();
  const { startUpload, resolveMediaUrl } = useBackgroundUploader();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"media" | "text">("media");
  const [selectedMediaUrl, setSelectedMediaUrl] = useState(PRESET_IMAGES[0]);
  const [customMediaInput, setCustomMediaInput] = useState("");
  const [bgTask, setBgTask] = useState<BackgroundUploadTask | null>(null);
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [textOverlay, setTextOverlay] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const task = startUpload(file, { folder: "stories" });
      setBgTask(task);
      setSelectedMediaUrl(task.previewUrl);
      setCustomMediaInput("");
      showToast("⚡ Story media pre-upload started in background", "info");
    }
  };

  const handleSubmit = async () => {
    setIsPublishing(true);

    try {
      if (mode === "media") {
        let url = customMediaInput.trim() || selectedMediaUrl;
        if (bgTask) {
          url = await resolveMediaUrl(bgTask.id);
        }
        createStory(url || selectedMediaUrl, textOverlay.trim() || undefined);
      } else {
        if (!textOverlay.trim()) {
          showToast("Please write a story message", "error");
          setIsPublishing(false);
          return;
        }
        createStory(
          undefined,
          textOverlay.trim(),
          selectedGradient
        );
      }

      setIsPublishing(false);
      showToast("✨ Story Spark published for 24 hours (0ms latency)!", "success");
      onClose();
    } catch (err: any) {
      setIsPublishing(false);
      showToast("Failed to post story: " + err?.message, "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create 24h Story Spark" maxWidth="md">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="space-y-4 select-none">
        {/* Mode Selector (Media vs Text) */}
        <div className="flex rounded-2xl bg-white/[0.04] p-1 border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setMode("media")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              mode === "media"
                ? "bg-primary text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Image size={15} />
            Media Story
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              mode === "text"
                ? "bg-primary text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Type size={15} />
            Text Gradient
          </button>
        </div>

        {/* Live Story Preview Box */}
        <div className="relative aspect-[9/14] max-h-[320px] mx-auto rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex items-center justify-center p-6 text-center group">
          {mode === "media" ? (
            <>
              <img
                src={customMediaInput.trim() || selectedMediaUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />

              {/* In-flight background upload badge on story preview */}
              {bgTask && (
                <div className="absolute top-3 right-3 z-20">
                  {bgTask.status === "ready" ? (
                    <div className="flex items-center gap-1 bg-emerald-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                      <CheckCircle2 size={11} strokeWidth={3} />
                      <span>Ready</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-sky-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                      <Zap size={11} fill="white" />
                      <span>Syncing {bgTask.progress}%</span>
                    </div>
                  )}
                </div>
              )}

              {textOverlay && (
                <div className="relative z-10 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-xs font-bold text-white border border-white/10">
                  {textOverlay}
                </div>
              )}
            </>
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${selectedGradient} flex items-center justify-center p-6`}
            >
              <p className="font-display font-black text-white text-base leading-snug">
                {textOverlay || "Type your story caption below..."}
              </p>
            </div>
          )}
        </div>

        {/* Media Pickers or Gradient Pickers */}
        {mode === "media" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <span>Select Preset Media or Upload</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline flex items-center gap-1 font-bold lowercase"
              >
                <UploadCloud size={12} /> upload photo
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_IMAGES.map((url, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedMediaUrl(url);
                    setCustomMediaInput("");
                    setBgTask(null);
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition active:scale-95 ${
                    selectedMediaUrl === url && !customMediaInput && !bgTask
                      ? "border-primary scale-105 shadow-sm"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {selectedMediaUrl === url && !customMediaInput && !bgTask && (
                    <div className="absolute inset-0 bg-primary/20 grid place-items-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <input
              type="url"
              value={customMediaInput}
              onChange={(e) => {
                setCustomMediaInput(e.target.value);
                setBgTask(null);
              }}
              placeholder="Or paste custom image URL..."
              className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 mt-2 focus:border-primary/50 outline-none"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Palette size={12} /> Color Gradients
            </div>
            <div className="flex items-center gap-2">
              {GRADIENTS.map((grad, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedGradient(grad)}
                  className={`h-9 flex-1 rounded-xl bg-gradient-to-br ${grad} border-2 transition active:scale-95 ${
                    selectedGradient === grad
                      ? "border-white scale-105 shadow-lg"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Caption Input */}
        <div>
          <input
            type="text"
            value={textOverlay}
            onChange={(e) => setTextOverlay(e.target.value)}
            maxLength={120}
            placeholder={
              mode === "media"
                ? "Add caption overlay (optional)..."
                : "Type your message..."
            }
            className="w-full glass-input rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-primary/50 outline-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isPublishing}
            onClick={handleSubmit}
            className="px-5 shadow-sm font-bold bg-primary hover:bg-primary-hover"
          >
            Share to Story
          </Button>
        </div>
      </div>
    </Modal>
  );
}
