"use client";

import { useEffect, useState, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Cat, Role, AuditLog as AuditLogType } from "@/types";
import { ArrowLeft, GalleryHorizontal, FileDown, UserRound, Loader2 } from "lucide-react";
import Link from "next/link";
import CatProfileView from "./CatProfileView";
import PhotoGallery from "./PhotoGallery";
import Skeleton from "@/app/components/ui/Skeleton";
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
    // Направление перехода: +1 — вперёд (к галерее), -1 — назад (к профилю)
    const [swipeDir, setSwipeDir] = useState(1);

    const goToView = (view: 'profile' | 'gallery') => {
        if (view === currentView) return;
        setSwipeDir(view === 'gallery' ? 1 : -1);
        setCurrentView(view);
    };

    // Детект свайпа сырыми pointer-событиями (framer-drag конфликтует с exit
    // внутри AnimatePresence). Жест лишь запускает переход с глубиной.
    const swipeStart = useRef<{ x: number; y: number } | null>(null);
    const onSwipePointerDown = (e: ReactPointerEvent) => {
        // Не перехватываем жест, начатый на интерактивных элементах
        // (textarea/input/кнопки) — иначе выделение текста ловится как свайп.
        const el = e.target as HTMLElement;
        if (el.closest('textarea, input, select, button, a, label, [contenteditable="true"], [data-no-swipe]')) {
            swipeStart.current = null;
            return;
        }
        swipeStart.current = { x: e.clientX, y: e.clientY };
    };
    const onSwipePointerUp = (e: ReactPointerEvent) => {
        if (!swipeStart.current) return;
        const dx = e.clientX - swipeStart.current.x;
        const dy = e.clientY - swipeStart.current.y;
        swipeStart.current = null;
        if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            goToView(dx < 0 ? 'gallery' : 'profile');
        }
    };

    // Переход "как достал другой файл из архива": уходящая страница уезжает
    // в сторону и вглубь с затуханием, входящая выходит вперёд.
    const swipeVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? '55%' : '-55%', scale: 0.9, opacity: 0 }),
        center: { x: '0%', scale: 1, opacity: 1, rotateY: 0 },
        exit: (dir: number) => ({
            x: dir > 0 ? '-30%' : '30%',
            scale: 0.82,
            opacity: 0,
            rotateY: dir > 0 ? 6 : -6,
        }),
    };

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
        return (
            <div className="min-h-screen pb-20">
                <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-white/50 shadow-sm">
                    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                        <Skeleton className="h-10 w-10 sm:w-24" rounded="rounded-xl" />
                        <Skeleton className="h-10 w-44" rounded="rounded-xl" />
                        <Skeleton className="h-10 w-10 sm:w-24" rounded="rounded-xl" />
                    </div>
                </header>
                <main className="container mx-auto pt-6 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Шапка профиля */}
                        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-lg p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:items-center">
                            <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 mx-auto sm:mx-0" rounded="rounded-[2rem]" />
                            <div className="flex-1 space-y-4 flex flex-col items-center sm:items-start">
                                <Skeleton className="h-10 w-2/3 max-w-xs" rounded="rounded-xl" />
                                <div className="flex gap-3">
                                    <Skeleton className="h-8 w-24" rounded="rounded-xl" />
                                    <Skeleton className="h-8 w-32" rounded="rounded-xl" />
                                </div>
                            </div>
                        </div>
                        {/* Контент */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                <Skeleton className="h-44 w-full" rounded="rounded-3xl" />
                                <Skeleton className="h-60 w-full" rounded="rounded-3xl" />
                            </div>
                            <div className="lg:col-span-8">
                                <Skeleton className="h-96 w-full" rounded="rounded-3xl" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

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
                            btn-spring active:scale-95 shadow-sm
                        "
                        aria-label="Назад"
                    >
                      <ArrowLeft size={18} />
                      <span className="hidden sm:inline">Назад</span>
                    </Link>
                    
                    <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50 backdrop-blur-md">
                        <button
                            onClick={() => goToView('profile')}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold btn-spring active:scale-95
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
                            onClick={() => goToView('gallery')}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold btn-spring active:scale-95
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
                        btn-spring active:scale-95 shadow-sm
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

            {/* --- ОСНОВНОЙ КОНТЕНТ С ПЕРЕХОДОМ «АРХИВ» (уход вглубь) --- */}
            <main className="container mx-auto pt-6 px-4 sm:px-6 overflow-x-clip">
                <div
                    className="overflow-x-clip overflow-y-visible"
                    style={{ touchAction: 'pan-y', perspective: '1600px', overflowClipMargin: '30px' }}
                    onPointerDown={onSwipePointerDown}
                    onPointerUp={onSwipePointerUp}
                >
                    <AnimatePresence initial={false} mode="popLayout" custom={swipeDir}>
                        <motion.div
                            key={currentView}
                            className="w-full"
                            custom={swipeDir}
                            variants={swipeVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
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
                </div>
            </main>

             {/* --- СКРЫТЫЙ ШАБЛОН ДЛЯ ГЕНЕРАЦИИ PDF --- */}
             {/* Он рендерится за пределами экрана, чтобы html2canvas мог его "сфоткать" */}
             <div className="absolute left-[-9999px] top-[-9999px]">
                <CatReportTemplate ref={reportRef} cat={cat} />
            </div>
        </div>
    );
}