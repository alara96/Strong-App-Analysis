import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        sidebar: {
          DEFAULT: "#1a1d24",
          hover: "#252a33",
        },
        accent: {
          DEFAULT: "#e67e22",
          soft: "rgba(230, 126, 34, 0.12)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
