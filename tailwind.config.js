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
        },
        zoom: {
          '0%': { transform: 'scale(1.0) translateX(-50%) translateY(-50%)' },
          '50%': { transform: 'scale(1.2) translateX(-50%) translateY(-50%)' },
          '100%': { transform: 'scale(1.0) translateX(-50%) translateY(-50%)' },
        }
      },
      animation: {
        fadein: 'fadein 5s ease forwards',
        fadeout: 'fadeout 5s ease forwards',
        fadeup: 'fadeup 1s ease forwards',
        zoom: 'zoom 2s ease infinite',
      }
    },
  },
  plugins: [],
}

