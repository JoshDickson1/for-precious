import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#050306",
        surface: "#0F080D",
        blush: "#2A071A",
        "blush-strong": "#45082A",
        rose: "#FF2E9A",
        "rose-deep": "#FF2E9A",
        "rose-soft": "#FF8AD2",
        "on-accent": "#FFF7FB",
        ink: "#FFF6FB",
        "ink-muted": "#C6A3B6",
        line: "#351526",
        gold: "#FFC857",
        success: "#6EE7B7",
        error: "#FF5C7A",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        script: ['"Parisienne"', "cursive"],
        sans: ['"DM Sans"', "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 10vw, 7rem)", { lineHeight: "0.92", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.25rem, 6vw, 3.75rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.75rem, 4vw, 2.5rem)", { lineHeight: "1.08", letterSpacing: "-0.015em" }],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.55), 0 14px 40px -18px rgba(255,46,154,0.22)",
        lift: "0 2px 6px rgba(0,0,0,0.60), 0 30px 80px -24px rgba(255,46,154,0.34)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.22,1,0.36,1) both",
        breathe: "breathe 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
