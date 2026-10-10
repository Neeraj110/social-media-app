"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useReels } from "../../context/ReelContext";
import { useToast } from "../../context/ToastContext";
import { useBackgroundUploader } from "../../lib/backgroundUploader";
import { INSTAGRAM_FILTERS, FilterPreset } from "../../lib/filters";
import {
  Film,
  Upload,
  Music,
  Sliders,
  CheckCircle2,
  Sparkles,
  Play,
  Pause,
  X,
  Radio,
  Volume2,
  Hash,
  AtSign,
} from "lucide-react";

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AUDIO_PRESETS = [
  { id: "aud_1", title: "Original Audio", artist: "You" },
  { id: "aud_2", title: "Cyber Horizon (Synthwave)", artist: "Nexus Beats" },
  { id: "aud_3", title: "Golden Hour Chill (Lofi)", artist: "Aura Soundscape" },
  { id: "aud_4", title: "Spatial Ambience (Deep 432Hz)", artist: "Horizon Audio" },
  { id: "aud_5", title: "Neon Velocity (Cyberpunk Electro)", artist: "Vance Audio" },
];

export function CreateReelModal({ isOpen, onClose }: CreateReelModalProps) {
  const { createReel } = useReels();
  const { showToast } = useToast();
  const { startUpload, applyFilter, resolveMediaUrl, getTask } = useBackgroundUploader();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<FilterPreset>(INSTAGRAM_FILTERS[0]);
  const [filterIntensity, setFilterIntensity] = useState<number>(1.0);
  const [selectedAudio, setSelectedAudio] = useState(AUDIO_PRESETS[0]);
  const [customAudioTitle, setCustomAudioTitle] = useState("");
  const [customAudioArtist, setCustomAudioArtist] = useState("");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentTask = taskId ? getTask(taskId) : null;
  const isVideo = selectedFile ? selectedFile.type.startsWith("video") : false;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Immediately trigger background upload in background with 0ms perceived latency
    const task = startUpload(file, {
      folder: "reels",
      filterId: selectedFilter.id,
      filterIntensity,
      fileName: file.name,
    });
    setTaskId(task.id);
  };

  const handleSelectFilter = (filter: FilterPreset) => {
    setSelectedFilter(filter);
    if (taskId && selectedFile && !isVideo) {
      applyFilter(taskId, filter.id, filterIntensity, "reels");
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      showToast("Please select a video or vertical image for your reel", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalMediaUrl = previewUrl;
      if (taskId) {
        finalMediaUrl = await resolveMediaUrl(taskId);
      }

      const audioTrack = customAudioTitle
        ? {
            id: "custom_" + Date.now(),
            title: customAudioTitle,
            artist: customAudioArtist || "Original Creator",
          }
        : selectedAudio;

      createReel({
        videoUrl: finalMediaUrl,
        thumbnailUrl: finalMediaUrl,
        caption,
        audioTrack,
        filterPreset: selectedFilter.name,
      });

      showToast("Your Reel was published instantly to Nexus!", "success");
      handleReset();
      onClose();
    } catch (err) {
      showToast("Failed to publish reel. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTaskId(null);
    setPreviewUrl("");
    setCaption("");
    setSelectedFilter(INSTAGRAM_FILTERS[0]);
    setFilterIntensity(1.0);
    setSelectedAudio(AUDIO_PRESETS[0]);
    setCustomAudioTitle("");
    setCustomAudioArtist("");
    setIsSubmitting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Create New Reel"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 select-none">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: 9:16 Vertical Reel Media Preview Container */}
          <div className="md:col-span-6 flex flex-col items-center">
            {previewUrl ? (
              <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 group">
                {isVideo ? (
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    loop
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-all"
                    style={{ filter: selectedFilter.cssFilter(filterIntensity) }}
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Reel Preview"
                    className="w-full h-full object-cover transition-all"
                    style={{ filter: selectedFilter.cssFilter(filterIntensity) }}
                  />
                )}

                {/* Video Play/Pause Overlay */}
                {isVideo && (
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="absolute inset-0 grid place-items-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="h-12 w-12 rounded-full bg-black/60 backdrop-blur-md grid place-items-center text-white">
                      {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                    </div>
                  </button>
                )}

                {/* Change File Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition"
                  title="Replace media"
                >
                  <X size={14} />
                </button>

                {/* Background Upload Status Tag */}
                {currentTask && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white shadow-lg">
                    {currentTask.status === "ready" ? (
                      <>
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        <span className="text-emerald-300">Ready in Background</span>
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                        <span>Uploading {currentTask.progress}%</span>
                      </>
                    )}
                  </div>
                )}

                {/* Reel Floating Overlay Elements */}
                <div className="absolute bottom-4 left-3 right-3 text-white pointer-events-none">
                  <div className="flex items-center gap-1.5 text-xs font-bold drop-shadow-md">
                    <Music size={12} className="text-primary animate-pulse" />
                    <span className="truncate">
                      {customAudioTitle || selectedAudio.title} ·{" "}
                      {customAudioArtist || selectedAudio.artist}
                    </span>
                  </div>
                  {caption && (
                    <p className="text-[11px] text-white/90 line-clamp-2 mt-1 drop-shadow">
                      {caption}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Drag & Drop Upload State */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-[280px] aspect-[9/16] rounded-3xl border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-primary dark:hover:border-primary bg-slate-50 dark:bg-zinc-800/40 hover:bg-blue-50/50 dark:hover:bg-primary/5 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all group"
              >
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 dark:bg-primary/20 text-primary group-hover:scale-110 transition-transform mb-4">
                  <Film size={32} />
                </div>
                <h4 className="font-display font-bold text-sm text-slate-800 dark:text-zinc-200 mb-1">
                  Upload 9:16 Video or Photo
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-4 leading-relaxed">
                  Select vertical video (MP4, WebM) or high-res photo for full-screen immersive Reels.
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm group-hover:shadow-md transition">
                  <Upload size={13} />
                  Choose File
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Right Column: Audio, Filters, Captions & Settings */}
          <div className="md:col-span-6 space-y-4">
            {/* Caption & Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Caption & Tags</span>
                <span className="text-[10px] font-normal text-slate-400">{caption.length}/500</span>
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a captivating caption... Use #tags and @mentions to connect with creators"
                rows={3}
                maxLength={500}
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Instagram Filters Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  Visual Preset Filter
                </label>
                <span className="text-[11px] font-bold text-primary">
                  {selectedFilter.name}
                </span>
              </div>

              {/* Filter Thumbnails Carousel */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {INSTAGRAM_FILTERS.map((f) => {
                  const isSelected = selectedFilter.id === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectFilter(f)}
                      className={`flex-shrink-0 flex flex-col items-center gap-1 p-1 rounded-xl transition ${
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-900"
                          : "hover:opacity-80"
                      }`}
                    >
                      <div
                        className={`h-12 w-12 rounded-lg bg-gradient-to-tr ${f.previewBg} shadow-inner border border-white/20`}
                      />
                      <span className="text-[10px] font-semibold text-slate-700 dark:text-zinc-300">
                        {f.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Track Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Music size={13} className="text-primary" />
                Select Audio Track
              </label>

              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {AUDIO_PRESETS.map((track) => {
                  const isSelected = selectedAudio.id === track.id && !customAudioTitle;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        setSelectedAudio(track);
                        setCustomAudioTitle("");
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition ${
                        isSelected
                          ? "bg-blue-50 dark:bg-primary/15 border-primary text-primary font-bold"
                          : "bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="h-7 w-7 rounded-lg bg-primary/20 grid place-items-center text-primary flex-shrink-0">
                          <Radio size={13} />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold truncate">{track.title}</div>
                          <div className="text-[10px] opacity-70 truncate">{track.artist}</div>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={14} className="text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Audio input toggle */}
            <div className="pt-1">
              <input
                type="text"
                value={customAudioTitle}
                onChange={(e) => setCustomAudioTitle(e.target.value)}
                placeholder="Or type custom track name (e.g., Midnight Rain · Taylor Swift)"
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Instant Background Pre-Upload Advantage Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 text-[11px] text-slate-700 dark:text-zinc-300 flex items-start gap-2.5">
              <Sparkles size={15} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white font-bold">
                  Zero Latency Publishing
                </strong>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Your reel media streams immediately to ImageKit CDN while you adjust filters and captions.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!previewUrl || isSubmitting}
                className="gap-2 font-bold px-6 shadow-md"
              >
                {isSubmitting ? "Publishing..." : "Share Reel"}
                <Film size={14} />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
