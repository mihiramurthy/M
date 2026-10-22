import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070B0A",
          900: "#0C1412",
          800: "#14201C",
          700: "#1E2E28",
        },
        mist: {
          50: "#F3F7F4",
          100: "#E4EDE6",
          300: "#A8BDB0",
          400: "#7A9586",
        },
        signal: {
          DEFAULT: "#3FAF7F",
          bright: "#5FD49A",
          dim: "#2A7A58",
        },
        ember: {
          DEFAULT: "#E08A4F",
          soft: "#F0B888",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "atlas-mesh":
          "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(63,175,127,0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 10%, rgba(224,138,79,0.12), transparent 50%), radial-gradient(ellipse 60% 40% at 60% 80%, rgba(63,175,127,0.08), transparent 45%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "draw-line": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s ease-out both",
        "fade-up-delay": "fade-up 0.8s ease-out 0.15s both",
        "fade-up-late": "fade-up 0.8s ease-out 0.3s both",
        shimmer: "shimmer 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
