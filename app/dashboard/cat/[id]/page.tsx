"use client";

import { useEffect, useState, FormEvent, ChangeEvent, useRef } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Cat, Role, Document as DocType, TreatmentType, AuditLog as AuditLogType } from "@/types";
import Spinner from "@/app/components/ui/Spinner";
import CatProfileHeader from "./CatProfileHeader";
import { ArrowLeft, FileDown, FileUp } from "lucide-react";
import Link from "next/link";
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

export default function CatProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession({ required: true, onUnauthenticated() { router.push('/login'); } });

    const [cat, setCat] = useState<Cat | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const reportRef = useRef<HTMLDivElement>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    
    const canEdit = session?.user.role === Role.MEDICAL_STAFF || session?.user.role === Role.TRUSTED_PERSON || session?.user.role === Role.DEVELOPER;
    
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

    const fetchCatDataAndLogs = async () => {
        if (!id) return;
        try {
            const [catRes, logRes] = await Promise.all([
                fetch(`/api/cats/${id}`),
                fetch(`/api/cats/${id}/audit`),
            ]);
            if (!catRes.ok) throw new Error("Cat not found");
            const catData = await catRes.json();
            const logData = await logRes.json();
            setCat(catData);
            setAuditLogs(logData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            router.push('/dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            setIsLoading(true);
            fetchCatDataAndLogs();
        }
    }, [id, status, router]);

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
        if (!id) return;
        try {
            await fetch(`/api/cats/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            await fetchCatDataAndLogs();
        } catch (error) {
            console.error("Failed to update notes:", error);
        }
    };

    const handleDeleteCat = async () => {
        if (!cat) return;
        if (window.confirm(`Вы уверены, что хотите удалить профиль кошки "${cat.name}"? Это действие необратимо.`)) {
            try {
                await fetch(`/api/cats/${id}`, { method: 'DELETE' });
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
            await fetch(`/api/cats/${id}/treatments?treatmentId=${treatmentId}`, { method: 'DELETE' });
            await fetchCatDataAndLogs();
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
            await fetch(`/api/cats/${id}/treatments`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            setIsAddTreatmentModalOpen(false);
            await fetchCatDataAndLogs();
        } catch (error) {
            console.error("Error adding treatment:", error);
        } finally {
            setIsFormLoading(false);
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот документ?')) {
            await fetch(`/api/cats/${id}/documents?documentId=${docId}`, { method: 'DELETE' });
            setViewingDoc(null);
            await fetchCatDataAndLogs();
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
            await fetch(`/api/cats/${id}/documents`, {
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
            await fetchCatDataAndLogs();
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
        if (!reportRef.current || !cat) return;
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
    
    if (isLoading || status === 'loading' || !cat) {
        return <div className="h-screen flex justify-center items-center"><Spinner /></div>;
    }

    return (
        <>
            <ScanDocumentModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} onScanComplete={handleScanComplete} />
            <DocumentViewerModal 
                doc={viewingDoc} 
                onClose={() => setViewingDoc(null)} 
                canEdit={canEdit} 
                onDelete={() => viewingDoc && handleDeleteDocument(viewingDoc.id)}
            />
            <AuditLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} logs={auditLogs} catCreator={cat?.creator} catCreatedAt={cat?.createdAt} />
            
            {canEdit && cat && (
                <EditCatModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onCatUpdated={fetchCatDataAndLogs} cat={cat} />
            )}
            {canEdit && (
                <Modal isOpen={isAddTreatmentModalOpen} onClose={() => setIsAddTreatmentModalOpen(false)} title="Добавить запись об обработке">
                    <form onSubmit={handleAddTreatment} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-text-secondary mb-1">Тип обработки</label>
                            <select value={treatmentForm.type} onChange={e => setTreatmentForm({...treatmentForm, type: e.target.value as TreatmentType})} className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary">
                                {Object.entries(treatmentMeta).map(([key, {name}]) => <option key={key} value={key} className="capitalize">{name}</option>)}
                            </select>
                        </div>
                        
                        {treatmentForm.type === TreatmentType.VACCINATION && (
                            <div>
                                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Этап вакцинации</label>
                                <select 
                                    value={treatmentForm.vaccinationStage} 
                                    onChange={e => setTreatmentForm({...treatmentForm, vaccinationStage: e.target.value})}
                                    className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary"
                                >
                                    <option value="first">Первая</option>
                                    <option value="second">Вторая</option>
                                    <option value="revaccination">Ревакцинация</option>
                                </select>
                            </div>
                        )}

                        <div>
                           <label className="block text-sm font-medium text-brand-text-secondary mb-1">Дата</label>
                           <Input type="date" value={treatmentForm.date} onChange={e => setTreatmentForm({...treatmentForm, date: e.target.value})} required/>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-brand-text-secondary mb-1">Название препарата/вакцины</label>
                           <Input placeholder="Название..." value={treatmentForm.productName} onChange={e => setTreatmentForm({...treatmentForm, productName: e.target.value})} required/>
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
                                        <label className="text-xs text-brand-text-secondary block mb-1">{docState.file.name}</label>
                                        <Input 
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
            
            <div className="min-h-screen">
                <header className="bg-brand-surface/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
                  <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                      <Link href="/dashboard" className="flex items-center gap-2 text-brand-primary hover:underline font-semibold">
                          <ArrowLeft size={18} />
                          Назад к списку
                      </Link>
                      <Button onClick={handleExportReport} isLoading={isGeneratingReport}>
                        <FileDown size={20} className="mr-2"/>
                        Экспорт в PDF
                      </Button>
                  </div>
                </header>
                <main className="container mx-auto p-4 md:p-6 space-y-6">
                    <CatProfileHeader cat={cat} canEdit={canEdit} onEdit={() => setIsEditModalOpen(true)} onDelete={handleDeleteCat} onInfoClick={() => setIsLogModalOpen(true)} />
                    <div className="grid grid-cols-1 gap-6">
                        <NotesSection cat={cat} onUpdate={handleNotesUpdate} canEdit={canEdit} />
                        <TreatmentsSection cat={cat} canEdit={canEdit} onAddClick={() => { setTreatmentForm({type: TreatmentType.WORMS, date: new Date().toISOString().split('T')[0], productName: '', vaccinationStage: 'first'}); setIsAddTreatmentModalOpen(true); }} onDeleteClick={handleDeleteTreatment} />
                        <DocumentsSection 
                            cat={cat} 
                            canEdit={canEdit} 
                            onAddClick={() => { setDocFilesToUpload([]); setIsAddDocModalOpen(true); }} 
                            onScanClick={() => setIsScanModalOpen(true)}
                            onDocumentClick={setViewingDoc}
                            onDeleteClick={handleDeleteDocument}
                        />
                    </div>
                </main>
            </div>
            
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <CatReportTemplate ref={reportRef} cat={cat} />
            </div>
        </>
    );
}