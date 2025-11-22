"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Cat, Role, AuditLog as AuditLogType } from "@/types";
import Spinner from "@/app/components/ui/Spinner";
import { ArrowLeft, GalleryHorizontal, FileDown, UserRound, Loader2 } from "lucide-react";
import Link from "next/link";
import CatProfileView from "./CatProfileView";
import PhotoGallery from "./PhotoGallery";
import { motion, AnimatePresence } from 'framer-motion';
import { CatReportTemplate } from "./CatReportTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CatProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession({ 
        required: true, 
        onUnauthenticated() { router.push('/login'); } 
    });

    const [cat, setCat] = useState<Cat | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState<'profile' | 'gallery'>('profile');

    // Логика экспорта PDF
    const reportRef = useRef<HTMLDivElement>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    
    const canEdit = session?.user.role !== Role.VOLUNTEER;

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
    }, [id, status]); // убрал router из зависимостей, чтобы не было лишних ререндеров

    const handleSwipe = (direction: 'left' | 'right') => {
        if (direction === 'left' && currentView === 'profile') {
            setCurrentView('gallery');
        } else if (direction === 'right' && currentView === 'gallery') {
            setCurrentView('profile');
        }
    };
    
    const handleExportReport = async () => {
        if (!reportRef.current || !cat) return;
        setIsGeneratingReport(true);
        
        try {
            // 1. Скриншотим шаблон отчета
            const canvas = await html2canvas(reportRef.current, { 
                scale: 2, 
                useCORS: true,
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // 2. Создаем PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Добавляем первую страницу (шаблон)
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            
            // 3. Добавляем страницы с прикрепленными изображениями (если есть)
            // Фильтруем только картинки из документов
            const imageDocs = cat.documents?.filter(doc => doc.fileType.startsWith('image/')) || [];
            
            for (const doc of imageDocs) {
                pdf.addPage();
                
                // Заголовок страницы
                pdf.setFontSize(12);
                pdf.setTextColor(100);
                pdf.text(`Приложение: ${doc.fileName}`, 15, 20);
                
                // Загружаем изображение
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = `${process.env.NEXT_PUBLIC_APP_URL || ''}${doc.filePath}`;
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                
                // Расчет размеров для вписывания в страницу
                const margin = 15;
                const pageContentWidth = pdfWidth - margin * 2;
                const pageContentHeight = pdfHeight - 40; // минус хедер и футер
                
                const imgWidth = img.naturalWidth;
                const imgHeight = img.naturalHeight;
                const ratio = imgWidth / imgHeight;
                
                let newWidth = pageContentWidth;
                let newHeight = newWidth / ratio;
                
                if (newHeight > pageContentHeight) {
                    newHeight = pageContentHeight;
                    newWidth = newHeight * ratio;
                }
                
                // Центрируем
                const x = (pdfWidth - newWidth) / 2;
                const y = 30;
                
                pdf.addImage(img, 'JPEG', x, y, newWidth, newHeight, undefined, 'FAST');
            }
            
            // 4. Сохраняем
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
        enter: (direction: number) => ({ 
            x: direction > 0 ? '100%' : '-100%', 
            opacity: 0,
            scale: 0.9
        }),
        center: { 
            zIndex: 1, 
            x: 0, 
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({ 
            zIndex: 0, 
            x: direction < 0 ? '100%' : '-100%', 
            opacity: 0,
            scale: 0.9
        })
    };

    return (
        <div className="min-h-screen pb-20">
            {/* --- ШАПКА НАВИГАЦИИ --- */}
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-white/50 shadow-sm">
              <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link 
                        href="/dashboard" 
                        className="
                            inline-flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-4 rounded-xl 
                            bg-white border border-gray-200 text-gray-600 font-bold text-sm
                            hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800
                            transition-all active:scale-95 shadow-sm
                        "
                        aria-label="Назад"
                    >
                      <ArrowLeft size={18} />
                      <span className="hidden sm:inline">Назад</span>
                    </Link>
                    
                    <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50 backdrop-blur-md">
                        <button 
                            onClick={() => setCurrentView('profile')}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all
                                ${currentView === 'profile' 
                                    ? 'bg-white text-brand-primary shadow-sm ring-1 ring-black/5' 
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                                }
                            `}
                        >
                            <UserRound size={16} />
                            <span className="hidden sm:inline">Профиль</span>
                        </button>
                        <button 
                            onClick={() => setCurrentView('gallery')}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all
                                ${currentView === 'gallery' 
                                    ? 'bg-white text-purple-600 shadow-sm ring-1 ring-black/5' 
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                                }
                            `}
                        >
                            <GalleryHorizontal size={16} />
                            <span className="hidden sm:inline">Галерея</span>
                        </button>
                    </div>

                    <button 
                      onClick={handleExportReport}
                      disabled={isGeneratingReport}
                      className="
                        inline-flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-4 rounded-xl 
                        bg-white border border-gray-200 text-gray-600 font-bold text-sm
                        hover:bg-gray-50 hover:border-gray-300 hover:text-brand-primary
                        transition-all active:scale-95 shadow-sm
                        disabled:opacity-50 disabled:cursor-not-allowed
                      "
                      aria-label="PDF"
                      title="Экспорт в PDF"
                    >
                      {isGeneratingReport ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
                      <span className="hidden sm:inline">Экспорт</span>
                    </button>
              </div>
            </header>

            {/* --- ОСНОВНОЙ КОНТЕНТ С АНИМАЦИЕЙ СВАЙПА --- */}
            <main className="container mx-auto pt-6 px-4 sm:px-6 overflow-x-hidden">
                 <AnimatePresence initial={false} custom={currentView === 'profile' ? 1 : -1} mode="wait">
                    <motion.div
                        key={currentView}
                        className="w-full"
                        custom={currentView === 'profile' ? 1 : -1}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        // Добавляем поддержку свайпа на мобильных
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
                            <CatProfileView 
                                cat={cat} 
                                auditLogs={auditLogs} 
                                canEdit={canEdit} 
                                onDataChange={fetchCatDataAndLogs} 
                            />
                        ) : (
                            <PhotoGallery 
                                cat={cat} 
                                canEdit={canEdit} 
                                onDataChange={fetchCatDataAndLogs} 
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

             {/* --- СКРЫТЫЙ ШАБЛОН ДЛЯ ГЕНЕРАЦИИ PDF --- */}
             {/* Он рендерится за пределами экрана, чтобы html2canvas мог его "сфоткать" */}
             <div className="absolute left-[-9999px] top-[-9999px]">
                <CatReportTemplate ref={reportRef} cat={cat} />
            </div>
        </div>
    );
}