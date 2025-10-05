/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#9cf542',
          600: '#88d93a',
        },
      },
    },
  },
  plugins: [],
}
