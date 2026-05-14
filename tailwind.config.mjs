/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#1a6b6b',
          dark: '#124d4d',
          pale: '#e6f4f4',
        },
        coral: {
          DEFAULT: '#e8562a',
          dark: '#c94420',
        },
        gold: {
          DEFAULT: '#c9983a',
          pale: '#fdf6e3',
        },
        ink: {
          DEFAULT: '#0d1117',
          muted: '#4b5563',
        },
        surface: {
          DEFAULT: '#fafaf8',
          alt: '#f0ede8',
        },
        sand: '#f5f0e8',
        border: '#e2ddd7',
      },
    },
  },
  plugins: [],
}