/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'outlook-blue': '#0078d4',
        'outlook-bg': '#f3f2f1',
        'outlook-sidebar': '#faf9f8',
        'outlook-border': '#edebe9',
        'outlook-text': '#323130',
        'outlook-text-secondary': '#605e5c',
      },
    },
  },
  plugins: [],
}

