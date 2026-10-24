/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Onest", "system-ui", "sans-serif"], mono: ["JetBrains Mono", "ui-monospace", "monospace"] },
      colors: {
        ink: "#16213B",
        mist: "#F4F6FA",
        line: "#DCE1EC",
        gzhel: { DEFAULT: "#2B4DA6", soft: "#E6EBF7", dark: "#1F3A82" },
      },
    },
  },
  plugins: [],
};
