// app/components/BottomNavBar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ИЗМЕНЕНИЕ: Заменяем иконки на пути к вашим файлам
const navLinks = [
  { href: '/dashboard', label: 'Архив', icon: '/assets/icons/footer/archive.png' },
  { href: '/dashboard/calendar', label: 'Календарь', icon: '/assets/icons/footer/calendar.png' },
  { href: '/staff', label: 'Персонал', icon: '/assets/icons/footer/staff.png' },
  { href: '/profile', label: 'Профиль', icon: '/assets/icons/footer/profile.png' },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full h-16 bg-brand-surface/80 backdrop-blur-lg border-t border-brand-border/50">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navLinks.map(({ href, label, icon }) => {
          const isActive = (href === '/dashboard') 
            ? pathname === href 
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`inline-flex flex-col items-center justify-center px-1 group transition-all duration-200 m-1 rounded-lg ${
                isActive 
                  ? 'text-brand-primary bg-brand-primary-light' 
                  : 'text-brand-text-secondary hover:bg-brand-primary-light/50'
              }`}
            >
              {/* ИЗМЕНЕНИЕ: Используем тег <img> вместо компонента иконки */}
              <img 
                src={icon} 
                alt={label} 
                className={`w-6 h-6 mb-1 transition-all duration-300 ${isActive ? '' : 'grayscale opacity-70'}`}
              />
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