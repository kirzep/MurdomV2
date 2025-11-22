// app/dashboard/cat/[id]/DocumentViewerModal.tsx
"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Download, FileText, ExternalLink } from 'lucide-react';
import { Document as DocType } from "@/types";
import Button from '@/app/components/ui/Button';
import Portal from '@/app/components/ui/Portal'; // 1. Импортируем Портал

interface DocumentViewerModalProps {
  doc: DocType | null;
  onClose: () => void;
  canEdit: boolean;
  onDelete: () => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ doc, onClose, canEdit, onDelete }) => {
  
  useEffect(() => {
    if (doc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [doc]);

  if (!doc) return null;

  const isImage = doc.fileType.startsWith('image/');
  const isPdf = doc.fileType === 'application/pdf';

  return (
    // 2. Оборачиваем в Портал
    <Portal>
      <AnimatePresence>
        {doc && (
          // 3. Обновляем контейнер: z-[9999], h-[100dvh], w-screen, fixed inset-0
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 h-[100dvh] w-screen">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden max-h-[90vh] flex flex-col z-10"
                onClick={e => e.stopPropagation()}
            >
                {/* Хедер */}
                <div className="px-6 py-4 border-b border-gray-100/50 flex items-center justify-between shrink-0 bg-white/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 truncate" title={doc.fileName}>
                            {doc.fileName}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <a href={doc.filePath} download target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-brand-primary">
                            <Download size={20} />
                        </a>
                        <button 
                            onClick={onClose}
                            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Контент */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/50 flex items-center justify-center relative">
                    {isImage ? (
                        <img src={doc.filePath} alt={doc.fileName} className="max-w-full max-h-full object-contain rounded-2xl shadow-sm" />
                    ) : isPdf ? (
                        <iframe src={`${doc.filePath}#toolbar=0`} className="w-full h-full rounded-2xl shadow-sm border border-gray-200" title={doc.fileName} />
                    ) : (
                         <div className="flex flex-col items-center justify-center text-gray-400 py-10">
                            <FileText size={64} className="mb-4 opacity-50" />
                            <p>Предпросмотр недоступен</p>
                            <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-2 text-brand-primary font-bold hover:underline">
                                <ExternalLink size={16} /> Открыть в новой вкладке
                            </a>
                        </div>
                    )}
                </div>

                {/* Футер с действиями */}
                {canEdit && (
                    <div className="px-6 py-4 border-t border-gray-100/50 bg-white/50 flex justify-end shrink-0">
                        <Button variant="danger" onClick={onDelete} className="rounded-xl">
                            <Trash2 size={18} className="mr-2" />
                            Удалить документ
                        </Button>
                    </div>
                )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default DocumentViewerModal;