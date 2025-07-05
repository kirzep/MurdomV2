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
        // --- НОВАЯ БОРДОВО-БЕЖЕВАЯ ПАЛИТРА ---
        'brand-background': '#FFFBF7',    // Теплый, почти белый фон
        'brand-surface': '#FFFFFF',       // Чистый белый для карточек
        'brand-border': '#F2E8E4',      // Мягкий бежевый для границ

        // Основной цвет: глубокий бордовый
        'brand-primary': '#5D001E',
        'brand-primary-hover': '#82002B', // Немного светлее для наведения
        'brand-primary-light': '#FBE9EE', // Очень светлый, нежно-розовый

        // Второстепенный цвет: нейтральный серый
        'brand-secondary': '#F1F5F9',      // Светло-серый (Slate 100)
        'brand-secondary-hover': '#E2E8F0', // Немного темнее (Slate 200)

        // Акцентный (ошибки, удаление): насыщенный розовый
        'brand-accent': '#E11D48',        // Rose 600
        'brand-accent-hover': '#BE123C',  // Rose 700 для наведения
        'brand-accent-text': '#881337',   // Темно-розовый текст (Rose 900)
        'brand-accent-bg': '#FFE4E6',     // Светло-розовая подложка (Rose 50)

        // Предупреждение: насыщенный янтарный
        'brand-warning': '#F59E0B',       // Amber 500
        'brand-warning-text': '#92400E',  // Темно-янтарный текст (Amber 800)
        'brand-warning-bg': '#FFFBEB',    // Светло-янтарная подложка (Amber 50)
        
        // Успех (для галочек): приглушенный зеленый
        'brand-success': '#16A34A',      // Green 600
        'brand-success-text': '#14532D', // Green 900

        // Текст
        'brand-text-primary': '#33181F', // Очень темный, почти черный с теплым оттенком
        'brand-text-secondary': '#85686F',// Теплый серый для второстепенного текста
        'brand-text-on-primary': '#FFFFFF',// Белый текст на основной кнопке
      },
    },
  },
  plugins: [],
}
export default config