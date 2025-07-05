// tailwind.config.ts
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
        // ИЗМЕНЕНИЕ: Заменяем светло-серый фон на приятный желтоватый
        'brand-background': '#ffffff', // Очень светлый янтарный (Amber 50)
        
        'brand-surface': '#ffffff',    // Белый для карточек и модальных окон
        'brand-border': '#e5e7eb',   // Нейтральная граница (Gray 200)

        'brand-primary': '#38bdf8',       // Sky 400 - яркий, но не резкий голубой
        'brand-primary-hover': '#0ea5e9', // Sky 500 для наведения
        'brand-primary-light': '#f0f9ff', // Очень светлый Sky 50 для подложек
        
        'brand-secondary': '#e5e7eb',        // Gray 200
        'brand-secondary-hover': '#d1d5db', // Gray 300 для наведения

        'brand-accent': '#f87171',    // Мягкий красный (Red 400)
        
        'brand-text-primary': '#1f2937', // Почти черный, но мягче (Gray 800)
        'brand-text-secondary': '#6b7280', // Серый для второстепенного текста (Gray 500)
        'brand-text-on-primary': '#ffffff', // Белый текст на основной кнопке
      },
    },
  },
  plugins: [],
}
export default config