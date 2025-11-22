// app/dashboard/cat/[id]/CatProfileView.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Cat, Document as DocType, TreatmentType, AuditLog as AuditLogType } from "@/types"; 
import CatProfileHeader from "./CatProfileHeader";
import NotesSection from "./NotesSection";
import TreatmentsSection from "./TreatmentsSection";
import DocumentsSection from "./DocumentsSection";
import EditCatModal from "./EditCatModal";
import Modal from "@/app/components/ui/Modal";
import DocumentViewerModal from "./DocumentViewerModal";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import AuditLogModal from './AuditLogModal';
import ScanDocumentModal from "./ScanDocumentModal";
import { FileUp, Loader2, Syringe, Calendar, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const treatmentMeta: Record<TreatmentType, { name: string }> = {
  [TreatmentType.WORMS]: { name: 'Дегельминтизация' },
  [TreatmentType.FLEAS]: { name: 'Обработка от эктопаразитов' },
  [TreatmentType.EAR_MITES]: { name: 'Акарицидная обработка' },
  [TreatmentType.VACCINATION]: { name: 'Вакцинация' },
};

type DocUploadState = {
    file: File;
    customName: string;
    id: number;
};

interface CatProfileViewProps {
    cat: Cat;
    auditLogs: AuditLogType[];
    canEdit: boolean;
    onDataChange: () => void;
}

export default function CatProfileView({ cat, auditLogs, canEdit, onDataChange }: CatProfileViewProps) {
    const router = useRouter();
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddTreatmentModalOpen, setIsAddTreatmentModalOpen] = useState(false);
    const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [viewingDoc, setViewingDoc] = useState<DocType | null>(null);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    
    const [treatmentForm, setTreatmentForm] = useState({ 
        type: TreatmentType.WORMS, 
        date: new Date().toISOString().split('T')[0], 
        productName: '',
        vaccinationStage: 'first'
    });
    const [docFilesToUpload, setDocFilesToUpload] = useState<DocUploadState[]>([]);
    const [isFormLoading, setIsFormLoading] = useState(false);

    const handleDocFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newFilesState = files.map((file, index) => ({
                file,
                customName: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
                id: Date.now() + index
            }));
            setDocFilesToUpload(newFilesState);
        }
    };

    const handleSingleDocNameChange = (id: number, newName: string) => {
        setDocFilesToUpload(currentFiles =>
            currentFiles.map(f => (f.id === id ? { ...f, customName: newName } : f))
        );
    };

    const handleNotesUpdate = async (data: Partial<Cat>) => {
        if (!cat.id) return;
        try {
            await fetch(`/api/cats/${cat.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            onDataChange();
        } catch (error) {
            console.error("Failed to update notes:", error);
        }
    };
    
    const handleDeleteCat = async () => {
        if (window.confirm(`Вы уверены, что хотите удалить профиль кошки "${cat.name}"? Это действие необратимо.`)) {
            try {
                await fetch(`/api/cats/${cat.id}`, { method: 'DELETE' });
                alert('Профиль удален.');
                router.push('/dashboard');
            } catch (error) {
                console.error("Failed to delete cat:", error);
                alert('Не удалось удалить профиль.');
            }
        }
    };

    const handleDeleteTreatment = async (treatmentId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
            await fetch(`/api/cats/${cat.id}/treatments?treatmentId=${treatmentId}`, { method: 'DELETE' });
            onDataChange();
        }
    };

    const handleAddTreatment = async (e: FormEvent) => {
        e.preventDefault();
        setIsFormLoading(true);
        try {
            const body = {
                ...treatmentForm,
                vaccinationStage: treatmentForm.type === TreatmentType.VACCINATION ? treatmentForm.vaccinationStage : null,
            };
            await fetch(`/api/cats/${cat.id}/treatments`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            setIsAddTreatmentModalOpen(false);
            onDataChange();
        } catch (error) {
            console.error("Error adding treatment:", error);
        } finally {
            setIsFormLoading(false);
        }
    };

    const handleDeleteSingleDocument = async (docId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот документ?')) {
            await fetch(`/api/cats/${cat.id}/documents?documentId=${docId}`, { method: 'DELETE' });
            setViewingDoc(null);
            onDataChange();
        }
    };

    const handleAddDocument = async (e: FormEvent) => {
        e.preventDefault();
        if (docFilesToUpload.length === 0) return;
        setIsFormLoading(true);
        const uploadPromises = docFilesToUpload.map(async (docState) => {
            const formData = new FormData();
            formData.append('file', docState.file);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(`Ошибка загрузки файла: ${docState.file.name}`);
            await fetch(`/api/cats/${cat.id}/documents`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...uploadData, fileName: docState.customName.trim() }),
            });
        });
        try {
            await Promise.all(uploadPromises);
        } catch (error) {
            console.error(error);
            alert((error as Error).message);
        } finally {
            setIsFormLoading(false);
            setIsAddDocModalOpen(false);
            setDocFilesToUpload([]);
            onDataChange();
        }
    };

    const handleScanComplete = (scannedFile: File) => {
        setDocFilesToUpload([{
            file: scannedFile,
            customName: `Скан от ${new Date().toLocaleDateString()}`,
            id: Date.now()
        }]);
        setIsAddDocModalOpen(true);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="pb-24"
        >
            <ScanDocumentModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} onScanComplete={handleScanComplete} />
            <DocumentViewerModal 
                doc={viewingDoc} 
                onClose={() => setViewingDoc(null)} 
                canEdit={canEdit} 
                onDelete={() => viewingDoc && handleDeleteSingleDocument(viewingDoc.id)}
            />
            <AuditLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} logs={auditLogs} catCreator={cat?.creator} catCreatedAt={cat?.createdAt} />
            
            {canEdit && (
                <EditCatModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onCatUpdated={onDataChange} cat={cat} />
            )}

             {canEdit && (
                <Modal isOpen={isAddTreatmentModalOpen} onClose={() => setIsAddTreatmentModalOpen(false)} title="Новая запись">
                    <form onSubmit={handleAddTreatment} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Тип обработки</label>
                            <div className="relative">
                                <Syringe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select 
                                    value={treatmentForm.type} 
                                    onChange={e => setTreatmentForm({...treatmentForm, type: e.target.value as TreatmentType})} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-medium text-gray-700 appearance-none"
                                >
                                    {Object.entries(treatmentMeta).map(([key, {name}]) => <option key={key} value={key} className="capitalize">{name}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        {treatmentForm.type === TreatmentType.VACCINATION && (
                             <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Этап вакцинации</label>
                                <div className="relative">
                                    <select 
                                        value={treatmentForm.vaccinationStage} 
                                        onChange={e => setTreatmentForm({...treatmentForm, vaccinationStage: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-medium text-gray-700"
                                    >
                                        <option value="first">Первичная вакцинация</option>
                                        <option value="second">Ревакцинация</option>
                                        <option value="revaccination">Ежегодная вакцинация</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Дата</label>
                           <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="date" 
                                    value={treatmentForm.date} 
                                    onChange={e => setTreatmentForm({...treatmentForm, date: e.target.value})} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-medium text-gray-700"
                                    required
                                />
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Препарат</label>
                           <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    placeholder="Название препарата..." 
                                    value={treatmentForm.productName} 
                                    onChange={e => setTreatmentForm({...treatmentForm, productName: e.target.value})} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-medium text-gray-700"
                                    required
                                />
                           </div>
                        </div>

                        <Button type="submit" isLoading={isFormLoading} className="w-full h-12 text-lg rounded-xl shadow-lg shadow-brand-primary/20">
                            Добавить запись
                        </Button>
                    </form>
                </Modal>
            )}

            {canEdit && (
                <Modal isOpen={isAddDocModalOpen} onClose={() => {setDocFilesToUpload([]); setIsAddDocModalOpen(false);}} title="Загрузка документов">
                     <form onSubmit={handleAddDocument} className="space-y-5">
                        <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-brand-primary transition-all group">
                            <div className="p-3 bg-gray-100 rounded-full mb-3 group-hover:bg-brand-primary/10 transition-colors">
                                <FileUp className="w-8 h-8 text-gray-400 group-hover:text-brand-primary transition-colors" />
                            </div>
                            <span className="font-bold text-gray-700 group-hover:text-brand-primary">Выберите файлы</span>
                            <span className="text-sm text-gray-400 mt-1">или перетащите их сюда</span>
                        </label>
                        <input id="file-upload" type="file" multiple onChange={handleDocFilesChange} className="hidden"/>
                        
                        {docFilesToUpload.length > 0 && (
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {docFilesToUpload.map((docState) => (
                                    <div key={docState.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="text-xs text-gray-400 mb-1 truncate">{docState.file.name}</div>
                                        <input 
                                            value={docState.customName} 
                                            onChange={e => handleSingleDocNameChange(docState.id, e.target.value)} 
                                            placeholder="Название документа (обязательно)" 
                                            className="w-full bg-transparent border-b border-gray-300 focus:border-brand-primary outline-none py-1 text-sm font-medium text-gray-700 transition-colors"
                                            required 
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        <Button type="submit" isLoading={isFormLoading} disabled={docFilesToUpload.length === 0} className="w-full h-12 rounded-xl">
                            Загрузить ({docFilesToUpload.length})
                        </Button>
                    </form>
                </Modal>
            )}

            <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
                 <CatProfileHeader
                    cat={cat}
                    canEdit={canEdit}
                    onEdit={() => setIsEditModalOpen(true)}
                    onDelete={handleDeleteCat}
                    onInfoClick={() => setIsLogModalOpen(true)}
                />
                
                {/* Сетка контента */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-min">
                    {/* Левая колонка (Заметки и Документы) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                         <NotesSection cat={cat} onUpdate={handleNotesUpdate} canEdit={canEdit} />
                         <DocumentsSection 
                            cat={cat} 
                            canEdit={canEdit} 
                            onAddClick={() => { setDocFilesToUpload([]); setIsAddDocModalOpen(true); }} 
                            onScanClick={() => setIsScanModalOpen(true)}
                            onDocumentClick={setViewingDoc}
                            onDataChange={onDataChange}
                            onSingleDelete={handleDeleteSingleDocument}
                        />
                    </div>
                    
                    {/* Правая колонка (Процедуры) */}
                    <div className="lg:col-span-8">
                        <TreatmentsSection 
                            cat={cat} 
                            canEdit={canEdit} 
                            onAddClick={() => { 
                                setTreatmentForm({
                                    type: TreatmentType.WORMS, 
                                    date: new Date().toISOString().split('T')[0], 
                                    productName: '', 
                                    vaccinationStage: 'first'
                                }); 
                                setIsAddTreatmentModalOpen(true); 
                            }} 
                            onDeleteClick={handleDeleteTreatment} 
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}