// app/template.tsx
"use client";

import { motion } from 'framer-motion';

// Этот компонент будет оборачивать каждую страницу и запускать анимацию при переходе
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(5px)" }} // Начинаем немного снизу, прозрачными и размытыми
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} // Плавно проявляемся, поднимаемся и фокусируемся
      exit={{ opacity: 0, y: -20, filter: "blur(5px)" }} // При уходе - растворяемся вверх
      transition={{ 
          duration: 0.4, 
          ease: [0.22, 1, 0.36, 1] // Кастомная кривая Безье для очень приятного "доводчика"
      }}
      className="min-h-screen" // Убеждаемся, что контейнер занимает всю высоту
    >
      {children}
    </motion.div>
  );
}