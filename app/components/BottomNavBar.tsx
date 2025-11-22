// app/components/BottomNavBar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/dashboard', label: 'Архив', icon: '/assets/icons/footer/archive.png' },
  { href: '/dashboard/calendar', label: 'Календарь', icon: '/assets/icons/footer/calendar.png' },
  { href: '/staff', label: 'Персонал', icon: '/assets/icons/footer/staff.png' },
  { href: '/profile', label: 'Профиль', icon: '/assets/icons/footer/profile.png' },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <div className="
      fixed left-0 right-0 z-50 flex justify-center px-4 pointer-events-none
      /* --- ИЗМЕНЕНИЕ: Учитываем Safe Area снизу --- */
      /* Базовый отступ 1.5rem (bottom-6) + системный отступ */
      bottom-[calc(1.5rem+env(safe-area-inset-bottom))]
    ">
      <nav className="
        pointer-events-auto
        flex items-center justify-between 
        w-full max-w-md 
        /* --- ИЗМЕНЕНИЯ ЗДЕСЬ --- */
        /* Почти непрозрачный белый фон (было white/90) */
        bg-white/95 
        /* Блюр */
        backdrop-blur-md 
        /* Жирная белая граница внутри */
        border border-white
        /* КРУПНАЯ мягкая тень, создающая эффект парения */
        shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]
        
        rounded-2xl px-2 py-2
      ">
        {navLinks.map(({ href, label, icon }) => {
          const isActive = (href === '/dashboard') 
            ? pathname === href 
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`
                relative flex flex-col items-center justify-center 
                w-full h-14 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'text-brand-primary' 
                  : 'text-gray-400 hover:bg-gray-100/50'
                }
              `}
            >
              {isActive && (
                <span className="absolute inset-0 bg-brand-primary-light/30 rounded-xl -z-10 scale-90 transition-transform" />
              )}
              
              <img 
                src={icon} 
                alt={label}
                className={`
                    w-7 h-7 transition-all duration-300 drop-shadow-sm
                    ${isActive 
                        ? '-translate-y-0.5 scale-110' 
                        : 'grayscale opacity-50'
                    }
                `} 
              />
              
              <span className={`text-[10px] font-bold mt-0.5 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}