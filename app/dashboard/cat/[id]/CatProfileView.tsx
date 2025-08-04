// app/dashboard/cat/[id]/CatProfileView.tsx
"use client";

import { useState, FormEvent, ChangeEvent, useRef } from "react";
import { Cat, Role, Document as DocType, TreatmentType, AuditLog as AuditLogType, CatStatus } from "@/types";
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
import { CatReportTemplate } from "./CatReportTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FileUp } from "lucide-react";
import { useRouter } from "next/navigation";


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
    const reportRef = useRef<HTMLDivElement>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    
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
    
    const handleStatusChange = async (newStatus: CatStatus) => {
        try {
            await fetch(`/api/cats/${cat.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            onDataChange();
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Не удалось изменить статус.");
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

    const handleExportReport = async () => {
        if (!reportRef.current) return;
        setIsGeneratingReport(true);
        try {
            const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            const imageDocs = cat.documents?.filter(doc => doc.fileType.startsWith('image/')) || [];
            for (const doc of imageDocs) {
                pdf.addPage();
                pdf.setFontSize(16);
                pdf.setTextColor(100);
                pdf.text(doc.fileName, 15, 20, { maxWidth: pdfWidth - 30 });
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = `${process.env.NEXT_PUBLIC_APP_URL || ''}${doc.filePath}`;
                await new Promise(resolve => { img.onload = resolve; });
                const margin = 15;
                const pageContentHeight = pdfHeight - 40;
                const imgWidth = img.naturalWidth;
                const imgHeight = img.naturalHeight;
                const ratio = imgWidth / imgHeight;
                let newWidth = pdfWidth - margin * 2;
                let newHeight = newWidth / ratio;
                if (newHeight > pageContentHeight) {
                    newHeight = pageContentHeight;
                    newWidth = newHeight * ratio;
                }
                const x = (pdfWidth - newWidth) / 2;
                const y = 30;
                pdf.addImage(img, 'JPEG', x, y, newWidth, newHeight, undefined, 'FAST');
            }
            pdf.save(`Карта - ${cat.name}.pdf`);
        } catch (error) {
            console.error("Ошибка при создании PDF:", error);
            alert("Не удалось создать отчет. Попробуйте снова.");
        } finally {
            setIsGeneratingReport(false);
        }
    };

    return (
        <>
            {/* All modals remain here */}
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
                <Modal isOpen={isAddTreatmentModalOpen} onClose={() => setIsAddTreatmentModalOpen(false)} title="Добавить запись об обработке">
                    <form onSubmit={handleAddTreatment} className="space-y-4">
                        <div>
                            <label htmlFor="treatmentType" className="block text-sm font-medium text-brand-text-secondary mb-1">Тип обработки</label>
                            <select id="treatmentType" value={treatmentForm.type} onChange={e => setTreatmentForm({...treatmentForm, type: e.target.value as TreatmentType})} className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary">
                                {Object.entries(treatmentMeta).map(([key, {name}]) => <option key={key} value={key} className="capitalize">{name}</option>)}
                            </select>
                        </div>
                        
                        {treatmentForm.type === TreatmentType.VACCINATION && (
                            <div>
                                <label htmlFor="vaccinationStage" className="block text-sm font-medium text-brand-text-secondary mb-1">Этап вакцинации</label>
                                <select 
                                    id="vaccinationStage"
                                    value={treatmentForm.vaccinationStage} 
                                    onChange={e => setTreatmentForm({...treatmentForm, vaccinationStage: e.target.value})}
                                    className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary"
                                >
                                    <option value="first">Первичная вакцинация</option>
                                    <option value="second">Ревакцинация</option>
                                    <option value="revaccination">Ежегодная вакцинация</option>
                                </select>
                            </div>
                        )}

                        <div>
                           <label htmlFor="treatmentDate" className="block text-sm font-medium text-brand-text-secondary mb-1">Дата</label>
                           <Input id="treatmentDate" type="date" value={treatmentForm.date} onChange={e => setTreatmentForm({...treatmentForm, date: e.target.value})} required/>
                        </div>

                        <div>
                           <label htmlFor="productName" className="block text-sm font-medium text-brand-text-secondary mb-1">Название препарата/вакцины</label>
                           <Input id="productName" placeholder="Название..." value={treatmentForm.productName} onChange={e => setTreatmentForm({...treatmentForm, productName: e.target.value})} required/>
                        </div>

                        <Button type="submit" isLoading={isFormLoading} className="w-full">Добавить запись</Button>
                    </form>
                </Modal>
            )}
            {canEdit && (
                <Modal isOpen={isAddDocModalOpen} onClose={() => {setDocFilesToUpload([]); setIsAddDocModalOpen(false);}} title="Загрузка документов">
                     <form onSubmit={handleAddDocument} className="space-y-4">
                        <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-border rounded-lg cursor-pointer hover:bg-brand-background">
                            <FileUp className="w-10 h-10 text-brand-text-secondary mb-2" />
                            <span className="font-semibold text-brand-primary">Выберите файлы</span>
                            <span className="text-sm text-brand-text-secondary">или перетащите их сюда</span>
                        </label>
                        <input id="file-upload" type="file" multiple onChange={handleDocFilesChange} className="hidden"/>
                        
                        {docFilesToUpload.length > 0 && (
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                {docFilesToUpload.map((docState) => (
                                    <div key={docState.id}>
                                        <label htmlFor={`docName-${docState.id}`} className="text-xs text-brand-text-secondary block mb-1">{docState.file.name}</label>
                                        <Input 
                                            id={`docName-${docState.id}`}
                                            value={docState.customName} 
                                            onChange={e => handleSingleDocNameChange(docState.id, e.target.value)} 
                                            placeholder="Название документа*" 
                                            required 
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        <Button type="submit" isLoading={isFormLoading} disabled={docFilesToUpload.length === 0} className="w-full">
                            Загрузить ({docFilesToUpload.length})
                        </Button>
                    </form>
                </Modal>
            )}

            <div className="p-4 md:p-6 space-y-6">
                 <CatProfileHeader
                    cat={cat}
                    canEdit={canEdit}
                    onEdit={() => setIsEditModalOpen(true)}
                    onDelete={handleDeleteCat}
                    onInfoClick={() => setIsLogModalOpen(true)}
                    onStatusChange={handleStatusChange}
                />
                <div className="grid grid-cols-1 gap-6">
                    <NotesSection cat={cat} onUpdate={handleNotesUpdate} canEdit={canEdit} />
                    <TreatmentsSection cat={cat} canEdit={canEdit} onAddClick={() => { setTreatmentForm({type: TreatmentType.WORMS, date: new Date().toISOString().split('T')[0], productName: '', vaccinationStage: 'first'}); setIsAddTreatmentModalOpen(true); }} onDeleteClick={handleDeleteTreatment} />
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
            </div>
            
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <CatReportTemplate ref={reportRef} cat={cat} />
            </div>
        </>
    );
}