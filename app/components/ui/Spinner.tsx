// app/components/ui/Spinner.tsx
"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpinnerProps {
  className?: string;
  size?: number;
}

const Spinner: React.FC<SpinnerProps> = ({ className = "", size = 48 }) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }} // Плавное появление
        className={`flex justify-center items-center h-full w-full ${className}`}
    >
      <div className="relative">
         {/* Основной спиннер */}
         <Loader2 
            className="animate-spin text-brand-primary" 
            size={size} 
            strokeWidth={2}
         />
         
         {/* Опционально: Декоративный элемент (подложка или блик) */}
         <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full scale-75 animate-pulse" />
      </div>
    </motion.div>
  );
};

export default Spinner;