// app/dashboard/cat/[id]/DocumentsSection.tsx
"use client";

import { Cat, Document, DocumentCategory } from "@/types";
import Button from "@/app/components/ui/Button";
import { Plus, FileText, Trash2, Download, Eye } from 'lucide-react';
import { format } from "date-fns";
import { ru } from 'date-fns/locale';

interface DocumentsSectionProps {
    cat: Cat;
    canEdit: boolean;
    onAddClick: () => void;
    onViewClick: (doc: Document) => void;
    onDeleteClick: (docId: string) => void;
}

const categoryNames: Record<DocumentCategory, string> = {
  RECEIPT: 'Чеки',
  ANALYSES: 'Анализы',
  REPORTS: 'Выписки',
  DEWORMING: 'Дегельминтизация',
  FLEA_TREATMENT: 'Обработка от блох',
  EAR_MITE_TREATMENT: 'Обработка от клещей',
  VACCINATION: 'Вакцинация',
  ILLNESS_REPORT: 'Выписка по болезни',
};

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ cat, canEdit, onAddClick, onViewClick, onDeleteClick }) => {
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
            <div className="space-y-4">
                {Object.values(DocumentCategory).map((catKey) => {
                    const documentsInCategory = cat.documents?.filter(doc => doc.category === catKey) || [];
                    if (documentsInCategory.length === 0) return null;
                    
                    return (
                        <div key={catKey}>
                            <h4 className="font-semibold text-brand-text-primary mb-2">{categoryNames[catKey]}</h4>
                            <ul className="space-y-2">
                                {documentsInCategory.map(doc => (
                                    <li key={doc.id} className="flex items-center justify-between bg-brand-background p-2.5 rounded-lg">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FileText size={22} className="text-brand-primary flex-shrink-0"/>
                                            <span className="truncate" title={doc.fileName}>{doc.fileName}</span>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                            <button onClick={() => onViewClick(doc)} className="p-2 rounded-full hover:bg-brand-border transition-colors text-brand-primary"><Eye size={22}/></button>
                                            <a href={doc.filePath} download={doc.fileName} className="p-2 rounded-full hover:bg-brand-border transition-colors text-brand-primary block"><Download size={22}/></a>
                                            {canEdit && (
                                              <button onClick={() => onDeleteClick(doc.id)} className="p-2 rounded-full hover:bg-brand-border transition-colors text-brand-accent"><Trash2 size={22}/></button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
                 {(!cat.documents || cat.documents.length === 0) && <p className="text-brand-text-secondary italic text-center py-4">Документов пока нет.</p>}
            </div>
        </div>
    );
};

export default DocumentsSection;
