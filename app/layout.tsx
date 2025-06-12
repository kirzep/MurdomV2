// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NextAuthProvider from './components/NextAuthProvider'
import PWAInstaller from './components/PWAInstaller'
import ConnectionStatusBanner from './components/ConnectionStatusBanner' // Импортируем баннер

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
        <ConnectionStatusBanner /> {/* Добавляем баннер сюда */}
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
        <PWAInstaller />
      </body>
    </html>
  )
}
