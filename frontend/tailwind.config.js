/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F97316', // Warm orange
          light: '#fb923c',
          dark: '#ea580c',
        },
        secondary: {
          DEFAULT: '#22C55E', // Green for adoption/success
          light: '#4ade80',
          dark: '#16a34a',
        },
        accent: {
          DEFAULT: '#3B82F6', // Blue
          light: '#60a5fa',
          dark: '#2563eb',
        },
        background: '#F9FAFB', // Clean white/light gray
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'float': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
