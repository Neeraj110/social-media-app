"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface CustomSelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}

export function CustomSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  size = "sm",
  disabled = false,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const sizeClasses = {
    sm: "text-xs py-1 px-2.5 rounded-xl gap-1.5",
    md: "text-xs py-2 px-3 rounded-xl gap-2",
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between font-medium transition-all select-none border active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
          sizeClasses[size]
        } ${
          isOpen
            ? "bg-slate-100 dark:bg-white/[0.1] border-primary/40 text-slate-900 dark:text-white ring-2 ring-primary/20"
            : "bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-zinc-200"
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 truncate min-w-0">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-slate-500 dark:text-zinc-400">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown
          size={13}
          className={`text-slate-400 dark:text-zinc-400 transition-transform duration-200 flex-shrink-0 ml-1 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 min-w-[160px] max-w-[280px] z-50 p-1.5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/[0.1] shadow-2xl animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${menuClassName}`}
        >
          <div className="space-y-0.5 max-h-60 overflow-y-auto hide-scroll">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition select-none ${
                    isSelected
                      ? "bg-primary/10 text-primary font-bold dark:bg-primary/20"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {option.icon && (
                      <span
                        className={`flex-shrink-0 ${
                          isSelected ? "text-primary" : "text-slate-400 dark:text-zinc-400"
                        }`}
                      >
                        {option.icon}
                      </span>
                    )}
                    <div className="truncate">
                      <div className="text-xs truncate">{option.label}</div>
                      {option.description && (
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={13} className="text-primary flex-shrink-0 ml-2" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
