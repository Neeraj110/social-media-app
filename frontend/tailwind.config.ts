import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#09090b",
        panel: "#121214",
        raised: "#18181b",
        surface: "#27272a",
        "surface-high": "#3f3f46",
        "surface-highest": "#52525b",
        line: "rgba(255, 255, 255, 0.06)",
        "line-strong": "rgba(255, 255, 255, 0.12)",
        primary: "#3B82F6",
        "primary-hover": "#2563EB",
        "primary-light": "#60A5FA",
        secondary: "#8B5CF6",
        "secondary-hover": "#7C3AED",
        cyan: "#06B6D4",
        "cyan-glow": "#22D3EE",
        presence: "#10B981",
        amber: "#F59E0B",
        rose: "#F43F5E",
        pink: "#EC4899",
      },
      fontFamily: {
        sans: ["Google Sans", "Outfit", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "var(--font-geist-sans)", "sans-serif"],
        display: ["Elms Sans", "Cabinet Grotesk", "Geist", "sans-serif"],
        mono: ["Google Sans Code", "JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
        "google-sans": ["Google Sans", "sans-serif"],
        "elms-sans": ["Elms Sans", "sans-serif"],
        "google-sans-code": ["Google Sans Code", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px -4px rgba(99, 102, 241, 0.35)",
        "glow-lg": "0 0 36px -4px rgba(139, 92, 246, 0.4)",
        "glow-cyan": "0 0 24px -4px rgba(6, 182, 212, 0.35)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "card-hover": "0 14px 34px -4px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(99, 102, 241, 0.15)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 4s ease-in-out infinite",
        "shimmer-slide": "shimmer 2s infinite linear",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
