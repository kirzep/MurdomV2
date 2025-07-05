// app/components/BottomNavBar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Archive, CalendarDays, Users, User } from 'lucide-react';

// Список навигационных ссылок
const navLinks = [
  { href: '/dashboard', label: 'Архив', icon: Archive },
  { href: '/dashboard/calendar', label: 'Календарь', icon: CalendarDays },
  { href: '/staff', label: 'Персонал', icon: Users },
  { href: '/profile', label: 'Профиль', icon: User },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    // ИЗМЕНЕНИЕ: Уменьшил высоту с h-20 до h-16
    <footer className="fixed bottom-0 left-0 z-50 w-full h-16 bg-brand-surface/80 backdrop-blur-lg border-t border-brand-border/50">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = (href === '/dashboard') 
            ? pathname === href 
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 group transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-brand-text-secondary'}`}
            >
              <Icon size={22} className="mb-1" />
              <span className="text-xs font-semibold">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
