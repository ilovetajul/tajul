import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        secondary: "#4CAF50",
        dark: "#0f0e17",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #6C63FF 0%, #4CAF50 50%, #FF6584 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
