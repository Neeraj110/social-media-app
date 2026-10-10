"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  INSTAGRAM_FILTERS,
  FilterPreset,
} from "../../lib/filters";
import {
  BackgroundUploadTask,
  useBackgroundUploader,
} from "../../lib/backgroundUploader";
import {
  Sparkles,
  Sliders,
  Check,
  Zap,
  Layers,
  Crop,
  Eye,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

interface InstagramFilterStudioProps {
  task: BackgroundUploadTask;
  onFilterChange?: (filterId: string, intensity: number) => void;
  aspectRatio?: "1:1" | "4:5" | "16:9" | "auto";
  onAspectRatioChange?: (ratio: "1:1" | "4:5" | "16:9" | "auto") => void;
}

export function InstagramFilterStudio({
  task,
  onFilterChange,
  aspectRatio = "auto",
  onAspectRatioChange,
}: InstagramFilterStudioProps) {
  const { applyFilter } = useBackgroundUploader();
  const [selectedFilterId, setSelectedFilterId] = useState<string>(task.filterId || "normal");
  const [intensity, setIntensity] = useState<number>(task.filterIntensity ?? 1.0);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [showAdjustments, setShowAdjustments] = useState<boolean>(false);

  const activeFilter =
    INSTAGRAM_FILTERS.find((f) => f.id === selectedFilterId) || INSTAGRAM_FILTERS[0];

  const handleSelectFilter = (filter: FilterPreset) => {
    setSelectedFilterId(filter.id);
    onFilterChange?.(filter.id, intensity);
    applyFilter(task.id, filter.id, intensity);
  };

  const handleIntensityChange = (newIntensity: number) => {
    setIntensity(newIntensity);
    onFilterChange?.(selectedFilterId, newIntensity);
    applyFilter(task.id, selectedFilterId, newIntensity);
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "1:1":
        return "aspect-square";
      case "4:5":
        return "aspect-[4/5]";
      case "16:9":
        return "aspect-video";
      default:
        return "max-h-[380px] aspect-auto";
    }
  };

  return (
    <div className="space-y-3 bg-zinc-950/80 rounded-2xl p-3.5 border border-white/10 select-none shadow-xl">
      {/* Studio Header & Background Upload Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles size={13} />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">
            Filter Studio
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">
            • {activeFilter.name}
          </span>
        </div>

        {/* Real-time Background Upload indicator */}
        <div className="flex items-center gap-1.5">
          {task.status === "ready" ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-in fade-in">
              <CheckCircle2 size={11} className="text-emerald-400" />
              <span>Instant 0ms Ready</span>
            </div>
          ) : task.status === "processing" ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
              <RefreshCw size={10} className="animate-spin text-amber-400" />
              <span>Applying Matrix...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-sky-950/60 border border-sky-500/30 px-2 py-0.5 rounded-full">
              <Zap size={11} className="text-sky-400 fill-sky-400 animate-pulse" />
              <span>Pre-uploading {task.progress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Image Live Preview Canvas / Stage */}
      <div className="relative rounded-xl overflow-hidden bg-black/80 flex items-center justify-center border border-white/10 group">
        <div className={`w-full overflow-hidden flex items-center justify-center ${getAspectClass()}`}>
          <img
            src={task.previewUrl}
            alt="Preview"
            style={{
              filter: isComparing ? "none" : activeFilter.cssFilter(intensity),
              transition: "filter 0.15s ease-out",
            }}
            className="w-full h-full object-cover max-h-[380px]"
          />
        </div>

        {/* Live Filter Name Watermark */}
        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/10 text-[10px] font-mono text-zinc-200 pointer-events-none">
          {isComparing ? "Original (Raw)" : `${activeFilter.name} (${Math.round(intensity * 100)}%)`}
        </div>

        {/* Press & Hold to Compare Original */}
        <button
          type="button"
          onMouseDown={() => setIsComparing(true)}
          onMouseUp={() => setIsComparing(false)}
          onTouchStart={() => setIsComparing(true)}
          onTouchEnd={() => setIsComparing(false)}
          className="absolute bottom-2.5 right-2.5 bg-black/70 hover:bg-black/90 active:bg-primary backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 text-[10px] font-semibold text-white transition flex items-center gap-1 shadow-lg active:scale-95"
          title="Press and hold to compare with original photo"
        >
          <Eye size={12} />
          <span>Hold to Compare</span>
        </button>

        {/* Aspect Ratio Selector Pills */}
        {onAspectRatioChange && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md p-0.5 rounded-xl border border-white/15">
            {(["auto", "1:1", "4:5", "16:9"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onAspectRatioChange(r)}
                className={`px-1.5 py-0.5 rounded-lg text-[9px] font-bold font-mono transition ${
                  aspectRatio === r
                    ? "bg-primary text-zinc-950 shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {r === "auto" ? "Original" : r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Intensity / Adjustment Slider Toggle */}
      {selectedFilterId !== "normal" && (
        <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 flex items-center gap-1 font-medium">
              <Sliders size={12} className="text-primary" /> Filter Strength
            </span>
            <span className="font-mono font-bold text-primary text-[10px]">
              {Math.round(intensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={intensity}
            onChange={(e) => handleIntensityChange(parseFloat(e.target.value))}
            className="w-full accent-primary h-1 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>
      )}

      {/* Preset Carousel with Live Previews */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
          <span>Instagram Filter Presets</span>
          <span>{INSTAGRAM_FILTERS.length} styles</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {INSTAGRAM_FILTERS.map((filter) => {
            const isSelected = selectedFilterId === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => handleSelectFilter(filter)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 group focus:outline-none transition ${
                  isSelected ? "scale-105" : "hover:opacity-90"
                }`}
              >
                {/* Thumbnail live mini-frame */}
                <div
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition shadow-md ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-white/10 group-hover:border-white/30"
                  }`}
                >
                  <img
                    src={task.previewUrl}
                    alt={filter.name}
                    style={{
                      filter: filter.cssFilter(1),
                    }}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-zinc-950 p-0.5 rounded-full shadow">
                        <Check size={11} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>

                <span
                  className={`text-[10px] font-semibold truncate max-w-[68px] ${
                    isSelected ? "text-primary font-bold" : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                >
                  {filter.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
