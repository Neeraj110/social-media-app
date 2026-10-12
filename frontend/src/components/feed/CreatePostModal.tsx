"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePost } from "../../context/PostContext";
import { useToast } from "../../context/ToastContext";
import { PostVisibility as Visibility, MediaItem } from "../../types";
import { Modal } from "../ui/Modal";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import {
  Globe,
  Users,
  Lock,
  Image as ImageIcon,
  BarChart2,
  Code2,
  Sparkles,
  X,
  Plus,
  Hash,
  Trash2,
  Wand2,
  Send,
  UploadCloud,
  Sliders,
  Zap,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useBackgroundUploader, BackgroundUploadTask } from "../../lib/backgroundUploader";
import dynamic from "next/dynamic";
import { CustomSelect, SelectOption } from "../ui/CustomSelect";

const InstagramFilterStudio = dynamic(
  () => import("./InstagramFilterStudio").then((m) => m.InstagramFilterStudio),
  { ssr: false }
);


interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "media" | "poll" | "ai" | "code";
  onOpenCopilot?: () => void;
  prefillContent?: string;
}

const PRESET_HASHTAGS = [
  "SpatialComputing",
  "DesignSystems",
  "GenerativeUI",
  "NextJS15",
  "WebGPU",
  "FutureOfWork",
  "CyberAesthetics",
  "InstantUpload",
];

const VISIBILITY_OPTIONS: SelectOption<Visibility>[] = [
  { value: "public", label: "Public (Anyone)", icon: <Globe size={13} />, description: "Visible to anyone on Nexus" },
  { value: "friends", label: "Friends Only", icon: <Users size={13} />, description: "Only friends & mutuals" },
  { value: "private", label: "Only Me", icon: <Lock size={13} />, description: "Private to your account" },
];

const AI_TONE_OPTIONS: SelectOption<"Visionary" | "Technical" | "Witty" | "Concise">[] = [
  { value: "Visionary", label: "Visionary", icon: <Sparkles size={12} className="text-primary" /> },
  { value: "Technical", label: "Technical", icon: <Code2 size={12} className="text-cyan-400" /> },
  { value: "Witty", label: "Witty", icon: <Wand2 size={12} className="text-amber-400" /> },
  { value: "Concise", label: "Concise", icon: <Zap size={12} className="text-emerald-400" /> },
];

const CODE_LANG_OPTIONS: SelectOption<string>[] = [
  { value: "typescript", label: "TypeScript" },
  { value: "glsl", label: "GLSL Shader" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "json", label: "JSON" },
];

