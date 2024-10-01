/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadein: {
          '0%': { opacity: '0%' },
          '100%': { opacity: '100%' }
        },
        fadeout: {
          '100%': { opacity: '0%' },
        },
        fadeup: {
          '0%': { opacity: 1, transform: 'translateY(0)' },
          '100%': { opacity: 0, transform: 'translateY(-30px)' },
        }
      },
      animation: {
        fadein: 'fadein 5s ease forwards',
        fadeout: 'fadeout 5s ease forwards',
        fadeup: 'fadeup 1s ease forwards'
      }
    },
  },
  plugins: [],
}

