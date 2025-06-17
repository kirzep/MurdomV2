// app/dashboard/cat/[id]/DocumentsSection.tsx
"use client";

import { Cat, Document as DocType } from "@/types";
import Button from "@/app/components/ui/Button";
import { Plus, ScanLine, Trash2, Download, X } from 'lucide-react';
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DocumentItem from "./DocumentItem"; // ИЗМЕНЕНИЕ: Импортируем новый компонент

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
        <div className="bg-brand-surface/80 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4 gap-2">
                <h3 className="text-xl font-semibold text-brand-text-primary">Документы</h3>
                {canEdit && !isSelectionMode && (
                  <div className="flex items-center gap-2">
                    <Button onClick={onScanClick} variant="secondary" className="p-2 sm:px-4 sm:w-auto w-11 h-11">
                        <ScanLine size={20} className="sm:mr-2"/>
                        <span className="hidden sm:inline">Сканировать</span>
                    </Button>
                    <Button onClick={onAddClick} className="p-2 sm:px-4 sm:w-auto w-11 h-11">
                        <Plus size={20} className="sm:mr-2"/>
                        <span className="hidden sm:inline">Загрузить</span>
                    </Button>
                  </div>
                )}
            </div>
            {documents.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {/* ИЗМЕНЕНИЕ: Используем новый компонент DocumentItem внутри цикла */}
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
                <p className="text-brand-text-secondary italic text-center py-4">Документов пока нет.</p>
            )}

            <AnimatePresence>
                {isSelectionMode && (
                    <motion.div
                        initial={{ y: "120%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "120%" }}
                        className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-50"
                    >
                        <div className="bg-brand-surface text-brand-text-primary rounded-xl p-3 shadow-2xl flex items-center justify-between border border-brand-border">
                            <Button onClick={handleCancelSelection} variant="secondary" className="!p-2 !h-10 !w-10 !rounded-full">
                                <X size={24}/>
                            </Button>
                            <span className="font-semibold text-sm">Выбрано: {selectedDocs.length}</span>
                            <div className="flex gap-2">
                                <Button onClick={handleDownloadSelected} variant="secondary" className="!rounded-full !h-10 !w-10 sm:!w-auto sm:!px-4">
                                    <Download size={24} className="sm:mr-2"/>
                                    <span className="hidden sm:inline">Скачать</span>
                                </Button>
                                <Button onClick={handleDeleteSelected} variant="danger" className="!rounded-full !h-10 !w-10 sm:!w-auto sm:!px-4">
                                    <Trash2 size={24} className="sm:mr-2"/>
                                    <span className="hidden sm:inline">Удалить</span>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DocumentsSection;