// app/components/ui/Modal.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";
import { X } from 'lucide-react';
import Portal from './Portal'; // Импортируем наш Портал

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, headerActions }) => {
  
  // Блокируем скролл страницы, когда модалка открыта
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    /* Оборачиваем все в Portal.
       Теперь модальное окно физически рендерится в конце тега <body>,
       а не там, где ты вставил компонент <Modal /> в коде.
    */
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
              {/* 1. Фон (Backdrop) */}
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
                  onClick={onClose}
              />

              {/* 2. Контейнер модального окна */}
              <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                  className="
                      relative w-full max-w-lg max-h-[90vh] flex flex-col
                      bg-white/95 backdrop-blur-2xl
                      rounded-[2rem] shadow-2xl border border-white/60
                      overflow-hidden
                  "
                  onClick={(e) => e.stopPropagation()}
              >
                  {/* Хедер */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/50 shrink-0">
                      <h3 className="text-xl font-bold text-gray-800 truncate pr-4">
                          {title}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                          {headerActions}
                          <button 
                              onClick={onClose}
                              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                          >
                              <X size={20} />
                          </button>
                      </div>
                  </div>

                  {/* Контент с кастомным скроллом */}
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      {children}
                  </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default Modal;