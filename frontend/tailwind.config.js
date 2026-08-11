/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        flame: { 50: "#FFF5EB", 100: "#FFE5CC", 200: "#FFCB99", 300: "#FFB166", 400: "#F5791E", 500: "#E05D10", 600: "#C24711", 700: "#9B3415", 800: "#7B2B15", 900: "#622612", 950: "#3A110A" },
        char: { 50: "#FBF8F3", 100: "#F3EEE4", 200: "#E5D9C8", 300: "#D4BFA4", 400: "#BF9F7E", 500: "#A88564", 600: "#8E6B50", 700: "#70513D", 800: "#5B3E31", 900: "#48302A", 950: "#161514" },
        sesame: { 50: "#FBF8F3", 100: "#F3EEE4", 200: "#E5D9C8", 300: "#D4BFA4", 400: "#BF9F7E", 500: "#A88564", 600: "#8E6B50", 700: "#70513D", 800: "#5B3E31", 900: "#48302A", 950: "#161514" },
        ember: { 50: "#FFF8EB", 100: "#FFEFC7", 200: "#FFDB8B", 300: "#FFC456", 400: "#FFA82A", 500: "#F08C10", 600: "#D66A0A", 700: "#AE4B0C", 800: "#8C3912", 900: "#722E13", 950: "#3D1707" },
        chili: { 50: "#FEF2F2", 100: "#FEE2E2", 200: "#FECACA", 300: "#FCA5A5", 400: "#F87171", 500: "#EF3B3B", 600: "#DC1E1E", 700: "#B91414", 800: "#991414", 900: "#7F1414", 950: "#450707" },
      },
      fontFamily: { sans: ["Tajawal", "system-ui", "sans-serif"], display: ["Tajawal", "system-ui"], body: ["Tajawal", "system-ui"] },
      borderRadius: { card: "1rem" },
      boxShadow: { flame: "0 4px 14px rgba(245, 121, 30, 0.25)" },
    },
  },
  plugins: [],
}