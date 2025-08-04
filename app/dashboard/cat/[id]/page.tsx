// app/dashboard/cat/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Cat, Role, AuditLog as AuditLogType } from "@/types";
import Spinner from "@/app/components/ui/Spinner";
import { ArrowLeft, GalleryHorizontal } from "lucide-react";
import Link from "next/link";
import CatProfileView from "./CatProfileView";
import PhotoGallery from "./PhotoGallery";
import { motion, AnimatePresence } from 'framer-motion';

export default function CatProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession({ required: true, onUnauthenticated() { router.push('/login'); } });

    const [cat, setCat] = useState<Cat | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState<'profile' | 'gallery'>('profile');

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
    
    if (isLoading || status === 'loading' || !cat) {
        return <div className="h-screen flex justify-center items-center"><Spinner /></div>;
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
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
                    {/* === ИЗМЕНЕНИЕ ЗДЕСЬ: Добавлен класс overscroll-x-contain === */}
                    <motion.div
                        key={currentView}
                        className="overscroll-x-contain" // Этот класс запретит браузеру перехватывать свайп
                        custom={currentView === 'profile' ? 1 : -1}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = Math.abs(offset.x) * velocity.x;
                            if (swipe < -10000) {
                                handleSwipe('left'); // swipe left
                            } else if (swipe > 10000) {
                                handleSwipe('right'); // swipe right
                            }
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
        </div>
    );
}