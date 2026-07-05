/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        papan: {
          DEFAULT: "#1F3D2B", // ink green, chalkboard
          light: "#2C4F3A",
          dark: "#152B1E",
        },
        kapur: {
          DEFAULT: "#FAF9F4", // chalk paper
          card: "#FFFFFF",
        },
        kapurkuning: {
          DEFAULT: "#D9A441", // chalk-marker amber
          dark: "#B8842F",
        },
        tinta: {
          DEFAULT: "#1C2620", // near-black text
          soft: "#4B5B50",
        },
        teal: {
          line: "#3B6E71",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        chalkline:
          "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.06) 28px)",
      },
    },
  },
  plugins: [],
}
