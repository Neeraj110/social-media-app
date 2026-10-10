export interface FilterPreset {
  id: string;
  name: string;
  subtitle: string;
  cssFilter: (intensity?: number) => string;
  rawFilter: string;
  previewBg: string;
  description: string;
}

export const INSTAGRAM_FILTERS: FilterPreset[] = [
  {
    id: "normal",
    name: "Normal",
    subtitle: "Original",
    cssFilter: () => "none",
    rawFilter: "none",
    previewBg: "from-zinc-700 to-zinc-900",
    description: "No filter applied. Pure original capture.",
  },
  {
    id: "clarendon",
    name: "Clarendon",
    subtitle: "Vibrant & Crisp",
    cssFilter: (intensity = 1) =>
      `contrast(${1 + 0.25 * intensity}) saturate(${1 + 0.35 * intensity}) brightness(${1 + 0.05 * intensity})`,
    rawFilter: "contrast(1.25) saturate(1.35) brightness(1.05)",
    previewBg: "from-sky-500 to-blue-700",
    description: "Adds light to lighter areas and darkens shadows. Cool blues and rich contrast.",
  },
  {
    id: "juno",
    name: "Juno",
    subtitle: "Warm & Punchy",
    cssFilter: (intensity = 1) =>
      `contrast(${1 + 0.2 * intensity}) saturate(${1 + 0.45 * intensity}) brightness(${1 + 0.08 * intensity}) hue-rotate(-${6 * intensity}deg)`,
    rawFilter: "contrast(1.2) saturate(1.45) brightness(1.08) hue-rotate(-6deg)",
    previewBg: "from-amber-500 to-emerald-600",
    description: "Tints cool tones green and enhances warm tones and whites with glow.",
  },
  {
    id: "ludwig",
    name: "Ludwig",
    subtitle: "Minimalist Glow",
    cssFilter: (intensity = 1) =>
      `contrast(${1 + 0.1 * intensity}) saturate(${1 + 0.15 * intensity}) brightness(${1 + 0.06 * intensity}) sepia(${0.15 * intensity})`,
    rawFilter: "contrast(1.1) saturate(1.15) brightness(1.06) sepia(0.15)",
    previewBg: "from-amber-200 to-yellow-600",
    description: "Slight desaturation with subtle golden enhancement for architecture and portraits.",
  },
  {
    id: "valencia",
    name: "Valencia",
    subtitle: "Warm Vintage",
    cssFilter: (intensity = 1) =>
      `contrast(${1 + 0.1 * intensity}) brightness(${1 + 0.1 * intensity}) sepia(${0.3 * intensity}) saturate(${1 + 0.15 * intensity})`,
    rawFilter: "contrast(1.1) brightness(1.1) sepia(0.3) saturate(1.15)",
    previewBg: "from-orange-400 to-amber-700",
    description: "Fades colors with an antique warm wash, perfect for golden hour and nostalgic scenes.",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    subtitle: "Dark Cyber",
    cssFilter: (intensity = 1) =>
      `contrast(${1 + 0.4 * intensity}) saturate(${1 - 0.2 * intensity}) brightness(${1 - 0.1 * intensity})`,
    rawFilter: "contrast(1.4) saturate(0.8) brightness(0.9)",
    previewBg: "from-slate-800 to-zinc-950",
    description: "Sleek hardware aesthetic with deep midnight blacks and pronounced texture.",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    subtitle: "Neon Glow",
    cssFilter: (intensity = 1) =>
      `contrast(${1 + 0.35 * intensity}) saturate(${1 + 0.8 * intensity}) hue-rotate(${290 * intensity}deg) brightness(${1 + 0.1 * intensity})`,
    rawFilter: "contrast(1.35) saturate(1.8) hue-rotate(290deg) brightness(1.1)",
    previewBg: "from-fuchsia-600 to-cyan-500",
    description: "Hyper-saturated neon aesthetic blending vivid magenta, cyan, and violet spectrums.",
  },
  {
    id: "golden_hour",
    name: "Golden Hour",
    subtitle: "Sunset Radiance",
    cssFilter: (intensity = 1) =>
      `contrast(${1 + 0.15 * intensity}) brightness(${1 + 0.15 * intensity}) saturate(${1 + 0.5 * intensity}) sepia(${0.35 * intensity})`,
    rawFilter: "contrast(1.15) brightness(1.15) saturate(1.5) sepia(0.35)",
    previewBg: "from-amber-400 to-orange-600",
    description: "Drenches the frame with the luminous, rich warmth of late afternoon sunlight.",
  },
  {
    id: "noir",
    name: "Noir",
    subtitle: "Cinematic B&W",
    cssFilter: (intensity = 1) =>
      `grayscale(${1 * intensity}) contrast(${1 + 0.45 * intensity}) brightness(${1 - 0.05 * intensity})`,
    rawFilter: "grayscale(1) contrast(1.45) brightness(0.95)",
    previewBg: "from-zinc-400 to-zinc-900",
    description: "High-contrast monochrome inspired by classic French film noir and dramatic shadows.",
  },
  {
    id: "retro_90s",
    name: "Retro 90s",
    subtitle: "Analog Film",
    cssFilter: (intensity = 1) =>
      `sepia(${0.4 * intensity}) contrast(${1 + 0.2 * intensity}) brightness(${1 + 0.08 * intensity}) saturate(${1 + 0.3 * intensity})`,
    rawFilter: "sepia(0.4) contrast(1.2) brightness(1.08) saturate(1.3)",
    previewBg: "from-rose-400 to-teal-700",
    description: "Warm filmic grain style reminiscent of 35mm disposable cameras and 90s aesthetics.",
  },
  {
    id: "emerald_matrix",
    name: "Emerald",
    subtitle: "Sci-Fi Green",
    cssFilter: (intensity = 1) =>
      `contrast(${1 + 0.25 * intensity}) saturate(${1 + 0.35 * intensity}) hue-rotate(${95 * intensity}deg) brightness(${1 + 0.05 * intensity})`,
    rawFilter: "contrast(1.25) saturate(1.35) hue-rotate(95deg) brightness(1.05)",
    previewBg: "from-emerald-400 to-teal-800",
    description: "Lush cybernetic green glow highlighting digital structures and neon greenery.",
  },
  {
    id: "tokyo_nights",
    name: "Tokyo Nights",
    subtitle: "Midnight Cobalt",
    cssFilter: (intensity = 1) =>
      `contrast(${1 + 0.3 * intensity}) saturate(${1 + 0.5 * intensity}) hue-rotate(${200 * intensity}deg) brightness(${1 - 0.08 * intensity})`,
    rawFilter: "contrast(1.3) saturate(1.5) hue-rotate(200deg) brightness(0.92)",
    previewBg: "from-indigo-600 to-blue-950",
    description: "Deep oceanic cobalt tones and cinematic illumination for night cityscapes.",
  },
];

