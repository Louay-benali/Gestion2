// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Make sure Tailwind scans all relevant files
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#465fff",
        },
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
