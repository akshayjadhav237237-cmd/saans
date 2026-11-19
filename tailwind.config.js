/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--color-bg-base)',
          surface: 'var(--color-bg-surface)',
          elevated: 'var(--color-bg-elevated)',
        },
        text: {
          main: 'var(--color-text-main)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        teal: {
          DEFAULT: 'var(--color-teal)',
          dark: 'var(--color-teal-dark)',
          light: 'var(--color-teal-light)',
        },
        amber: {
          DEFAULT: 'var(--color-amber)',
          dark: 'var(--color-amber-dark)',
          light: 'var(--color-amber-light)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          focus: 'var(--color-border-focus)',
        },
      },
    },
  },
  plugins: [],
};
