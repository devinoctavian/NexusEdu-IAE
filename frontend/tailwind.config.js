/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2A2420",
        secondary: "#6B6258",
        tertiary: "#B5651D",
        neutral: "#F7F3EC",
        surface: "#FDFBF7",
        border: "#E8E1D4",
        success: "#4D7C5F",
        error: "#A33B2E",
        warning: "#C2941A",
        info: "#4C6B8A",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        pill: '999px',
      }
    },
  },
  plugins: [],
}
