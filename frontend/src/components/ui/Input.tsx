"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  label?: string;
  error?: string;
}

export function Input({
  icon,
  endIcon,
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          className={`w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 transition-all focus:border-primary/50 outline-none ${
            icon ? "pl-10" : ""
          } ${endIcon ? "pr-10" : ""} ${
            error ? "border-rose-500/80 focus:ring-rose-500/20" : ""
          } ${className}`}
          {...props}
        />
        {endIcon && (
          <div className="absolute right-3.5 text-zinc-400 flex items-center">
            {endIcon}
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
    </div>
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`w-full glass-input rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 resize-none transition-all focus:border-primary/50 outline-none ${
          error ? "border-rose-500/80 focus:ring-rose-500/20" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
    </div>
  );
}
