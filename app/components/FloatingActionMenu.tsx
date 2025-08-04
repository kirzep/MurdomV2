// app/components/FloatingActionMenu.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageCircle, Sparkles } from 'lucide-react'; // Убрали Home
import Button from './ui/Button';

interface FloatingActionMenuProps {
  onChatClick: () => void;
  onAiClick: () => void;
  canUseAi: boolean;
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ onChatClick, onAiClick, canUseAi }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuVariants = {
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    closed: { x: "110%", opacity: 0, transition: { duration: 0.2 } },
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 30 } },
  };

  return (
    <div className="fixed bottom-20 right-0 z-40 flex items-center">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="flex flex-col items-end gap-3 mr-3"
          >
            {/* === ИЗМЕНЕНИЕ: Полностью удален блок с кнопкой "Архив 'Дома'" === */}
            {canUseAi && (
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <span className="bg-white/90 backdrop-blur-sm text-sm font-semibold px-3 py-1.5 rounded-full shadow-md text-brand-text-primary">ИИ-Ассистент</span>
                <Button
                  onClick={() => { onAiClick(); setIsOpen(false); }}
                  className="h-12 w-12 rounded-full shadow-lg bg-brand-primary text-white"
                  aria-label="Открыть ИИ-ассистента"
                >
                  <Sparkles size={24} />
                </Button>
              </motion.div>
            )}
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <span className="bg-white/90 backdrop-blur-sm text-sm font-semibold px-3 py-1.5 rounded-full shadow-md text-brand-text-primary">Общий чат</span>
              <Button
                onClick={() => { onChatClick(); setIsOpen(false); }}
                className="h-12 w-12 rounded-full shadow-lg"
                aria-label="Открыть чат"
              >
                <MessageCircle size={24} />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-20 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-l-full flex items-center justify-center shadow-lg focus:outline-none transition-colors"
        aria-label="Открыть меню действий"
      >
        <motion.div
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <Plus size={28} />
        </motion.div>
      </button>
    </div>
  );
};

export default FloatingActionMenu;