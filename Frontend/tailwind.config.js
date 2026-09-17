/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F6F2',
        ink: '#1C2321',
        forest: {
          DEFAULT: '#2F5D50',
          dark: '#22463C',
          light: '#E7EEEB',
        },
        ochre: {
          DEFAULT: '#C17F2E',
          light: '#F5E9D8',
        },
        brick: {
          DEFAULT: '#A8432E',
          light: '#F3E1DC',
        },
        line: '#DEDBD1',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
    },
  },
  plugins: [],
};
