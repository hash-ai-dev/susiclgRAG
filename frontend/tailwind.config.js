/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1", // Indigo 500
        secondary: "#a855f7", // Purple 500
        dark: "#0f172a", // Slate 900
        "neon-blue": "#00f3ff",
        "deep-space": "#050b14",
        "hologram-cyan": "rgba(0, 243, 255, 0.1)",
        // Harry Potter Theme Colors
        "magic-purple": "#2d1b4e",
        "magic-gold": "#d4af37",
        "magic-burgundy": "#6b1c23",
        "magic-emerald": "#1a472a",
        "magic-bronze": "#cd7f32",
        "magic-silver": "#c0c0c0",
        "parchment": "#f4e4c1",
        "ink-black": "#1a1a1a",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 8s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: 1, boxShadow: "0 0 10px #00f3ff" },
          "50%": { opacity: 0.5, boxShadow: "0 0 20px #00f3ff" },
        },
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      }
    },
  },
  plugins: [],
}
