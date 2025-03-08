import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        contrast: "var(--foreground)",
        drlight: "#E4E3FF",
        drgray: "#737383",
        drerror: "#B21D20",
        drgreen: "#22981D",
        drPurple: "#6E78C7",
      },
      fontFamily: {
        drserif: ["var(--font-roboto-serif)", "serif"],
        drnote: ["var(--font-roboto)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
