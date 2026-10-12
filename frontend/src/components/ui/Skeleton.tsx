"use client";

import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`shimmer-mask rounded-xl bg-white/[0.06] ${className}`}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-32 rounded" />
          <Skeleton className="h-2.5 w-20 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-4/5 rounded" />
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-4">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <Skeleton className="h-6 w-8 rounded-full" />
      </div>
    </div>
  );
}

export const SkeletonPost = PostSkeleton;

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="flex items-end justify-between px-6 -mt-16">
        <Skeleton className="h-28 w-28 rounded-full border-4 border-[var(--bg-app)]" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="space-y-3 px-6">
        <Skeleton className="h-5 w-48 rounded" />
        <Skeleton className="h-3.5 w-32 rounded" />
        <Skeleton className="h-3.5 w-full max-w-lg rounded" />
      </div>
    </div>
  );
}

export function ViewSkeleton() {
  return (
    <div className="space-y-5 py-4 w-full animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="space-y-2.5 pt-2">
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-5/6 rounded-md" />
        <Skeleton className="h-3.5 w-2/3 rounded-md" />
      </div>
    </div>
  );
}

