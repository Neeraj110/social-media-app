"use client";

import React from "react";
import { Poll, PollOption } from "../../types";
import { CheckCircle2, BarChart2 } from "lucide-react";

interface PollCardProps {
  poll: Poll;
  onVote: (optionId: string) => void;
}

export function PollCard({ poll, onVote }: PollCardProps) {
  const hasVoted = poll.userVotedOptionId !== undefined;

  return (
    <div className="my-3 rounded-2xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/80 dark:border-white/[0.08] p-4 select-none">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={16} className="text-primary" />
        <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
          {poll.question}
        </h4>
      </div>

      <div className="space-y-2">
        {poll.options.map((opt: PollOption) => {
          const percentage =
            poll.totalVotes > 0
              ? Math.round((opt.votes / poll.totalVotes) * 100)
              : 0;
          const isSelected = poll.userVotedOptionId === opt.id;

          return (
            <button
              key={opt.id}
              disabled={hasVoted}
              onClick={() => onVote(opt.id)}
              className={`relative w-full overflow-hidden rounded-xl p-3 text-left transition-all border ${
                isSelected
                  ? "border-primary bg-blue-50/80 dark:bg-primary/15 shadow-xs"
                  : hasVoted
                  ? "border-slate-200/60 dark:border-white/[0.05] bg-white dark:bg-white/[0.02]"
                  : "border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] hover:bg-slate-100/80 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 active:scale-[0.99]"
              }`}
            >
              {/* Animated fill progress bar */}
              {hasVoted && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-xl ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-100 to-teal-50 dark:from-primary/30 dark:to-teal-500/20"
                      : "bg-slate-100 dark:bg-white/[0.04]"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )}

              {/* Option label & stats */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {isSelected && (
                    <CheckCircle2 size={15} className="text-primary shrink-0" />
                  )}
                  <span
                    className={`text-xs font-semibold truncate ${
                      isSelected ? "text-primary font-bold" : "text-slate-700 dark:text-zinc-300"
                    }`}
                  >
                    {opt.text}
                  </span>
                </div>

                {hasVoted && (
                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400">
                      {opt.votes} {opt.votes === 1 ? "vote" : "votes"}
                    </span>
                    <span
                      className={`text-xs font-mono font-black ${
                        isSelected ? "text-primary font-bold" : "text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-500 font-medium">
        <span>{poll.totalVotes.toLocaleString()} total votes</span>
        <span>
          {poll.expiresAt ? `Ends in ${poll.expiresAt}` : "Poll active"}
        </span>
      </div>
    </div>
  );
}
