"use client";

import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  hoverEffect?: boolean;
}

export function GlassCard({
  children,
  className = "",
  elevated = false,
  hoverEffect = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`bg-white dark:bg-[#1B1B1B] rounded-xl border border-slate-200 dark:border-[#303030] transition-all duration-200 ${
        hoverEffect ? "hover:border-primary/50" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
