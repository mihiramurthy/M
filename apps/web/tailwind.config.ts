import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F5F4F1",
          pure: "#FFFFFF",
          soft: "#EEEEEA",
        },
        ink: {
          DEFAULT: "#141414",
          soft: "#2A2A2A",
          muted: "#8B8B8B",
          faint: "#B5B5B5",
        },
        accent: {
          DEFAULT: "#E87A3A",
          soft: "#F3B48A",
          blush: "#F0C9C2",
        },
        stage: {
          cocoa: "#3A2A22",
          olive: "#2E3426",
          slate: "#1F2A33",
          pine: "#1C3330",
          inkblue: "#1A2030",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        float: "0 10px 40px rgba(20,20,20,0.08)",
        pill: "0 8px 30px rgba(20,20,20,0.12)",
        card: "0 18px 50px rgba(20,20,20,0.1)",
      },
      borderRadius: {
        showcase: "1.75rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "fade-up-delay": "fade-up 0.7s ease-out 0.12s both",
        "fade-up-late": "fade-up 0.7s ease-out 0.24s both",
        floaty: "floaty 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
