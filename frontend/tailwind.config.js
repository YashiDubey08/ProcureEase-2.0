/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        status: {
          met: {
            bg: '#ecfdf5',
            text: '#065f46',
            border: '#a7f3d0',
            dot: '#10b981',
          },
          partial: {
            bg: '#fffbeb',
            text: '#92400e',
            border: '#fde68a',
            dot: '#f59e0b',
          },
          missing: {
            bg: '#fef2f2',
            text: '#991b1b',
            border: '#fecaca',
            dot: '#ef4444',
          },
          action: {
            bg: '#eff6ff',
            text: '#1e40af',
            border: '#bfdbfe',
            dot: '#3b82f6',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
