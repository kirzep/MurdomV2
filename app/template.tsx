// app/template.tsx
"use client";

import { motion } from 'framer-motion';

// Этот компонент будет оборачивать каждую страницу
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} // Начальное состояние: невидимый и сдвинутый вниз
      animate={{ opacity: 1, y: 0 }} // Конечное состояние: полностью видимый и на своем месте
      transition={{ ease: 'easeInOut', duration: 0.5 }} // Плавная анимация
    >
      {children}
    </motion.div>
  );
}
