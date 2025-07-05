// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NextAuthProvider from './components/NextAuthProvider'
import PWAInstaller from './components/PWAInstaller'
import ConnectionStatusBanner from './components/ConnectionStatusBanner'
// --- ИЗМЕНЕНИЕ: Убираем BottomNavBar, импортируем AppShell ---
import AppShell from './components/AppShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Архив Кошек',
  description: 'Веб-приложение для управления записями о кошках в приюте.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Архив Кошек',
  },
  icons: {
    icon: '/icons/favicon.ico',
    shortcut: '/icons/favicon-16x16.png',
    apple: '/icons/apple-touch-icon.png',
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/icons/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        url: '/icons/favicon-16x16.png',
        sizes: '16x16',
      },
      {
        rel: 'icon',
        url: '/icons/favicon-32x32.png',
        sizes: '32x32',
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#818cf8',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <ConnectionStatusBanner />
        <NextAuthProvider>
          {/* --- ИЗМЕНЕНИЕ: Оборачиваем всё в AppShell --- */}
          <AppShell>{children}</AppShell>
        </NextAuthProvider>
        <PWAInstaller />
      </body>
    </html>
  )
}
