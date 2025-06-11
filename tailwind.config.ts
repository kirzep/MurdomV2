import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-background': '#f8fafc', // Slate 50
        'brand-surface': '#ffffff',    // White
        'brand-primary': '#818cf8',    // Indigo 400
        'brand-primary-light': '#c7d2fe', // Indigo 200
        'brand-secondary': '#a7f3d0', // Emerald 200
        'brand-accent': '#fca5a5',    // Red 400
        'brand-text-primary': '#1e293b', // Slate 800
        'brand-text-secondary': '#64748b', // Slate 500
        'brand-border': '#e2e8f0',   // Slate 200
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(to top right, var(--tw-gradient-stops))',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
export default config
