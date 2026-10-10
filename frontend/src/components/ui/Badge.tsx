"use client";

import React from "react";
import { Sparkles, Check } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "success" | "warning" | "destructive" | "ai";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "secondary",
  size = "sm",
  className = "",
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    primary: "bg-primary/20 text-primary border border-primary/30",
    secondary: "bg-raised text-zinc-300 border border-white/[0.08]",
    outline: "bg-transparent text-zinc-400 border border-white/10",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    destructive: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
    ai: "bg-primary/15 text-primary border border-primary/30",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {variant === "ai" && <Sparkles size={11} className="text-primary animate-pulse" />}
      {children}
    </span>
  );
}

export function VerifiedBadge({ size = 14 }: { size?: number }) {
  return (
    <span
      className="inline-grid place-items-center rounded-full bg-primary text-zinc-950 p-0.5 shadow-sm font-bold"
      style={{ width: size, height: size }}
      title="Verified Account"
    >
      <Check size={size - 4} strokeWidth={3.5} />
    </span>
  );
}
