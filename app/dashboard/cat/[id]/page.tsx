// app/dashboard/cat/[id]/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Cat, Role, Document as DocType, TreatmentType, AuditLog as AuditLogType } from "@/types";
import Spinner from "@/app/components/ui/Spinner";
import CatProfileHeader from "./CatProfileHeader";
import { ArrowLeft } from "lucide-react";
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

const treatmentMeta = {
  [TreatmentType.WORMS]: { name: 'от глистов' },
  [TreatmentType.FLEAS]: { name: 'от блох' },
  [TreatmentType.EAR_MITES]: { name: 'от ушных клещей' },
  [TreatmentType.VACCINATION]: { name: 'вакцинация' },
};

export default function CatProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession({ required: true, onUnauthenticated() { router.push('/login'); } });

    const [cat, setCat] = useState<Cat | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // ИСПРАВЛЕНИЕ: Добавляем роль DEVELOPER в проверку прав
    const canEdit = 
        session?.user.role === Role.MEDICAL_STAFF || 
        session?.user.role === Role.TRUSTED_PERSON ||
        session?.user.role === Role.DEVELOPER;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddTreatmentModalOpen, setIsAddTreatmentModalOpen] = useState(false);
    const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
    const [viewingDoc, setViewingDoc] = useState<DocType | null>(null);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    
    const [treatmentForm, setTreatmentForm] = useState({ type: TreatmentType.WORMS, date: '', productName: '' });
    const [docForm, setDocForm] = useState({ file: null as File | null, customFileName: '' });
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
    }, [id, status]);
    
    useEffect(() => {
        if (docForm.file) {
            setDocForm(prevForm => ({ ...prevForm, customFileName: prevForm.file!.name.substring(0, prevForm.file!.name.lastIndexOf('.')) || prevForm.file!.name }));
        }
    }, [docForm.file]);

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
        if (confirm(`Вы уверены, что хотите удалить профиль кошки "${cat.name}"? Это действие необратимо.`)) {
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
        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
            await fetch(`/api/cats/${id}/treatments?treatmentId=${treatmentId}`, { method: 'DELETE' });
            await fetchCatDataAndLogs();
        }
    };
    
    const handleAddTreatment = async (e: FormEvent) => {
        e.preventDefault();
        setIsFormLoading(true);
        await fetch(`/api/cats/${id}/treatments`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(treatmentForm),
        });
        setIsFormLoading(false);
        setIsAddTreatmentModalOpen(false);
        await fetchCatDataAndLogs();
    };

    const handleDeleteDocument = async (docId: string) => {
        if (confirm('Вы уверены, что хотите удалить этот документ?')) {
            await fetch(`/api/cats/${id}/documents?documentId=${docId}`, { method: 'DELETE' });
            setViewingDoc(null);
            await fetchCatDataAndLogs();
        }
    };

    const handleAddDocument = async (e: FormEvent) => {
        e.preventDefault();
        if (!docForm.file || !docForm.customFileName.trim()) return;
        setIsFormLoading(true);
        const formData = new FormData();
        formData.append('file', docForm.file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) { alert('Ошибка загрузки файла'); setIsFormLoading(false); return; }
        await fetch(`/api/cats/${id}/documents`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...uploadData, fileName: docForm.customFileName.trim() }),
        });
        setIsFormLoading(false);
        setIsAddDocModalOpen(false);
        await fetchCatDataAndLogs();
    };
    
    if (isLoading || status === 'loading' || !cat) {
        return <div className="h-screen flex justify-center items-center"><Spinner /></div>;
    }

    return (
        <>
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
                        <select value={treatmentForm.type} onChange={e => setTreatmentForm({...treatmentForm, type: e.target.value as TreatmentType})} className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary">
                            {Object.entries(treatmentMeta).map(([key, {name}]) => <option key={key} value={key} className="capitalize">{name}</option>)}
                        </select>
                        <Input type="date" value={treatmentForm.date} onChange={e => setTreatmentForm({...treatmentForm, date: e.target.value})} required/>
                        <Input placeholder="Название препарата/вакцины" value={treatmentForm.productName} onChange={e => setTreatmentForm({...treatmentForm, productName: e.target.value})} required/>
                        <Button type="submit" isLoading={isFormLoading} className="w-full">Добавить запись</Button>
                    </form>
                </Modal>
            )}
            {canEdit && (
                <Modal isOpen={isAddDocModalOpen} onClose={() => setIsAddDocModalOpen(false)} title="Загрузить документ">
                     <form onSubmit={handleAddDocument} className="space-y-4">
                        <input type="file" onChange={(e) => setDocForm({...docForm, file: e.target.files ? e.target.files[0] : null})} className="w-full text-sm text-brand-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary-light file:text-brand-primary hover:file:bg-brand-primary-light/80 cursor-pointer"/>
                        {docForm.file && (
                            <Input value={docForm.customFileName} onChange={e => setDocForm({...docForm, customFileName: e.target.value})} placeholder="Название документа*" required />
                        )}
                        <Button type="submit" isLoading={isFormLoading} disabled={!docForm.file || !docForm.customFileName.trim()} className="w-full">Загрузить</Button>
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
                  </div>
                </header>
                <main className="container mx-auto p-4 md:p-6 space-y-6">
                    <CatProfileHeader cat={cat} canEdit={canEdit} onEdit={() => setIsEditModalOpen(true)} onDelete={handleDeleteCat} onInfoClick={() => setIsLogModalOpen(true)} />
                    <div className="grid grid-cols-1 gap-6">
                        <NotesSection cat={cat} onUpdate={handleNotesUpdate} canEdit={canEdit} />
                        <TreatmentsSection cat={cat} canEdit={canEdit} onAddClick={() => { setTreatmentForm({type: TreatmentType.WORMS, date: new Date().toISOString().split('T')[0], productName: ''}); setIsAddTreatmentModalOpen(true); }} onDeleteClick={handleDeleteTreatment} />
                        <DocumentsSection 
                            cat={cat} 
                            canEdit={canEdit} 
                            onAddClick={() => { setDocForm({file: null, customFileName: ''}); setIsAddDocModalOpen(true); }} 
                            onDocumentClick={setViewingDoc}
                        />
                    </div>
                </main>
            </div>
        </>
    );
}
