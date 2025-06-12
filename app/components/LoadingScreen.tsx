// app/components/LoadingScreen.tsx
"use client";

import { motion } from 'framer-motion';
import { Cat } from 'lucide-react';
import React, { useMemo } from 'react';

// --- Тематические SVG-иконки ---

const PawIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M63.5,55.4c-5.4-3.3-9-8.9-9-15.3c0-10.1,8.2-18.3,18.3-18.3s18.3,8.2,18.3,18.3c0,6.4-3.6,12-9,15.3c-0.2,0.1-0.3,0.2-0.5,0.3 c-2.9,1.8-6.2,2.7-9.8,2.7S66.4,57.2,63.5,55.4z M49.5,41.4c0-7.1,5.8-12.9,12.9-12.9s12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9 S49.5,48.5,49.5,41.4z" />
    <path d="M84.5,67.7c-3.8-2.3-6.4-6.3-6.4-10.8c0-7.1,5.8-12.9,12.9-12.9s12.9,5.8,12.9,12.9c0,4.5-2.5,8.5-6.4,10.8c-0.1,0.1-0.3,0.2-0.4,0.2c-2.1,1.2-4.4,1.9-6.9,1.9S86.6,68.9,84.5,67.7z" />
    <path d="M43.7,67.7c-3.8-2.3-6.4-6.3-6.4-10.8c0-7.1,5.8-12.9,12.9-12.9c7.1,0,12.9,5.8,12.9,12.9c0,4.5-2.5,8.5-6.4,10.8c-0.1,0.1-0.3,0.2-0.4,0.2c-2.1,1.2-4.4,1.9-6.9,1.9S45.8,68.9,43.7,67.7z" />
    <path d="M22.2,55.4c-5.4-3.3-9-8.9-9-15.3C13.2,29.9,21.4,21.7,31.5,21.7s18.3,8.2,18.3,18.3c0,6.4-3.6,12-9,15.3c-0.2,0.1-0.3,0.2-0.5,0.3c-2.9,1.8-6.2,2.7-9.8,2.7S25.1,57.2,22.2,55.4z" />
  </svg>
);

const SyringeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 2 4 4" />
        <path d="m17 7 3-3" />
        <path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0L2.7 16.7a2.4 2.4 0 0 1 0-3.4L13 3" />
        <path d="m18 12 1.4-1.4" />
        <path d="m12 18 1.4-1.4" />
        <path d="m6 12 1.4-1.4" />
    </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
);


// Функция для получения приветствия в зависимости от времени по МСК (UTC+3)
const getGreeting = () => {
  const now = new Date();
  // Сдвигаем время на +3 часа для МСК
  const moscowTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const hour = moscowTime.getUTCHours();

  if (hour >= 5 && hour < 12) return "Доброго утра";
  if (hour >= 12 && hour < 18) return "Доброго дня";
  if (hour >= 18 && hour < 24) return "Доброго вечера";
  return "Доброй ночи";
};

interface LoadingScreenProps {
  userName: string;
  duration: number; // Длительность анимации в миллисекундах
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ userName, duration }) => {
  const greeting = getGreeting();

  // Создаем массив с иконками для фона. useMemo предотвращает пересоздание на каждый рендер.
  const backgroundIcons = useMemo(() => {
    const icons = [
        { Icon: PawIcon, color: 'text-indigo-200' },
        { Icon: SyringeIcon, color: 'text-blue-200' },
        { Icon: PlusIcon, color: 'text-rose-200' }
    ];
    return Array.from({ length: 20 }).map((_, i) => {
        const IconData = icons[i % icons.length];
        return {
            id: i,
            Icon: IconData.Icon,
            color: IconData.color,
            style: {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
            },
        };
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-background overflow-hidden"
    >
        {/* Анимированный фон */}
        <div className="absolute inset-0 w-full h-full">
            {backgroundIcons.map(({ id, Icon, style, color }) => (
                <motion.div
                    key={id}
                    className={`absolute ${color} opacity-30`}
                    style={style}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: -100, opacity: [0, 0.5, 0] }}
                    transition={{
                        duration: Math.random() * 15 + 10,
                        delay: Math.random() * 2,
                        repeat: Infinity,
                        repeatType: 'loop',
                    }}
                >
                    <Icon className="w-16 h-16" />
                </motion.div>
            ))}
        </div>

        {/* Основной контент */}
        <div className="text-center relative z-10">
            <Cat className="mx-auto h-16 w-16 text-brand-primary animate-pulse" />
            <h1 className="mt-8 text-3xl font-bold text-brand-text-primary">
            {greeting}, {userName}!
            </h1>
            <p className="mt-2 text-brand-text-secondary">Подготавливаем ваш архив...</p>
        </div>

        <div className="w-1/3 max-w-sm mt-8 overflow-hidden rounded-full bg-brand-border relative z-10">
            <motion.div
            className="h-2 bg-brand-primary"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            />
        </div>
    </motion.div>
  );
};

export default LoadingScreen;
