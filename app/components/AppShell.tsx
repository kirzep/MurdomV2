// app/components/AppShell.tsx
"use client";

import { usePathname } from 'next/navigation';
import BottomNavBar from './BottomNavBar';
import { ReactNode } from 'react';

// Список страниц, на которых не нужно показывать нижнюю панель
const noNavPaths = ['/login', '/setup-profile'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Проверяем, нужно ли скрывать панель.
  // Для страницы регистрации используем startsWith, так как у нее динамический адрес.
  const hideNav = noNavPaths.includes(pathname) || pathname.startsWith('/register');

  return (
    <>
      {/* Оборачиваем основной контент в тег <main>.
        Отступ снизу (pb-20) добавляется только тогда, когда панель навигации видна.
      */}
      <main className={hideNav ? '' : 'pb-20'}>
        {children}
      </main>
      
      {/* Показываем панель только если hideNav равно false */}
      {!hideNav && <BottomNavBar />}
    </>
  );
}
