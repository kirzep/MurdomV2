// app/dashboard/cat/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react"; // Добавили useRef
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Cat, Role, AuditLog as AuditLogType } from "@/types";
import Spinner from "@/app/components/ui/Spinner";
import { ArrowLeft, GalleryHorizontal, FileDown } from "lucide-react"; // Добавили FileDown
import Link from "next/link";
import CatProfileView from "./CatProfileView";
import PhotoGallery from "./PhotoGallery";
import { motion, AnimatePresence } from 'framer-motion';
import { CatReportTemplate } from "./CatReportTemplate"; // Импортируем шаблон
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CatProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession({ required: true, onUnauthenticated() { router.push('/login'); } });

    const [cat, setCat] = useState<Cat | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState<'profile' | 'gallery'>('profile');

    // === ПЕРЕНЕСЕННАЯ ЛОГИКА ЭКСПОРТА ===
    const reportRef = useRef<HTMLDivElement>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    
    const canEdit = session?.user.role === Role.MEDICAL_STAFF || session?.user.role === Role.TRUSTED_PERSON || session?.user.role === Role.DEVELOPER;

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

    const handleSwipe = (direction: 'left' | 'right') => {
        if (direction === 'left' && currentView === 'profile') {
            setCurrentView('gallery');
        } else if (direction === 'right' && currentView === 'gallery') {
            setCurrentView('profile');
        }
    };
    
    // === ПЕРЕНЕСЕННАЯ ЛОГИКА ЭКСПОРТА ===
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

    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 })
    };

    return (
        <div className="min-h-screen">
            <header className="bg-brand-surface/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
              <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link 
                        href="/dashboard" 
                        className="inline-flex items-center justify-center gap-2 h-11 w-11 sm:w-auto sm:px-4 rounded-full sm:rounded-lg font-semibold transition-colors bg-brand-secondary text-brand-text-primary hover:bg-brand-border"
                        aria-label="Назад к списку"
                    >
                      <ArrowLeft size={20} />
                      <span className="hidden sm:inline">Назад к списку</span>
                    </Link>
                    
                    {/* === КНОПКА ЭКСПОРТА С ПРИВЯЗАННОЙ ЛОГИКОЙ === */}
                    <button 
                      onClick={handleExportReport}
                      disabled={isGeneratingReport}
                      className="inline-flex items-center justify-center gap-2 h-11 w-11 sm:w-auto sm:px-4 rounded-full sm:rounded-lg font-semibold transition-colors bg-brand-secondary text-brand-text-primary hover:bg-brand-border disabled:opacity-50"
                      aria-label="Экспорт в PDF"
                    >
                      {isGeneratingReport ? <Spinner/> : <FileDown size={20} />}
                      <span className="hidden sm:inline">Экспорт в PDF</span>
                    </button>

                    <button 
                      onClick={() => setCurrentView(currentView === 'profile' ? 'gallery' : 'profile')}
                      className="inline-flex items-center justify-center gap-2 h-11 w-11 sm:w-auto sm:px-4 rounded-full sm:rounded-lg font-semibold transition-colors bg-brand-secondary text-brand-text-primary hover:bg-brand-border"
                      aria-label="Переключить вид"
                    >
                      <GalleryHorizontal size={20} />
                       <span className="hidden sm:inline">{currentView === 'profile' ? 'Галерея' : 'Профиль'}</span>
                    </button>
              </div>
            </header>
            <main className="container mx-auto overflow-x-hidden">
                 <AnimatePresence initial={false} custom={currentView === 'profile' ? 1 : -1}>
                    <motion.div
                        key={currentView}
                        className="overscroll-x-contain"
                        custom={currentView === 'profile' ? 1 : -1}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = Math.abs(offset.x) * velocity.x;
                            if (swipe < -10000) handleSwipe('left');
                            else if (swipe > 10000) handleSwipe('right');
                        }}
                    >
                        {currentView === 'profile' ? (
                            <CatProfileView cat={cat} auditLogs={auditLogs} canEdit={canEdit} onDataChange={fetchCatDataAndLogs} />
                        ) : (
                            <PhotoGallery cat={cat} canEdit={canEdit} onDataChange={fetchCatDataAndLogs} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
             {/* === СКРЫТЫЙ ШАБЛОН ДЛЯ PDF === */}
             <div className="absolute left-[-9999px] top-[-9999px]">
                <CatReportTemplate ref={reportRef} cat={cat} />
            </div>
        </div>
    );
}