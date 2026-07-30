import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#0A0A0A",
          2: "#111111",
        },
        ink: {
          DEFAULT: "#FFFFFF",
          muted: "#999999",
          neutral: "#555555",
        },
        rule: "#1E1E1E",
        accent: {
          DEFAULT: "#D4AF37",
          light: "#E0C060",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "ui-serif", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      spacing: {
        "2xs": "0.25rem",
        xs: "0.5rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2.5rem",
        "2xl": "4rem",
        "3xl": "6rem",
        "4xl": "9rem",
      },
    },
  },
  plugins: [],
}

export default config
