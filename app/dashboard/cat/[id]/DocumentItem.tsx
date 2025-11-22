// app/dashboard/cat/[id]/DocumentItem.tsx
"use client";

import { Document as DocType } from "@/types";
import useLongPress from "@/hooks/useLongPress";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2, Image as ImageIcon, File } from "lucide-react";

interface DocumentItemProps {
  doc: DocType;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelection: (docId: string) => void;
  onStartSelection: (docId: string) => void;
  onOpenDocument: (doc: DocType) => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ doc, isSelected, isSelectionMode, onToggleSelection, onStartSelection, onOpenDocument }) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const isImage = doc.fileType.startsWith('image/');

  const longPressEvents = useLongPress(
    () => onStartSelection(doc.id),
    () => (isSelectionMode ? onToggleSelection(doc.id) : onOpenDocument(doc)),
    { delay: 500 }
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: isSelected ? 0.95 : 1 }}
      whileHover={{ y: isSelectionMode ? 0 : -4 }} // Поднимаем при наведении (если не режим выбора)
      className={`
        relative aspect-square group cursor-pointer overflow-hidden rounded-2xl
        transition-all duration-300
        /* Стеклянный стиль базы */
        bg-white/60 backdrop-blur-md border border-white/60 shadow-sm
        
        ${isSelected 
            ? 'ring-4 ring-brand-primary shadow-none' // Активный выбор
            : 'hover:shadow-xl hover:bg-white/80'    // Обычное состояние
        }
      `}
      {...longPressEvents}
    >
        {/* --- КОНТЕНТ --- */}
        <div className={`w-full h-full transition-opacity duration-300 ${isSelectionMode && !isSelected ? 'opacity-50 grayscale' : 'opacity-100'}`}>
            
            {isImage ? (
                // ВАРИАНТ: ИЗОБРАЖЕНИЕ
                <div className="w-full h-full relative">
                     <img 
                        src={`${appUrl}${doc.filePath}`} 
                        alt={doc.fileName} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        loading="lazy"
                     />
                     {/* Градиент снизу для текста */}
                     <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                </div>
            ) : (
                // ВАРИАНТ: ФАЙЛ (PDF и др)
                <div className="w-full h-full flex flex-col items-center justify-center p-4 relative bg-blue-50/30">
                     {/* Фоновая большая иконка */}
                    <File className="absolute text-brand-primary/5 w-24 h-24 rotate-12" />
                    
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-primary z-10 mb-2 group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                    </div>
                    
                    {/* Расширение файла (простая логика) */}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/60 bg-brand-primary/5 px-2 py-0.5 rounded-full">
                        {doc.fileType.split('/')[1] || 'FILE'}
                    </span>
                </div>
            )}

            {/* --- НАЗВАНИЕ ФАЙЛА (Внизу) --- */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                <p className={`
                    text-xs font-bold truncate
                    ${isImage ? 'text-white drop-shadow-md' : 'text-gray-700'}
                `}>
                    {doc.fileName}
                </p>
            </div>
        </div>

        {/* --- ОВЕРЛЕЙ ВЫБОРА --- */}
        <AnimatePresence>
            {isSelectionMode && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`
                    absolute inset-0 z-30 flex items-center justify-center
                    ${isSelected ? 'bg-brand-primary/20 backdrop-blur-[2px]' : 'bg-transparent'}
                `}
            >
                {/* Кружок галочки */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`
                        w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white
                        ${isSelected 
                            ? 'bg-brand-primary text-white scale-100' 
                            : 'bg-white/40 backdrop-blur-md text-transparent hover:bg-white/80' // Пустой кружок, если не выбрано
                        }
                    `}
                >
                    <CheckCircle2 size={20} strokeWidth={3} />
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>

        {/* Индикатор типа файла в углу для картинок (опционально) */}
        {isImage && !isSelectionMode && (
            <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-md p-1.5 rounded-lg text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon size={14} />
            </div>
        )}
    </motion.div>
  );
};

export default DocumentItem;