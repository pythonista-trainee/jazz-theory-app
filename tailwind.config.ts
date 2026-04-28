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
        jazz: {
          bg: "#0f0f1a",
          surface: "#1a1a2e",
          card: "#16213e",
          accent: "#e94560",
          gold: "#f5a623",
          teal: "#0f3460",
          text: "#e0e0e0",
          muted: "#6b7280",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
