// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NextAuthProvider from './components/NextAuthProvider'
import PWAInstaller from './components/PWAInstaller'
import ConnectionStatusBanner from './components/ConnectionStatusBanner'
import AppShell from './components/AppShell'
import PawsBackground from './components/PawsBackground'

const inter = Inter({ subsets: ['latin'] })

// --- ИЗМЕНЕНИЕ: Увеличиваем версию, чтобы обновить кеш на устройствах ---
const appVersion = "2.2.0";

export const metadata: Metadata = {
  title: 'Архив Кошек',
  description: 'Веб-приложение для управления записями о кошках в приюте.',
  manifest: `/manifest.json?v=${appVersion}`, // Добавляем версию
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Архив Кошек',
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
}

// --- ИЗМЕНЕНИЕ: Обновляем основной цвет для UI браузера ---
export const viewport: Viewport = {
  themeColor: '#5D001E',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <PawsBackground />
        <div className="relative z-10 content-wrapper">
            <ConnectionStatusBanner />
            <NextAuthProvider>
              <AppShell>{children}</AppShell>
            </NextAuthProvider>
            <PWAInstaller />
        </div>
      </body>
    </html>
  )
}