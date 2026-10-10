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
      className={`rounded-2xl transition-all duration-300 ${
        elevated ? "glass-elevated" : "glass"
      } ${
        hoverEffect ? "hover:border-primary/30 hover:shadow-card-hover" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
