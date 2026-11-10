import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#080808",
          secondary: "#141414",
          card: "rgba(20, 20, 20, 0.75)",
          elevated: "#1c1c1c",
        },
        gold: {
          50: "#fdfbf2",
          100: "#f9f4de",
          200: "#f2e7bc",
          300: "#e8d591",
          400: "#dec067",
          500: "#D4AF37", // champagne gold
          600: "#ba932b",
          700: "#947124",
          800: "#795a24",
          900: "#674b23",
        },
        cinemaRed: {
          DEFAULT: "#B91C1C",
          hover: "#991B1B",
          glow: "rgba(185, 28, 28, 0.4)",
        },
        lumiere: {
          text: "#F5F5F5",
          muted: "#9CA3AF",
          border: "rgba(212, 175, 55, 0.2)",
          glass: "rgba(20, 20, 20, 0.65)",
        },
      },
      fontFamily: {
        serif: ["Cinzel", "Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
        button: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        "gold-glow": "0 0 25px rgba(212, 175, 55, 0.25)",
        "gold-glow-lg": "0 0 45px rgba(212, 175, 55, 0.4)",
        "red-glow": "0 0 25px rgba(185, 28, 28, 0.35)",
        "screen-glow": "0 20px 60px -10px rgba(255, 255, 255, 0.15)",
        "cinema-elevated": "0 10px 30px -5px rgba(0, 0, 0, 0.8)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #AA771C 100%)",
        "cinema-dark": "radial-gradient(circle at 50% 0%, #1a160d 0%, #080808 70%)",
        "screen-beam": "linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, rgba(8, 8, 8, 0) 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
