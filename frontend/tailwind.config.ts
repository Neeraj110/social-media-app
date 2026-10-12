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
        primary: {
          DEFAULT: "#0095F6",
          hover: "#1877F2",
          soft: "#E0F1FF",
        },
        ink: "#000000",
        panel: "#FFFFFF",
        raised: "#FAFAFA",
        surface: "#FAFAFA",
        "surface-high": "#EFF3F4",
        "surface-highest": "#DBDBDB",
        line: "#EFF3F4",
        "line-strong": "rgba(0, 0, 0, 0.12)",
        secondary: "#737373",
        success: "#23845B",
        error: "#ED4956",
        insta: {
          yellow: "#FEDA77",
          orange: "#F58529",
          magenta: "#DD2A7B",
          purple: "#8134AF",
          blue: "#515BD4",
        }
      },
      fontFamily: {
        sans: ["Inter", "Geist", "Google Sans", "-apple-system", "sans-serif"],
        display: ["Inter", "Geist", "Google Sans", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "monospace"],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
        none: "none",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
