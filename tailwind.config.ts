import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0d1117",
          900: "#141a21",
          800: "#1c242d",
          700: "#28323d",
          600: "#3a4753",
          500: "#5b6b78",
          400: "#8b98a3",
          300: "#b8c2ca",
          100: "#e9edf0",
        },
        signal: {
          amber: "#e8a13a",
          red: "#d0523f",
          green: "#4c9a6a",
          blue: "#3f7ab0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jbmono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
