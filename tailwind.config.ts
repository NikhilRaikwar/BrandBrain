import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        card: "var(--card)",
        border: "var(--border)",
        accent: "var(--accent)",
        accent2: "var(--accent2)",
        accent3: "var(--accent3)",
        text: "var(--text)",
        muted: "var(--muted)",
        white: "var(--white)",
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-dm-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,229,160,0.2), 0 10px 30px rgba(0,229,160,0.08)",
      },
      screens: {
        md: "768px",
        lg: "1024px",
      },
    },
  },
  plugins: [],
};

export default config;
