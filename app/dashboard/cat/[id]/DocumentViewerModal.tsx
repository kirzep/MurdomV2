// app/dashboard/cat/[id]/DocumentViewerModal.tsx
"use client";

import React from 'react';
import { Document as DocType } from '@/types';
import { Download, Trash2, X, FileText, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentViewerModalProps {
    doc: DocType | null;
    onClose: () => void;
    canEdit: boolean;
    onDelete: () => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ doc, onClose, canEdit, onDelete }) => {
    // Используем AnimatePresence в родительском компоненте или здесь для анимации появления/исчезновения
    // Но так как компонент монтируется/размонтируется по условию, анимацию лучше делать внутри
    if (!doc) return null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const fileSrc = `${appUrl}${doc.filePath}`;
    const isImage = doc.fileType.startsWith('image/');
    const isPdf = doc.fileType === 'application/pdf';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center sm:p-4">
                {/* 1. Затемненный фон (Backdrop) */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-pointer"
                />

                {/* 2. Контейнер контента */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative z-10 w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center p-4 pointer-events-none"
                >
                    {/* pointer-events-auto нужен, чтобы можно было взаимодействовать с контентом (например, скроллить PDF) */}
                    <div className="pointer-events-auto relative w-full h-full flex items-center justify-center">
                        
                        {/* Вариант: Картинка */}
                        {isImage && (
                            <img 
                                src={fileSrc} 
                                alt={doc.fileName} 
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                            />
                        )}

                        {/* Вариант: PDF */}
                        {isPdf && (
                            <iframe
                                src={fileSrc}
                                className="w-full h-full bg-white rounded-xl shadow-2xl border-0"
                                title={doc.fileName}
                            />
                        )}

                        {/* Вариант: Неизвестный формат */}
                        {!isImage && !isPdf && (
                            <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl text-center border border-white/20">
                                <FileText size={64} className="text-white mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-bold text-white mb-2">{doc.fileName}</h3>
                                <p className="text-gray-400 mb-6">Предпросмотр недоступен для этого типа файла</p>
                                <a 
                                    href={fileSrc} 
                                    download={doc.fileName}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    <Download size={20} />
                                    Скачать файл
                                </a>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 3. Парящая панель управления (Header/Toolbar) */}
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none"
                >
                    {/* Название файла (Слева) */}
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-white pointer-events-auto max-w-[200px] sm:max-w-md truncate shadow-lg">
                        <span className="text-sm font-medium">{doc.fileName}</span>
                    </div>

                    {/* Кнопка закрытия (Справа) */}
                    <button 
                        onClick={onClose}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 p-2 rounded-full text-white pointer-events-auto transition-all hover:rotate-90 shadow-lg"
                    >
                        <X size={24} />
                    </button>
                </motion.div>

                {/* 4. Парящая панель действий (Bottom Bar) */}
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="absolute bottom-6 z-20 pointer-events-auto"
                >
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl">
                        {/* Скачать */}
                        <a 
                            href={fileSrc} 
                            download={doc.fileName}
                            className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors flex flex-col items-center gap-1 min-w-[60px]"
                            title="Скачать"
                        >
                            <Download size={24} />
                            <span className="text-[10px] font-bold opacity-70">Save</span>
                        </a>

                        {/* Открыть в новом окне (для PDF полезно) */}
                        <a 
                            href={fileSrc} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors flex flex-col items-center gap-1 min-w-[60px]"
                            title="Открыть в новой вкладке"
                        >
                            <ExternalLink size={24} />
                            <span className="text-[10px] font-bold opacity-70">Open</span>
                        </a>

                        {/* Удалить (Только если можно) */}
                        {canEdit && (
                            <>
                                <div className="w-px h-8 bg-white/20 mx-1" /> {/* Разделитель */}
                                <button 
                                    onClick={onDelete}
                                    className="p-3 text-red-400 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-colors flex flex-col items-center gap-1 min-w-[60px]"
                                    title="Удалить"
                                >
                                    <Trash2 size={24} />
                                    <span className="text-[10px] font-bold opacity-70">Del</span>
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DocumentViewerModal;