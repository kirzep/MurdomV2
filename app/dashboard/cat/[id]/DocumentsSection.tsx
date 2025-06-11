// app/dashboard/cat/[id]/DocumentsSection.tsx
"use client";

import { Cat, Document as DocType } from "@/types";
import Button from "@/app/components/ui/Button";
import { Plus, FileText } from 'lucide-react';

interface DocumentsSectionProps {
    cat: Cat;
    canEdit: boolean;
    onAddClick: () => void;
    onDocumentClick: (doc: DocType) => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ cat, canEdit, onAddClick, onDocumentClick }) => {
    const documents = cat.documents || [];

    return (
        <div className="bg-brand-surface/80 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-brand-text-primary">Документы</h3>
                {canEdit && (
                  <Button onClick={onAddClick}>
                      <Plus size={20} className="mr-2"/> Загрузить
                  </Button>
                )}
            </div>
            {documents.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {documents.map(doc => (
                        <button
                            key={doc.id}
                            onClick={() => onDocumentClick(doc)}
                            className="aspect-square bg-brand-background rounded-lg overflow-hidden group relative focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            title={doc.fileName}
                        >
                            {doc.fileType.startsWith('image/') ? (
                                <img src={doc.filePath} alt={doc.fileName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-brand-text-secondary">
                                    <FileText size={40} />
                                    <span className="text-xs mt-2 text-center truncate w-full">{doc.fileName}</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-brand-text-secondary italic text-center py-4">Документов пока нет.</p>
            )}
        </div>
    );
};

export default DocumentsSection;
