// app/components/ConnectionStatusBanner.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, ServerCrash } from 'lucide-react';

export default function ConnectionStatusBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [isServerOk, setIsServerOk] = useState(true);

  useEffect(() => {
    // Проверяем онлайн-статус при загрузке
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
    
    // Слушатели для отслеживания изменений статуса сети
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Проверяем доступность сервера при загрузке и периодически
    const checkServerStatus = async () => {
        try {
            // Мы делаем простой запрос к API, который не требует данных
            const response = await fetch('/api/health');
            setIsServerOk(response.ok);
        } catch (error) {
            setIsServerOk(false);
        }
    }

    checkServerStatus();
    const intervalId = setInterval(checkServerStatus, 30000); // Проверяем каждые 30 секунд

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  let bannerContent = null;
  if (!isOnline) {
    bannerContent = {
      icon: <WifiOff />,
      message: "Нет подключения к интернету. Данные могут быть неактуальны.",
      bgColor: "bg-amber-500",
    };
  } else if (!isServerOk) {
    bannerContent = {
      icon: <ServerCrash />,
      message: "Не удается подключиться к серверу. Свяжитесь с разработчиком.",
      bgColor: "bg-rose-500",
    };
  }
  
  return (
    <AnimatePresence>
        {bannerContent && (
            <motion.div
                // ИСПРАВЛЕНИЕ: Анимируем высоту, а не позицию
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                // ИСПРАВЛЕНИЕ: Удаляем 'fixed', чтобы баннер сдвигал контент вниз
                className={`overflow-hidden ${bannerContent.bgColor}`}
            >
                <div className="p-3 text-white text-center text-sm font-semibold flex items-center justify-center gap-2">
                    {bannerContent.icon}
                    {bannerContent.message}
                </div>
            </motion.div>
        )}
    </AnimatePresence>
  );
}
