// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google'; // Используем Nunito вместо Inter
import './globals.css';
import NextAuthProvider from './components/NextAuthProvider';
import PWAInstaller from './components/PWAInstaller';
import ConnectionStatusBanner from './components/ConnectionStatusBanner';
import AppShell from './components/AppShell';

// Настраиваем шрифт
const nunito = Nunito({ 
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito', // Создаем переменную CSS
});

const appVersion = "2.3.0";

export const metadata: Metadata = {
  title: 'Архив Кошек',
  description: 'Веб-приложение для управления записями о кошках в приюте.',
  manifest: `/manifest.json?v=${appVersion}`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent', // ИСПРАВЛЕНО: делает статус бар прозрачным поверх контента
    title: 'Архив Кошек',
  },
  other: {
    "mobile-web-app-capable": "yes", 
  },
  icons: {
    icon: `/icons/favicon.ico?v=${appVersion}`,
    shortcut: `/icons/favicon-16x16.png?v=${appVersion}`,
    apple: `/icons/apple-touch-icon.png?v=${appVersion}`,
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: `/icons/apple-touch-icon.png?v=${appVersion}`,
      },
      {
        rel: 'icon',
        url: `/icons/favicon-16x16.png?v=${appVersion}`,
        sizes: '16x16',
      },
      {
        rel: 'icon',
        url: `/icons/favicon-32x32.png?v=${appVersion}`,
        sizes: '32x32',
      },
    ],
  },
};

// ИСПРАВЛЕНО: Добавлен viewportFit: 'cover' и userScalable: false
export const viewport: Viewport = {
  themeColor: '#FFFBF7', 
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Запрещаем зум щипком (приложение должно ощущаться как нативное)
  viewportFit: 'cover', // <--- ГЛАВНОЕ ИСПРАВЛЕНИЕ: Растягивает на весь экран, убирая белые полосы
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      {/* Применяем класс шрифта к body */}
      <body className={nunito.className}>
        <div className="bg-noise" />
        <div className="content-wrapper">
            <ConnectionStatusBanner />
            <NextAuthProvider>
              <AppShell>{children}</AppShell>
            </NextAuthProvider>
            <PWAInstaller />
        </div>
      </body>
    </html>
  );
}