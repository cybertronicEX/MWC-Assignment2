/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7da2a9',
          light: '#9bbbc1',
          dark: '#5f8890',
          foreground: '#ffffff'
        },
        background: '#f7f7f7',
        surface: '#ffffff',
        secondary: '#475569',
        accent: '#f7f7f7', // Using bg color as accent base or maybe a darker grey for text
        text: {
          main: '#1a1a1a',
          muted: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}
