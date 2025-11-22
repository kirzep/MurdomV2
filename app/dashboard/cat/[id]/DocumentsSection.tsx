// app/dashboard/cat/[id]/DocumentsSection.tsx
"use client";

import { Cat, Document as DocType } from "@/types";
import { Plus, ScanLine, Trash2, Download, X, FolderOpen, FileQuestion } from 'lucide-react';
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DocumentItem from "./DocumentItem";

interface DocumentsSectionProps {
    cat: Cat;
    canEdit: boolean;
    onAddClick: () => void;
    onScanClick: () => void;
    onDocumentClick: (doc: DocType) => void;
    onDataChange: () => void;
    onSingleDelete: (docId: string) => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ cat, canEdit, onAddClick, onScanClick, onDocumentClick, onDataChange }) => {
    const documents = cat.documents || [];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    
    useEffect(() => {
        if(isSelectionMode && selectedDocs.length === 0) {
            setIsSelectionMode(false);
        }
    }, [selectedDocs, isSelectionMode]);

    const handleStartSelection = useCallback((docId: string) => {
        if (!canEdit) return;
        setIsSelectionMode(true);
        setSelectedDocs([docId]);
    }, [canEdit]);

    const handleToggleSelection = useCallback((docId: string) => {
        setSelectedDocs(prev => 
            prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
        );
    }, []);

    const handleCancelSelection = useCallback(() => {
        setIsSelectionMode(false);
        setSelectedDocs([]);
    }, []);

    const handleDeleteSelected = useCallback(async () => {
        if (selectedDocs.length === 0) return;
        if (confirm(`Вы уверены, что хотите удалить ${selectedDocs.length} выбранных документ(а)?`)) {
            try {
                await fetch(`/api/cats/${cat.id}/documents`, {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ ids: selectedDocs })
                });
                onDataChange();
                handleCancelSelection();
            } catch (error) {
                alert("Не удалось удалить документы");
            }
        }
    }, [cat.id, selectedDocs, onDataChange, handleCancelSelection]);
    
    const handleDownloadSelected = () => {
        const selectedDocuments = documents.filter(doc => selectedDocs.includes(doc.id));
        selectedDocuments.forEach((doc, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = `${appUrl}${doc.filePath}`;
                link.download = doc.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 300);
        });
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-lg p-6 sm:p-8 rounded-3xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 gap-2">
                <div className="flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                        <FolderOpen size={24} />
                    </div>
                    <h3 className="text-xl font-bold">Документы</h3>
                </div>
                
                {canEdit && !isSelectionMode && (
                  <div className="flex items-center gap-2">
                    <button 
                        onClick={onScanClick} 
                        className="w-10 h-10 sm:w-auto sm:h-10 sm:px-4 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm"
                        title="Сканировать"
                    >
                        <ScanLine size={18} />
                        <span className="hidden sm:inline text-sm font-semibold">Скан</span>
                    </button>
                    
                    <button 
                        onClick={onAddClick} 
                        className="w-10 h-10 sm:w-auto sm:h-10 sm:px-4 flex items-center justify-center gap-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-dark shadow-md shadow-brand-primary/20 transition-all active:scale-95"
                        title="Загрузить файл"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline text-sm font-bold">Загрузить</span>
                    </button>
                  </div>
                )}
            </div>

            {documents.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                    {documents.map(doc => (
                        <DocumentItem
                            key={doc.id}
                            doc={doc}
                            isSelected={selectedDocs.includes(doc.id)}
                            isSelectionMode={isSelectionMode}
                            onToggleSelection={handleToggleSelection}
                            onStartSelection={handleStartSelection}
                            onOpenDocument={onDocumentClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                        <FileQuestion size={32} className="opacity-50" />
                    </div>
                    <p className="font-medium">Папка пуста</p>
                    <p className="text-xs opacity-70 mt-1">Загрузите сканы или фото</p>
                </div>
            )}

            <AnimatePresence>
                {isSelectionMode && (
                    <motion.div
                        initial={{ y: "120%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "120%", opacity: 0 }}
                        className="fixed bottom-6 inset-x-4 max-w-lg mx-auto z-[60]"
                    >
                        <div className="bg-white/90 backdrop-blur-xl text-gray-800 rounded-2xl p-2 pl-4 shadow-2xl flex items-center justify-between border border-white/50 ring-1 ring-black/5">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleCancelSelection} 
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20}/>
                                </button>
                                <span className="font-bold text-sm">Выбрано: {selectedDocs.length}</span>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleDownloadSelected} 
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Download size={18} />
                                    <span className="hidden sm:inline">Скачать</span>
                                </button>
                                <button 
                                    onClick={handleDeleteSelected} 
                                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 size={18} />
                                    <span className="hidden sm:inline">Удалить</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DocumentsSection;