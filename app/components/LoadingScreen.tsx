// app/components/LoadingScreen.tsx
"use client";

import { motion } from 'framer-motion';
import React, { useMemo, useState, useEffect } from 'react';

const getGreeting = () => {
  const now = new Date();
  const moscowTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const hour = moscowTime.getUTCHours();

  if (hour >= 5 && hour < 12) return "Доброго утра";
  if (hour >= 12 && hour < 18) return "Доброго дня";
  if (hour >= 18 && hour < 24) return "Доброго вечера";
  return "Доброй ночи";
};

interface LoadingScreenProps {
  userName: string;
  iconPaths: string[];
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ userName, iconPaths }) => {
  const greeting = getGreeting();
  const [isMounted, setIsMounted] = useState(false);

  // Откладываем рендеринг до момента, когда компонент будет смонтирован на клиенте
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const backgroundIcons = useMemo(() => {
    // Не генерируем иконки, пока компонент не смонтирован
    if (!isMounted || !iconPaths || iconPaths.length === 0) return [];

    return Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        src: iconPaths[i % iconPaths.length],
        style: {
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `scale(${Math.random() * 0.4 + 0.6})`,
            animation: `fly ${Math.random() * 15 + 10}s linear ${Math.random() * 10}s infinite`,
        },
    }));
  }, [iconPaths, isMounted]); // Добавляем isMounted в зависимости

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-background overflow-hidden"
    >
        <div className="absolute inset-0 w-full h-full">
            {backgroundIcons.map(({ id, src, style }) => (
                <div
                    key={id}
                    className="absolute text-brand-primary opacity-20"
                    style={style}
                >
                    <img src={src} alt="" className="w-16 h-16" />
                </div>
            ))}
        </div>

        <div className="text-center relative z-10">
            <img 
                src="/icons/android-chrome-512x512.png" 
                alt="Логотип" 
                className="mx-auto h-24 w-24 animate-pulse"
            />
            <h1 className="mt-8 text-3xl font-bold text-brand-text-primary">
                {greeting}, {userName}!
            </h1>
            <p className="mt-2 text-brand-text-secondary">Подготавливаем ваш архив...</p>
        </div>
    </motion.div>
  );
};

export default LoadingScreen;