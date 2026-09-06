import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Skala dibalik dari tema gelap sebelumnya: 950/900 sekarang jadi
        // permukaan paling terang (putih), 100 jadi teks paling gelap.
        // Nama token TIDAK diubah supaya semua className lama tetap valid,
        // cuma nilai warnanya yang diganti jadi tema terang.
        base: {
          950: "#ffffff",
          900: "#f7f8f9",
          800: "#eef1f3",
          700: "#dde2e7",
          600: "#c3cad2",
          500: "#8a95a1",
          400: "#5f6b78",
          300: "#33404c",
          100: "#10161d",
        },
        signal: {
          amber: "#eab308",
          red: "#dc2626",
          green: "#16a34a",
          blue: "#2563eb",
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
