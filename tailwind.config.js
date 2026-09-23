/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a1412",
          light: "#0f1c19",
          soft: "#132521",
        },
        cream: "#f3f1e7",
        gold: {
          DEFAULT: "#e7b24c",
          light: "#f2c669",
          dark: "#c8952f",
        },
        mist: "#9fb0ab",
        grid: "#2fe6b0",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(circle at 30% 35%, rgba(231,178,76,0.35), rgba(231,178,76,0) 60%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(6px,-10px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        drift: "drift 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
