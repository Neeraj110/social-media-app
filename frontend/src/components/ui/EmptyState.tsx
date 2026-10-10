"use client";

import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`glass rounded-2xl p-8 text-center flex flex-col items-center justify-center select-none ${className}`}
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-raised border border-white/10 text-primary mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="font-display font-bold text-base text-white mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="active:scale-95">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
