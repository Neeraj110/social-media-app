"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline" | "cyan" | "glass";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "secondary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] rounded-xl";

  const sizeStyles = {
    xs: "px-2.5 py-1 text-[11px] gap-1.5",
    sm: "px-3.5 py-1.5 text-xs gap-2",
    md: "px-4 py-2 text-xs font-semibold gap-2",
    lg: "px-5 py-2.5 text-sm font-semibold gap-2.5",
    icon: "h-9 w-9 p-0 rounded-full",
  };

  const variantStyles = {
    primary:
      "bg-primary hover:bg-primary-hover text-white font-semibold shadow-md shadow-blue-500/20 active:scale-[0.98]",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 shadow-sm",
    glass:
      "glass hover:bg-slate-100/90 text-slate-800 border border-slate-200/80 shadow-sm",
    ghost:
      "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100",
    outline:
      "bg-transparent text-primary hover:bg-primary/10 border border-primary/40 hover:border-primary",
    cyan:
      "bg-teal-500 hover:bg-teal-600 text-white font-semibold shadow-sm",
    destructive:
      "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-3.5 w-3.5 mr-1.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
