
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5",
          light: "#6366f1",
          dark: "#4338ca",
        },
        accent: {
          DEFAULT: "#0ea5e9",
          light: "#38bdf8",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        muted: "#6b7280",
        background: "#f8fafc",
        card: "#ffffff",
        border: "#e2e8f0",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "scan-line": "scanLine 1.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "check-pop": "checkPop 0.4s ease-out",
      },
      keyframes: {
        scanLine: {
          "0%": { top: "0%" },
          "50%": { top: "100%" },
          "100%": { top: "0%" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        checkPop: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "70%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
