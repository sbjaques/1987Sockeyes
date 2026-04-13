import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red:   '#D8282B',
          black: '#231F20',
          white: '#FFFFFF',
          cream: '#F2EDDC',
        },
        // Legacy aliases to minimize component churn — map old names to new palette
        navy:    { DEFAULT: '#231F20', 900: '#000000' }, // near-black
        crimson: { DEFAULT: '#D8282B', 700: '#A81D20' },
        cream:   { DEFAULT: '#FFFFFF', 200: '#F2EDDC' }, // main bg white, secondary cream
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
