/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF6EF",
        surface: "#FFFFFF",
        ink: { DEFAULT: "#221D1B", muted: "#6B6058" },
        border: "#ECE3D6",
        accent: { DEFAULT: "#E8871E", dark: "#C36A0C", light: "#FDECD3" },
        secondary: { DEFAULT: "#2C6E68", light: "#E1F0EE" },
        danger: { DEFAULT: "#B34738", light: "#F7E4E0" },
        whatsapp: "#25D366",
      },
    },
  },
  plugins: [],
};
