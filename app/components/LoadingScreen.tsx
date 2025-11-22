// app/components/LoadingScreen.tsx
"use client";

import { motion } from 'framer-motion';
import React, { useMemo, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const getGreeting = () => {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) return "Доброе утро";
  if (hour >= 12 && hour < 18) return "Добрый день";
  if (hour >= 18 && hour < 24) return "Добрый вечер";
  return "Доброй ночи";
};

interface LoadingScreenProps {
  userName: string;
  iconPaths: string[];
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ userName, iconPaths }) => {
  const greeting = getGreeting();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Генерируем "частицы" (иконки) только на клиенте
  const backgroundIcons = useMemo(() => {
    if (!isMounted || !iconPaths || iconPaths.length === 0) return [];

    return Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        src: iconPaths[i % iconPaths.length],
        style: {
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            scale: Math.random() * 0.4 + 0.6, // Чуть крупнее, чем в темной теме
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 15 + 15}s` // Медленнее и плавнее
        },
    }));
  }, [iconPaths, isMounted]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-brand-background overflow-hidden"
    >
        {/* Светлый фоновый градиент */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-brand-secondary/30 to-brand-primary/5 pointer-events-none" />
        
        {/* Слой с летающими иконками */}
        <div className="absolute inset-0 w-full h-full">
            {backgroundIcons.map(({ id, src, style }) => (
                <div
                    key={id}
                    // Убрали invert, добавили mix-blend-multiply для красивого наложения на светлый фон
                    className="absolute opacity-20 animate-float mix-blend-multiply grayscale-[20%]" 
                    style={{
                        ...style,
                        animationName: 'floatUp',
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite'
                    }}
                >
                    <img src={src} alt="" className="w-14 h-14" />
                </div>
            ))}
        </div>

        {/* Центральный контент */}
        <div className="relative z-10 flex flex-col items-center text-center px-4">
            {/* Логотип */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative mb-8"
            >
                {/* Свечение теперь в цвет бренда, но мягче */}
                <div className="absolute inset-0 bg-brand-primary/10 blur-3xl rounded-full animate-pulse-slow" />
                <img 
                    src="/icons/android-chrome-512x512.png" 
                    alt="Логотип" 
                    className="relative w-32 h-32 drop-shadow-xl"
                />
            </motion.div>

            {/* Текст приветствия */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
            >
                <h1 className="text-3xl md:text-4xl font-black text-brand-text-primary tracking-tight">
                    {greeting}, <span className="text-brand-primary">{userName}</span>
                </h1>
                
                {/* Индикатор загрузки */}
                <div className="flex items-center justify-center gap-3 mt-4 text-brand-text-secondary/60 text-sm font-bold tracking-widest uppercase">
                    <Loader2 size={18} className="animate-spin text-brand-primary" />
                    <span>Загрузка архива</span>
                </div>
            </motion.div>
        </div>

        <style jsx global>{`
            @keyframes floatUp {
                0% {
                    transform: translateY(110vh) rotate(0deg);
                    opacity: 0;
                }
                20% {
                    opacity: 0.4;
                }
                80% {
                    opacity: 0.4;
                }
                100% {
                    transform: translateY(-10vh) rotate(360deg);
                    opacity: 0;
                }
            }
            .animate-pulse-slow {
                animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
        `}</style>
    </motion.div>
  );
};

export default LoadingScreen;