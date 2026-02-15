const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    "./src/**/*.{astro,js,jsx,ts,tsx}",
    "./node_modules/@heroui/react/dist/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};
