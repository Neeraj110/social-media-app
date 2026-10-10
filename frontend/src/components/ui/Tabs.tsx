"use client";

import React from "react";

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "pill" | "line";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  variant = "pill",
}: TabsProps) {
  if (variant === "line") {
    return (
      <div className={`flex items-center gap-6 border-b border-white/[0.08] select-none ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative flex items-center gap-2 pb-3.5 text-xs font-semibold transition-all active:scale-[0.98] ${
                isActive
                  ? "text-primary border-b-2 border-primary -mb-px font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive
                      ? "bg-primary text-zinc-950"
                      : "bg-raised text-zinc-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 p-1 rounded-2xl bg-panel border border-white/[0.06] select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all select-none active:scale-[0.98] ${
              isActive
                ? "bg-raised text-primary shadow-sm border border-white/10 font-bold"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isActive
                    ? "bg-primary text-zinc-950"
                    : "bg-white/10 text-zinc-400"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
