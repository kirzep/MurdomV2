// app/components/InstallPWAButton.tsx
"use client";

import { useState, useEffect } from 'react';
import { DownloadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Определяем тип для события установки, чтобы TypeScript не ругался
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPWAButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Предотвращаем стандартное поведение браузера
      e.preventDefault();
      // Сохраняем событие, чтобы мы могли вызвать его позже
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Показываем кнопку
      setIsVisible(true);
      console.log("PWA install prompt is ready.");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Слушатель для отслеживания, когда приложение было установлено
    window.addEventListener('appinstalled', () => {
      // Скрываем кнопку после успешной установки
      setIsVisible(false);
      setInstallPrompt(null);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    // Показываем пользователю нативное окно установки
    await installPrompt.prompt();
    // Ждем выбора пользователя
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA installation');
    } else {
      console.log('User dismissed the PWA installation');
    }
    // Скрываем кнопку после взаимодействия
    setIsVisible(false);
    setInstallPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <button 
            onClick={handleInstallClick}
            className="w-full flex items-center gap-4 p-3 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors text-lg font-medium"
          >
            <DownloadCloud size={24} />
            Установить приложение
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