export function CreatePostModal({
  isOpen,
  onClose,
  initialType,
  onOpenCopilot,
  prefillContent,
}: CreatePostModalProps) {
  const { currentUser } = useAuth();
  const { createPost } = usePost();
  const { showToast } = useToast();
  const { startUpload, resolveMediaUrl } = useBackgroundUploader();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState(prefillContent || "");
  const [visibility, setVisibility] = useState<Visibility>("public");

  // Multi-item background upload queue
  const [tasks, setTasks] = useState<BackgroundUploadTask[]>([]);
  const [activeStudioTaskId, setActiveStudioTaskId] = useState<string | null>(null);

  // Manual URL fallback media list
  const [manualMediaList, setManualMediaList] = useState<MediaItem[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (prefillContent) {
      setContent(prefillContent);
    }
  }, [prefillContent]);

  // Code Snippet state
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("typescript");
  const [codeContent, setCodeContent] = useState("");

  // Poll state
  const [showPollBuilder, setShowPollBuilder] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  // AI generator state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedAITone, setSelectedAITone] = useState<
    "Visionary" | "Technical" | "Witty" | "Concise"
  >("Visionary");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialType === "media") setIsAddingMedia(true);
    if (initialType === "code") setShowCodeInput(true);
    if (initialType === "poll") setShowPollBuilder(true);
    if (initialType === "ai") handleAIGenerate();
  }, [initialType, isOpen]);

  /**
   * INSTAGRAM MAGIC: Trigger background upload the microsecond the user selects files
   */
  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    const newTasks: BackgroundUploadTask[] = [];
    for (const file of fileArray) {
      const task = startUpload(file, { folder: "posts", filterId: "normal" });
      newTasks.push(task);
    }

    setTasks((prev) => [...prev, ...newTasks]);
    if (!activeStudioTaskId && newTasks.length > 0) {
      setActiveStudioTaskId(newTasks[0].id);
    }
    setIsAddingMedia(false);
    showToast(`⚡ Started background upload (${fileArray.length} items)`, "info");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleAddManualMedia = () => {
    if (!mediaUrlInput.trim()) return;
    setManualMediaList((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        type: "image",
        url: mediaUrlInput.trim(),
      },
    ]);
    setMediaUrlInput("");
    setIsAddingMedia(false);
  };

  const handleAddDemoMedia = (url: string) => {
    setManualMediaList((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        type: "image",
        url,
      },
    ]);
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (activeStudioTaskId === taskId) {
      const remaining = tasks.filter((t) => t.id !== taskId);
      setActiveStudioTaskId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleRemoveManualMedia = (index: number) => {
    setManualMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddHashtag = (tag: string) => {
    const formatted = `#${tag}`;
    if (!content.includes(formatted)) {
      setContent((prev) => (prev ? `${prev} ${formatted}` : formatted));
    }
  };

  const handleAIGenerate = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      const suggestions = {
        Visionary:
          "Just rendered our new kinetic glass spatial UI in WebGPU. The boundary between physical glass and virtual illumination is vanishing. #SpatialComputing #GenerativeUI",
        Technical:
          "Refactored the sub-pixel raytracer with compute shaders. Zero garbage collection spikes, steady 120 FPS at 4K viewport resolution. #WebGPU #Graphics",
        Witty:
          "My computer fan just asked for a union rep after compiling this 10,000-line GLSL shader. Worth it though ✨ #ShaderLife #WebDev",
        Concise:
          "Nexus Spatial OS v3.2 architecture is live. Experience the new depth layer. #Nexus #DesignSystems",
      };
      setContent(suggestions[selectedAITone]);
      setIsGeneratingAI(false);
      showToast("AI Spark generated with " + selectedAITone + " tone!", "success");
    }, 600);
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions((prev) => [...prev, ""]);
    }
  };

  const handleUpdatePollOption = (index: number, val: string) => {
    setPollOptions((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  /**
   * ZERO-LATENCY INSTAGRAM SUBMIT
   * Uses already-completed background uploads in 0ms!
   */
  const handleSubmit = async () => {
    if (
      !content.trim() &&
      tasks.length === 0 &&
      manualMediaList.length === 0 &&
      !codeContent
    ) {
      showToast("Please write something or attach media", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Resolve all background uploaded media URLs (instant if ready!)
      const resolvedMediaItems: MediaItem[] = [];

      for (const task of tasks) {
        const url = await resolveMediaUrl(task.id);
        resolvedMediaItems.push({
          id: task.id,
          type: "image",
          url: url || task.previewUrl,
        });
      }

      const allMedia = [...resolvedMediaItems, ...manualMediaList];

      const hashtags = content.match(/#[a-z0-9_]+/gi) || [];
      const mentions = content.match(/@[a-z0-9_]+/gi) || [];

      let pollPayload = undefined;
      if (showPollBuilder && pollQuestion.trim()) {
        const validOpts = pollOptions.filter((o) => o.trim().length > 0);
        if (validOpts.length >= 2) {
          pollPayload = {
            id: `poll-${Date.now()}`,
            question: pollQuestion.trim(),
            options: validOpts.map((opt, i) => ({
              id: `opt-${i + 1}`,
              text: opt.trim(),
              votes: 0,
            })),
            totalVotes: 0,
            expiresAt: "24 hours",
          };
        }
      }

      createPost({
        content,
        media: allMedia.length > 0 ? allMedia : undefined,
        visibility,
        hashtags,
        mentions,
        codeSnippet:
          showCodeInput && codeContent.trim()
            ? {
                language: codeLanguage,
                filename: `snippet.${
                  codeLanguage === "javascript"
                    ? "js"
                    : codeLanguage === "typescript"
                    ? "ts"
                    : codeLanguage === "html"
                    ? "html"
                    : codeLanguage === "css"
                    ? "css"
                    : codeLanguage === "python"
                    ? "py"
                    : "txt"
                }`,
                code: codeContent,
              }
            : undefined,
        poll: pollPayload,
      });

      setIsSubmitting(false);
      showToast("✨ Instant Spark published (0ms latency)!", "success");
      handleReset();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      showToast("Failed to publish post: " + err?.message, "error");
    }
  };

  const handleReset = () => {
    setContent("");
    setTasks([]);
    setActiveStudioTaskId(null);
    setManualMediaList([]);
    setShowCodeInput(false);
    setCodeContent("");
    setShowPollBuilder(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  };

  const maxChars = 500;
  const charsLeft = maxChars - content.length;

  const activeStudioTask = tasks.find((t) => t.id === activeStudioTaskId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Spark" maxWidth="lg">
      {/* Hidden file input for native file browser */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelected(e.target.files);
          }
        }}
      />

      <div
        className={`space-y-4 ${
          isDragging ? "ring-2 ring-primary bg-primary/5 rounded-2xl p-2 transition" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Author & Visibility Bar */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3">
            <Avatar
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              size="md"
              status={currentUser.status}
              isVerified={currentUser.isVerified}
            />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                {currentUser.displayName}
              </div>
              {/* Custom Audience Dropdown */}
              <div className="mt-1">
                <CustomSelect
                  value={visibility}
                  onChange={(val) => setVisibility(val)}
                  options={VISIBILITY_OPTIONS}
                  size="sm"
                  buttonClassName="rounded-xl text-[11px] font-semibold py-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border-slate-200/60 dark:border-white/[0.08]"
                />
              </div>
            </div>
          </div>

          {/* AI Generator Control */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/5 border border-primary/20 dark:border-primary/30 rounded-2xl p-1 shadow-2xs">
              <CustomSelect
                value={selectedAITone}
                onChange={(val) => setSelectedAITone(val)}
                options={AI_TONE_OPTIONS}
                size="sm"
                buttonClassName="rounded-xl text-[11px] font-bold py-1 px-2.5 bg-transparent border-0 text-primary hover:bg-white/10 dark:hover:bg-white/10"
              />
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={isGeneratingAI}
                className="text-[10px] font-bold text-white bg-primary hover:bg-primary-hover px-3 py-1.5 rounded-xl transition active:scale-95 disabled:opacity-50 shadow-xs"
              >
                {isGeneratingAI ? "Writing..." : "Inspire"}
              </button>
            </div>

            {onOpenCopilot && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCopilot();
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-white/[0.08] transition active:scale-95"
                title="Open full Nexus Copilot AI Workspace"
              >
                <Wand2 size={13} className="text-purple-400" />
              </button>
            )}
          </div>
        </div>

        {/* Content Textarea */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an insight, showcase a prototype, or drop an image..."
            rows={4}
            maxLength={maxChars}
            className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] focus:border-primary/50 focus:bg-white dark:focus:bg-white/[0.05] rounded-2xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none resize-none transition duration-200"
          />
          <div
            className={`text-right text-[10px] font-mono mt-1 ${
              charsLeft < 40 ? "text-rose-400 font-bold" : "text-slate-400 dark:text-zinc-500"
            }`}
          >
            {charsLeft} / {maxChars}
          </div>
        </div>

        {/* INSTAGRAM FILTER STUDIO COMPONENT */}
        {activeStudioTask && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <InstagramFilterStudio task={activeStudioTask} />
          </div>
        )}

        {/* MULTI-MEDIA THUMBNAIL TRAY */}
        {(tasks.length > 0 || manualMediaList.length > 0) && (
          <div className="p-2.5 rounded-2xl bg-zinc-950/60 border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Sliders size={13} className="text-primary" /> Attached Media ({tasks.length + manualMediaList.length})
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add More
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {/* Active Background Upload Tasks */}
              {tasks.map((task) => {
                const isActive = activeStudioTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    onClick={() => setActiveStudioTaskId(task.id)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition flex-shrink-0 group ${
                      isActive
                        ? "border-primary ring-2 ring-primary/40 scale-105"
                        : "border-white/10 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={task.previewUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />

                    {/* Background upload badge indicator */}
                    <div className="absolute top-1 left-1">
                      {task.status === "ready" ? (
                        <div className="bg-emerald-500 text-black p-0.5 rounded-full shadow">
                          <CheckCircle2 size={10} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="bg-sky-500 text-white p-0.5 rounded-full shadow animate-pulse">
                          <Zap size={10} fill="white" />
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTask(task.id);
                      }}
                      className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-black/80 text-rose-400 hover:text-white hover:bg-rose-500 transition shadow"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                );
              })}

              {/* Manual URL Media items */}
              {manualMediaList.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 group"
                >
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveManualMedia(idx)}
                    className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-black/80 text-rose-400 hover:text-white hover:bg-rose-500 transition shadow"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drag & Drop Direct Upload Zone & URL Trigger */}
        {isAddingMedia && (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
              <span className="flex items-center gap-1.5">
                <UploadCloud size={14} className="text-primary" /> Instant Background Upload
              </span>
              <button
                onClick={() => setIsAddingMedia(false)}
                className="text-zinc-400 hover:text-white transition"
              >
                <X size={14} />
              </button>
            </div>

            {/* Click to browse or Drag-and-drop dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-primary/60 bg-white/[0.02] hover:bg-primary/5 rounded-2xl p-6 text-center cursor-pointer transition group"
            >
              <div className="h-10 w-10 mx-auto rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition flex items-center justify-center mb-2">
                <ImageIcon size={20} />
              </div>
              <div className="text-xs font-bold text-white mb-0.5">
                Choose photos or drag & drop here
              </div>
              <div className="text-[10px] text-zinc-400">
                Instagram-style instant background sync to ImageKit CDN
              </div>
            </div>

            {/* Or Paste URL option */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                Or paste image URL
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  placeholder="Paste URL (https://images.unsplash.com/...)"
                  className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500"
                />
                <Button size="sm" variant="primary" onClick={handleAddManualMedia}>
                  Add
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <span>Quick Presets:</span>
              <button
                type="button"
                onClick={() =>
                  handleAddDemoMedia(
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
                  )
                }
                className="text-primary hover:underline font-medium"
              >
                Spatial Shaders
              </button>
              •
              <button
                type="button"
                onClick={() =>
                  handleAddDemoMedia(
                    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80"
                  )
                }
                className="text-primary hover:underline font-medium"
              >
                Obsidian Hardware
              </button>
            </div>
          </div>
        )}

        {/* Code Snippet Builder */}
        {showCodeInput && (
          <div className="p-3 rounded-2xl bg-zinc-950 border border-primary/30 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 size={15} className="text-primary" />
                <span className="text-xs font-bold text-primary">
                  Code / Shader Snippet
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CustomSelect
                  value={codeLanguage}
                  onChange={(val) => setCodeLanguage(val)}
                  options={CODE_LANG_OPTIONS}
                  size="sm"
                  buttonClassName="rounded-xl text-xs font-mono py-1 px-2.5 bg-zinc-900 border-primary/25 text-primary"
                />
                <button
                  onClick={() => setShowCodeInput(false)}
                  className="text-zinc-400 hover:text-white transition"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder="// Paste your code or shader logic here..."
              rows={4}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-[11px] font-mono text-teal-300 placeholder:text-zinc-600 outline-none resize-none"
            />
          </div>
        )}

        {/* Interactive Poll Builder */}
        {showPollBuilder && (
          <div className="p-3 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 size={15} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400">
                  Community Poll
                </span>
              </div>
              <button
                onClick={() => setShowPollBuilder(false)}
                className="text-zinc-400 hover:text-white transition"
              >
                <X size={14} />
              </button>
            </div>
            <input
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Ask a community question..."
              className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500"
            />
            <div className="space-y-2">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleUpdatePollOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 glass-input rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => handleRemovePollOption(i)}
                      className="text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {pollOptions.length < 4 && (
              <button
                type="button"
                onClick={handleAddPollOption}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 active:scale-95 transition"
              >
                <Plus size={13} /> Add Option
              </button>
            )}
          </div>
        )}

        {/* Hashtag Suggestions */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1">
            <Hash size={11} /> Suggested Sparks
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_HASHTAGS.map((tag) => {
              const isIncluded = content.includes(`#${tag}`);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddHashtag(tag)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-all duration-150 active:scale-95 border ${
                    isIncluded
                      ? "bg-primary/15 text-primary border-primary/40 font-semibold"
                      : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/[0.06] hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Attachment Toggles & Action Bar */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Native Photo Picker with instant background upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition active:scale-95"
              title="Upload photo from device (Instant sync)"
            >
              <ImageIcon size={19} />
            </button>

            <button
              type="button"
              onClick={() => setIsAddingMedia(!isAddingMedia)}
              className={`p-2 rounded-xl transition active:scale-95 ${
                isAddingMedia
                  ? "bg-primary/15 text-primary"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              }`}
              title="Add Image via URL or Dropzone"
            >
              <UploadCloud size={19} />
            </button>

            <button
              type="button"
              onClick={() => setShowCodeInput(!showCodeInput)}
              className={`p-2 rounded-xl transition active:scale-95 ${
                showCodeInput
                  ? "bg-primary/15 text-primary"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              }`}
              title="Add Code Snippet"
            >
              <Code2 size={19} />
            </button>

            <button
              type="button"
              onClick={() => setShowPollBuilder(!showPollBuilder)}
              className={`p-2 rounded-xl transition active:scale-95 ${
                showPollBuilder
                  ? "bg-amber-500/15 text-amber-500"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              }`}
              title="Add Poll"
            >
              <BarChart2 size={19} />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting || (!content.trim() && tasks.length === 0 && manualMediaList.length === 0)}
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-primary via-indigo-600 to-purple-600 hover:from-primary-hover hover:to-purple-500 transition shadow-md shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Publish Spark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
