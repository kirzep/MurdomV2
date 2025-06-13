// app/components/SidePanel.tsx
"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { User, Archive, X, Users } from 'lucide-react';
import Link from 'next/link';
import InstallPWAButton from './InstallPWAButton'; // Импортируем наш новый компонент

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-72 bg-brand-surface shadow-2xl z-50 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold text-brand-primary">Навигация</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-background transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex flex-col gap-4 flex-grow">
              <Link href="/dashboard" onClick={onClose} className="flex items-center gap-4 p-3 rounded-lg hover:bg-brand-primary-light transition-colors text-lg font-medium text-brand-text-primary">
                <Archive size={24} />
                Архив
              </Link>
              <Link href="/profile" onClick={onClose} className="flex items-center gap-4 p-3 rounded-lg hover:bg-brand-primary-light transition-colors text-lg font-medium text-brand-text-primary">
                <User size={24} />
                Мой профиль
              </Link>
              <Link href="/staff" onClick={onClose} className="flex items-center gap-4 p-3 rounded-lg hover:bg-brand-primary-light transition-colors text-lg font-medium text-brand-text-primary">
                <Users size={24} />
                Персонал
              </Link>
            </nav>

            {/* Блок для кнопки установки внизу панели */}
            <div className="mt-auto">
                <InstallPWAButton />
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidePanel;
