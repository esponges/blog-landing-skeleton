const colors = require('tailwindcss/colors');
module.exports = {
  content: [
    './src/**/*.{astro,js,jsx,ts,tsx}',
    './public/**/*.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue[600],
        secondary: colors.gray[700],
        accent: colors.pink[500],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
