// app/components/InstallPWAButton.tsx
"use client";

import { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setInstallPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleInstallClick}
            className="
                flex items-center justify-between p-5 rounded-[2rem] border shadow-sm transition-all text-left w-full
                bg-blue-50/80 border-blue-100 hover:bg-blue-100
            "
        >
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
                    <Smartphone size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900">Установить приложение</h3>
                    <p className="text-xs font-medium text-blue-700">Добавить на главный экран</p>
                </div>
            </div>
            <div className="text-blue-400">
                <Download size={20} />
            </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}