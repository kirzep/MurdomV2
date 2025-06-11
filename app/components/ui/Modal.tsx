// app/components/ui/Modal.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode; // Новый необязательный пропс для кнопок
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, headerActions }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-brand-surface p-6 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <h3 className="text-xl font-semibold text-brand-text-primary truncate pr-4">{title}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Рендерим дополнительные кнопки здесь */}
                {headerActions}
                {/* Основная кнопка закрытия теперь не нужна, если есть headerActions, но оставим для обратной совместимости */}
              </div>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
