/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#128C7E",
          teal: "#075E54",
          panel: "#f0f2f5",
          bubbleOut: "#d9fdd3",
          bubbleIn: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};
