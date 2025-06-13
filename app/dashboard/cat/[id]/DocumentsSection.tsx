// app/dashboard/cat/[id]/DocumentsSection.tsx
"use client";

import { Cat, Document as DocType } from "@/types";
import Button from "@/app/components/ui/Button";
import { Plus, FileText, ScanLine, Trash2 } from 'lucide-react';

interface DocumentsSectionProps {
    cat: Cat;
    canEdit: boolean;
    onAddClick: () => void;
    onScanClick: () => void;
    onDocumentClick: (doc: DocType) => void;
    // Добавляем недостающий проп
    onDeleteClick: (docId: string) => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ cat, canEdit, onAddClick, onScanClick, onDocumentClick, onDeleteClick }) => {
    const documents = cat.documents || [];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    const handleDelete = (e: React.MouseEvent, docId: string) => {
        // Останавливаем "всплытие" события, чтобы не открылось модальное окно просмотра
        e.stopPropagation();
        onDeleteClick(docId);
    };

    return (
        <div className="bg-brand-surface/80 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4 gap-2">
                <h3 className="text-xl font-semibold text-brand-text-primary">Документы</h3>
                {canEdit && (
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
                    {documents.map(doc => (
                        <div key={doc.id} className="aspect-square bg-brand-background rounded-lg group relative">
                            <button
                                onClick={() => onDocumentClick(doc)}
                                className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-lg"
                                title={doc.fileName}
                            >
                                {doc.fileType.startsWith('image/') ? (
                                    <img src={`${appUrl}${doc.filePath}`} alt={doc.fileName} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-brand-text-secondary">
                                        <FileText size={40} />
                                        <span className="text-xs mt-2 text-center truncate w-full">{doc.fileName}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                            </button>
                            {canEdit && (
                               <button 
                                  onClick={(e) => handleDelete(e, doc.id)} 
                                  className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 scale-90 group-hover:scale-100"
                                  title="Удалить документ"
                                >
                                    <Trash2 size={16}/>
                               </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-brand-text-secondary italic text-center py-4">Документов пока нет.</p>
            )}
        </div>
    );
};

export default DocumentsSection;
