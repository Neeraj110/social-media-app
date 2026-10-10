"use client";

import React, { useState } from "react";
import { MediaItem } from "../../types";
import { ChevronLeft, ChevronRight, Maximize2, Sparkles } from "lucide-react";
import { getImageKitUrl } from "../../lib/imagekit";

interface MediaCarouselProps {
  media: MediaItem[];
  onOpenLightbox?: (index: number) => void;
}

export function MediaCarousel({ media, onOpenLightbox }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return null;

  // Single media render
  if (media.length === 1) {
    const item = media[0];
    const optimizedUrl = getImageKitUrl(item.url, {
      width: 1200,
      quality: 85,
      format: "auto",
    });

    return (
      <div className="relative group overflow-hidden rounded-2xl bg-black/40 border border-white/[0.06] select-none my-3">
        {item.type === "video" ? (
          <video
            src={item.url}
            poster={item.thumbnailUrl}
            controls
            className="w-full max-h-[500px] object-cover"
          />
        ) : (
          <div
            className="relative cursor-pointer max-h-[520px] overflow-hidden"
            onClick={() => onOpenLightbox?.(0)}
          >
            <img
              src={optimizedUrl}
              alt={item.caption || "Post media"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
              {item.caption && (
                <span className="text-xs text-white/90 font-medium line-clamp-1">
                  {item.caption}
                </span>
              )}
              <span className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md">
                <Maximize2 size={14} />
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Multi-item carousel
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const currentItem = media[currentIndex];
  const optimizedCurrentUrl = getImageKitUrl(currentItem.url, {
    width: 1200,
    quality: 85,
    format: "auto",
  });

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-black/40 border border-white/[0.06] select-none my-3">
      {/* Media Frame */}
      <div
        className="relative aspect-video sm:aspect-[16/10] w-full cursor-pointer overflow-hidden"
        onClick={() => onOpenLightbox?.(currentIndex)}
      >
        {currentItem.type === "video" ? (
          <video
            src={currentItem.url}
            poster={currentItem.thumbnailUrl}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={optimizedCurrentUrl}
            alt={currentItem.caption || `Media ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        )}

        {/* Gradient Overlay for info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 pointer-events-none">
          {currentItem.caption ? (
            <span className="text-xs text-white/90 font-medium line-clamp-1">
              {currentItem.caption}
            </span>
          ) : (
            <span />
          )}
          <span className="grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md pointer-events-auto">
            <Maximize2 size={14} />
          </span>
        </div>
      </div>

      {/* Left/Right Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white hover:bg-primary/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/10"
        aria-label="Previous image"
      >
        <ChevronLeft size={18} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white hover:bg-primary/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/10"
        aria-label="Next image"
      >
        <ChevronRight size={18} />
      </button>

      {/* Segment / Indicator Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 z-10">
        {media.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-5 bg-gradient-to-r from-primary to-cyan shadow-sm"
                : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Index Counter Pill */}
      <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/10">
        {currentIndex + 1}/{media.length}
      </div>
    </div>
  );
}
