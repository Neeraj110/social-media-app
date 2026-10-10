"use client";

import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { MediaItem } from "../../types";

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: MediaItem[];
  initialIndex?: number;
}

export function LightboxModal({
  isOpen,
  onClose,
  mediaList,
  initialIndex = 0,
}: LightboxModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, mediaList]);

  if (!isOpen || mediaList.length === 0) return null;

  const currentMedia = mediaList[currentIndex] || mediaList[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-xs font-semibold text-zinc-300">
          <span className="font-mono text-primary font-bold">
            {currentIndex + 1}
          </span>{" "}
          / <span className="font-mono">{mediaList.length}</span>
          {currentMedia.caption && (
            <span className="text-zinc-400 font-normal ml-3 border-l border-white/20 pl-3">
              {currentMedia.caption}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(currentMedia.url, "_blank")}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="Open original"
          >
            <Download size={15} />
          </button>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div className="relative max-w-5xl max-h-[80vh] flex items-center justify-center p-4">
        <img
          src={currentMedia.url}
          alt={currentMedia.caption || "Fullscreen preview"}
          className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
        />
      </div>

      {/* Left / Right Nav Arrows */}
      {mediaList.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-black/60 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-black/60 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition active:scale-95"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}
