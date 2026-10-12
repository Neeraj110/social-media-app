"use client";

import React from "react";
import { UserStatus } from "../../types";
import { Check } from "lucide-react";

interface AvatarProps {
  src: string;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  status?: UserStatus;
  showStatus?: boolean;
  isVerified?: boolean;
  hasStory?: boolean;
  hasUnseenStory?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Avatar({
  src,
  alt = "User avatar",
  size = "md",
  status,
  showStatus = false,
  isVerified = false,
  hasStory = false,
  hasUnseenStory = false,
  className = "",
  onClick,
}: AvatarProps) {
  const sizeMap = {
    xs: "h-6 w-6 text-[9px]",
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-sm",
    xl: "h-20 w-20 text-base",
    "2xl": "h-28 w-28 text-xl",
  };

  const statusDotSize = {
    xs: "h-1.5 w-1.5 ring-1",
    sm: "h-2.5 w-2.5 ring-2",
    md: "h-3 w-3 ring-2",
    lg: "h-4 w-4 ring-2",
    xl: "h-5 w-5 ring-[3px]",
    "2xl": "h-6 w-6 ring-4",
  };

  const verifiedBadgeSize = {
    xs: "h-2.5 w-2.5 -right-0.5 -bottom-0.5",
    sm: "h-3.5 w-3.5 -right-1 -bottom-1",
    md: "h-4 w-4 -right-1 -bottom-1",
    lg: "h-5 w-5 -right-1 -bottom-1",
    xl: "h-6 w-6 -right-1 -bottom-1",
    "2xl": "h-7 w-7 right-0 bottom-0",
  };

  const statusColor = {
    online: "bg-emerald-400 presence-dot",
    idle: "bg-amber-400",
    offline: "bg-zinc-600",
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-block shrink-0 select-none ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      <div
        className={`relative overflow-hidden rounded-full transition-transform duration-200 ${
          sizeMap[size]
        } ${
          hasStory
            ? hasUnseenStory
              ? "ring-2 ring-offset-2 ring-offset-ink ring-primary p-0.5"
              : "ring-2 ring-offset-2 ring-offset-ink ring-zinc-700 p-0.5"
            : ""
        }`}
      >
        <img
          src={src || "/default-avatar.png"}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/default-avatar.png";
          }}
        />
      </div>

      {/* Online / Idle Status Dot */}
      {status && showStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-ink ${
            statusColor[status]
          } ${statusDotSize[size]}`}
        />
      )}

      {/* Verified Badge Overlay */}
      {isVerified && !status && (
        <span
          className={`absolute rounded-full bg-primary grid place-items-center text-zinc-950 font-bold ring-2 ring-ink ${verifiedBadgeSize[size]}`}
          title="Verified Creator"
        >
          <Check size={size === "xs" ? 6 : size === "sm" ? 8 : 10} strokeWidth={3.5} />
        </span>
      )}
    </div>
  );
}
