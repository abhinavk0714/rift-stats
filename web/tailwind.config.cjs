/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0f172a', bg: '#0f172a' },
        secondary: { DEFAULT: '#1e293b', bg: '#1e293b' },
        accent: { DEFAULT: '#22c55e', hover: '#16a34a' },
        'text-primary': '#f1f5f9',
        'text-muted': '#94a3b8',
      },
      backgroundColor: {
        primary: '#0f172a',
        secondary: '#1e293b',
      },
      textColor: {
        primary: '#f1f5f9',
        muted: '#94a3b8',
      },
    },
  },
  plugins: [],
}