/**
 * Render an image with an Instagram filter onto a hidden Canvas and export as a Blob
 */
export async function applyFilterToImageBlob(
  sourceUrlOrBlob: string | Blob,
  filterId: string,
  intensity: number = 1.0,
  mimeType: string = "image/jpeg",
  quality: number = 0.92
): Promise<Blob> {
  const filter = INSTAGRAM_FILTERS.find((f) => f.id === filterId) || INSTAGRAM_FILTERS[0];
  if (filter.id === "normal" && typeof sourceUrlOrBlob !== "string" && sourceUrlOrBlob instanceof Blob) {
    return sourceUrlOrBlob;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const objectUrl =
      typeof sourceUrlOrBlob === "string" ? sourceUrlOrBlob : URL.createObjectURL(sourceUrlOrBlob);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Canvas 2D context not supported");
        }

        // Apply CSS filter to Canvas context
        const filterStr = filter.cssFilter(intensity);
        if (filterStr && filterStr !== "none") {
          ctx.filter = filterStr;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (typeof sourceUrlOrBlob !== "string") {
              URL.revokeObjectURL(objectUrl);
            }
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to export canvas blob"));
            }
          },
          mimeType,
          quality
        );
      } catch (err) {
        if (typeof sourceUrlOrBlob !== "string") {
          URL.revokeObjectURL(objectUrl);
        }
        reject(err);
      }
    };

    img.onerror = (err) => {
      if (typeof sourceUrlOrBlob !== "string") {
        URL.revokeObjectURL(objectUrl);
      }
      reject(new Error("Failed to load source image for filter rendering"));
    };

    img.src = objectUrl;
  });
}
