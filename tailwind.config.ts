import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#0B1F3A', 900: '#06122A' },
        crimson:{ DEFAULT: '#A6192E', 700: '#7E1222' },
        cream:  { DEFAULT: '#F5EFE0', 200: '#FAF5E8' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
