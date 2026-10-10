"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { uploadToImageKit, ImageKitUploadResult } from "./imagekit";
import { applyFilterToImageBlob, FilterPreset, INSTAGRAM_FILTERS } from "./filters";

export type UploadStatus = "idle" | "preparing" | "uploading" | "processing" | "ready" | "error";

export interface BackgroundUploadTask {
  id: string;
  originalFile: File | Blob;
  fileName: string;
  previewUrl: string;
  status: UploadStatus;
  progress: number;
  remoteUrl: string | null;
  filterId: string;
  filterIntensity: number;
  error: string | null;
  provider?: "imagekit" | "local";
  promise: Promise<string>;
  startTime: number;
  completedTime?: number;
}

// Global in-memory cache of in-flight / completed background upload tasks
const globalTaskRegistry = new Map<string, BackgroundUploadTask>();
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

/**
 * Initiates an immediate background upload to ImageKit.
 * Instagram secret sauce: starts streaming bytes to the cloud the instant a photo is selected.
 */
export function startBackgroundUpload(
  fileOrBlob: File | Blob,
  options: {
    folder?: string;
    filterId?: string;
    filterIntensity?: number;
    fileName?: string;
  } = {}
): BackgroundUploadTask {
  const taskId = `bg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const previewUrl = URL.createObjectURL(fileOrBlob);
  const fileName =
    options.fileName ||
    (fileOrBlob instanceof File
      ? fileOrBlob.name
      : `instagram_post_${Date.now()}.jpg`);
  const folder = options.folder || "posts";
  const filterId = options.filterId || "normal";
  const filterIntensity = options.filterIntensity ?? 1.0;

  let resolvePromise: (url: string) => void;
  let rejectPromise: (err: any) => void;
  const promise = new Promise<string>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const task: BackgroundUploadTask = {
    id: taskId,
    originalFile: fileOrBlob,
    fileName,
    previewUrl,
    status: "uploading",
    progress: 5,
    remoteUrl: null,
    filterId,
    filterIntensity,
    error: null,
    promise,
    startTime: Date.now(),
  };

  globalTaskRegistry.set(taskId, task);
  notifyListeners();

  // Execute upload asynchronously in background
  (async () => {
    try {
      let uploadTarget: File | Blob = fileOrBlob;

      // If a non-normal filter is active at initial upload, bake it
      if (filterId !== "normal" && typeof window !== "undefined") {
        try {
          task.status = "processing";
          notifyListeners();
          uploadTarget = await applyFilterToImageBlob(
            fileOrBlob,
            filterId,
            filterIntensity,
            "image/jpeg",
            0.92
          );
        } catch (filterErr) {
          console.warn("[BackgroundUpload] Filter apply warning:", filterErr);
          uploadTarget = fileOrBlob;
        }
      }

      task.status = "uploading";
      notifyListeners();

      const result: ImageKitUploadResult = await uploadToImageKit(
        uploadTarget,
        fileName,
        folder,
        (percent) => {
          task.progress = Math.max(10, percent);
          notifyListeners();
        }
      );

      task.remoteUrl = result.url;
      task.provider = result.provider;
      task.status = "ready";
      task.progress = 100;
      task.completedTime = Date.now();
      resolvePromise!(result.url);
      notifyListeners();
    } catch (err: any) {
      console.error("[BackgroundUpload] Background upload failed, using local preview fallback:", err);
      task.status = "ready"; // Fall back gracefully to previewUrl so UI is never stuck
      task.remoteUrl = previewUrl;
      task.error = err?.message || "Upload network failure";
      task.progress = 100;
      task.completedTime = Date.now();
      resolvePromise!(previewUrl);
      notifyListeners();
    }
  })();

  return task;
}

/**
 * Re-render and re-upload in background when user switches or customizes a filter
 */
export function updateTaskFilter(
  taskId: string,
  newFilterId: string,
  intensity: number = 1.0,
  folder: string = "posts"
): void {
  const task = globalTaskRegistry.get(taskId);
  if (!task) return;

  task.filterId = newFilterId;
  task.filterIntensity = intensity;
  notifyListeners();

  // Re-bake and update in background
  (async () => {
    try {
      task.status = "processing";
      task.progress = 20;
      notifyListeners();

      const filteredBlob =
        newFilterId === "normal"
          ? task.originalFile
          : await applyFilterToImageBlob(
              task.originalFile,
              newFilterId,
              intensity,
              "image/jpeg",
              0.92
            );

      task.status = "uploading";
      notifyListeners();

      const result = await uploadToImageKit(
        filteredBlob,
        `filtered_${task.fileName}`,
        folder,
        (percent) => {
          task.progress = Math.max(20, percent);
          notifyListeners();
        }
      );

      task.remoteUrl = result.url;
      task.provider = result.provider;
      task.status = "ready";
      task.progress = 100;
      notifyListeners();
    } catch (err) {
      console.warn("[BackgroundUpload] Filter update re-upload note:", err);
      task.status = "ready";
      notifyListeners();
    }
  })();
}

/**
 * React Hook to manage background upload pipelines in components
 */
export function useBackgroundUploader() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const getTask = useCallback((taskId: string): BackgroundUploadTask | undefined => {
    return globalTaskRegistry.get(taskId);
  }, []);

  const startUpload = useCallback(
    (
      fileOrBlob: File | Blob,
      options?: {
        folder?: string;
        filterId?: string;
        filterIntensity?: number;
        fileName?: string;
      }
    ) => {
      return startBackgroundUpload(fileOrBlob, options);
    },
    []
  );

  const applyFilter = useCallback(
    (taskId: string, filterId: string, intensity: number = 1.0, folder?: string) => {
      updateTaskFilter(taskId, filterId, intensity, folder);
    },
    []
  );

  /**
   * Finalize media URL before publishing.
   * If already uploaded in background (the common case), resolves instantly in 0ms!
   */
  const resolveMediaUrl = useCallback(async (taskId: string): Promise<string> => {
    const task = globalTaskRegistry.get(taskId);
    if (!task) return "";
    if (task.status === "ready" && task.remoteUrl) {
      return task.remoteUrl;
    }
    return await task.promise;
  }, []);

  return {
    getTask,
    startUpload,
    applyFilter,
    resolveMediaUrl,
    allTasks: Array.from(globalTaskRegistry.values()),
  };
}
