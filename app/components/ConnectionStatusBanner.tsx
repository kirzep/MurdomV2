// app/components/ConnectionStatusBanner.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, ServerCrash, Wifi } from 'lucide-react';

export default function ConnectionStatusBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [isServerOk, setIsServerOk] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkServerStatus = async () => {
        try {
            const response = await fetch('/api/health');
            setIsServerOk(response.ok);
        } catch (error) {
            setIsServerOk(false);
        }
    }

    checkServerStatus();
    const intervalId = setInterval(checkServerStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  let bannerContent = null;

  if (!isOnline) {
    bannerContent = {
      icon: <WifiOff size={20} />,
      title: "Нет интернета",
      message: "Проверьте подключение к сети",
      colorClasses: "bg-amber-50 border-amber-200 text-amber-800",
      iconBg: "bg-amber-100 text-amber-600"
    };
  } else if (!isServerOk) {
    bannerContent = {
      icon: <ServerCrash size={20} />,
      title: "Ошибка сервера",
      message: "Сервис временно недоступен",
      colorClasses: "bg-red-50 border-red-200 text-red-800",
      iconBg: "bg-red-100 text-red-600"
    };
  }
  
  return (
    <AnimatePresence>
        {bannerContent && (
            <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4">
                <motion.div
                    initial={{ y: -100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -100, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`
                        pointer-events-auto
                        flex items-center gap-3 p-3 pr-5 rounded-2xl border shadow-xl backdrop-blur-md
                        ${bannerContent.colorClasses}
                    `}
                >
                    <div className={`p-2 rounded-xl ${bannerContent.iconBg}`}>
                        {bannerContent.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold leading-tight">{bannerContent.title}</span>
                        <span className="text-xs opacity-80 font-medium">{bannerContent.message}</span>
                    </div>
                    
                    {/* Индикатор пульсации (декоративный) */}
                    <span className="relative flex h-3 w-3 ml-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${!isOnline ? 'bg-amber-400' : 'bg-red-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${!isOnline ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                    </span>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
  );
}