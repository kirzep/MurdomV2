// app/dashboard/cat/[id]/PhotoGallery.tsx
"use client";

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Cat } from '@/types';
import Spinner from '@/app/components/ui/Spinner';
import Button from '@/app/components/ui/Button';
import { Upload, Trash2, Download, Star, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from '@/app/components/ui/Portal';
import useLongPress from '@/hooks/useLongPress';

interface Photo {
    id: string;
    filePath: string;
    isAvatar: boolean;
}

interface PhotoGalleryProps {
    cat: Cat;
    canEdit: boolean;
    onDataChange: () => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ cat, canEdit, onDataChange }) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    const fetchPhotos = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/cats/${cat.id}/photos`);
            const data = await res.json();
            setPhotos(data);
        } catch (error) {
            console.error("Failed to fetch photos:", error);
        } finally {
            setIsLoading(false);
        }
    }, [cat.id]);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    useEffect(() => {
        if (isSelectionMode && selectedPhotos.length === 0) {
            setIsSelectionMode(false);
        }
    }, [selectedPhotos, isSelectionMode]);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setIsUploading(true);
        const files = Array.from(e.target.files);
        const uploadPromises = files.map(file => {
            const formData = new FormData();
            formData.append('file', file);
            return fetch('/api/upload', { method: 'POST', body: formData }).then(res => res.json());
        });
        try {
            const uploadResults = await Promise.all(uploadPromises);
            const filePaths = uploadResults.map(result => result.filePath).filter(Boolean);
            if (filePaths.length > 0) {
                 await fetch(`/api/cats/${cat.id}/photos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filePaths }),
                });
                await fetchPhotos();
                onDataChange();
            }
        } catch (error) {
            alert(`Ошибка загрузки файлов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSetAvatar = async (photoId: string) => {
        await fetch(`/api/cats/${cat.id}/photos/${photoId}`, { method: 'PATCH' });
        await fetchPhotos();
        onDataChange();
        setViewerOpen(false);
    };
    
    const handleDelete = async (photoIds: string[]) => {
        if (confirm(`Вы уверены, что хотите удалить ${photoIds.length} фото?`)) {
            const res = await fetch(`/api/cats/${cat.id}/photos`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: photoIds }),
            });

            if (!res.ok) {
                 const { error } = await res.json();
                 alert(`Не удалось удалить: ${error}`);
            }

            setSelectedPhotos([]);
            setIsSelectionMode(false);
            await fetchPhotos();
        }
    };
    
    const handleDownload = (filePath: string) => {
        const link = document.createElement('a');
        link.href = `${appUrl}${filePath}`;
        link.download = filePath.split('/').pop() || 'photo.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadSelected = () => {
        const selectedFilePaths = photos
            .filter(p => selectedPhotos.includes(p.id))
            .map(p => p.filePath);

        selectedFilePaths.forEach((filePath, index) => {
            setTimeout(() => {
                 const link = document.createElement('a');
                 link.href = `${appUrl}${filePath}`;
                 link.download = filePath.split('/').pop() || 'photo.jpg';
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
            }, index * 300);
        });
    };
    
    const handleStartSelection = (photoId: string) => {
        if (!canEdit) return;
        setIsSelectionMode(true);
        setSelectedPhotos([photoId]);
    };

    const handleToggleSelection = (photoId: string) => {
        setSelectedPhotos(prev => 
            prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]
        );
    };
    
    if (isLoading) return <div className="h-[50vh] flex items-center justify-center"><Spinner /></div>;

    return (
        <div className="p-4 md:p-6 min-h-[50vh]">
            <AnimatePresence>
                {isSelectionMode && (
                     <motion.div
                        initial={{ y: "120%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "120%" }}
                        className="fixed bottom-24 inset-x-4 max-w-md mx-auto z-50"
                     >
                        <div className="bg-brand-surface text-brand-text-primary rounded-xl p-3 shadow-2xl flex items-center justify-between border border-brand-border">
                            <Button onClick={() => setIsSelectionMode(false)} variant="secondary" className="!p-2 !h-10 !w-10 !rounded-full">
                                <X size={24}/>
                            </Button>
                            <span className="font-semibold text-sm">Выбрано: {selectedPhotos.length}</span>
                            <div className="flex gap-2">
                                <Button onClick={handleDownloadSelected} variant="secondary" className="!rounded-full !h-10 !w-10 sm:!w-auto sm:!px-4">
                                    <Download size={24} className="sm:mr-2"/>
                                    <span className="hidden sm:inline">Скачать</span>
                                </Button>
                                <Button onClick={() => handleDelete(selectedPhotos)} variant="danger" className="!rounded-full !h-10 !w-10 sm:!w-auto sm:!px-4">
                                    <Trash2 size={24} className="sm:mr-2"/>
                                    <span className="hidden sm:inline">Удалить</span>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                 {canEdit && (
                    <label className="aspect-square bg-slate-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors text-slate-500">
                        {isUploading ? <Spinner/> : <Upload size={32}/>}
                        <span className="text-xs mt-2 font-semibold">Загрузить</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading}/>
                    </label>
                )}
                {photos.map((photo, index) => (
                    <PhotoItem
                        key={photo.id}
                        photo={photo}
                        index={index}
                        isSelected={selectedPhotos.includes(photo.id)}
                        isSelectionMode={isSelectionMode}
                        onStartSelection={handleStartSelection}
                        onToggleSelection={handleToggleSelection}
                        onOpenViewer={() => { setActiveIndex(index); setViewerOpen(true); }}
                    />
                ))}
            </div>
            
            <Portal>
                <AnimatePresence>
                {viewerOpen && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/90 z-50 flex flex-col" onClick={() => setViewerOpen(false)}>
                        <div className="flex-shrink-0 p-4 flex justify-end gap-2">
                            <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleDownload(photos[activeIndex].filePath); }} className="!p-3 !rounded-full"><Download/></Button>
                            {canEdit && <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleSetAvatar(photos[activeIndex].id); }} disabled={photos[activeIndex].isAvatar} className="!p-3 !rounded-full"><Star/></Button>}
                            {canEdit && <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete([photos[activeIndex].id]); setViewerOpen(false); }} disabled={photos[activeIndex].isAvatar} className="!p-3 !rounded-full"><Trash2/></Button>}
                            <Button variant="secondary" onClick={() => setViewerOpen(false)} className="!p-3 !rounded-full"><X/></Button>
                        </div>
                        <div className="flex-grow flex items-center justify-center p-4">
                             <img src={`${appUrl}${photos[activeIndex].filePath}`} alt={`Фото ${cat.name} ${activeIndex + 1}`} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()}/>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </Portal>
        </div>
    );
};

// === ИЗМЕНЕНИЕ: Обертка теперь button, а не div ===
const PhotoItem = ({ photo, index, isSelected, isSelectionMode, onStartSelection, onToggleSelection, onOpenViewer }: any) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    
    const longPressEvents = useLongPress(
        () => onStartSelection(photo.id),
        () => isSelectionMode ? onToggleSelection(photo.id) : onOpenViewer(),
        { delay: 500 }
    );

    return (
        <motion.button 
            type="button"
            layout
            initial={{scale: 0.8, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            className={`relative aspect-square rounded-lg overflow-hidden group cursor-pointer border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
            {...longPressEvents}
        >
            <div className={`transition-opacity duration-200 ${isSelectionMode ? 'opacity-60' : 'opacity-100'}`}>
                {/* === ИЗМЕНЕНИЕ: Добавлен alt-текст === */}
                <img src={`${appUrl}${photo.filePath}`} alt={`Фото ${index + 1}`} className="w-full h-full object-cover"/>
            </div>

            <AnimatePresence>
            {isSelectionMode && (
                <motion.div
                    initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.5, opacity:0}}
                    className="absolute inset-0 flex items-center justify-center bg-blue-500/20"
                >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-500' : 'bg-white/80 border-2'}`}>
                        {isSelected && <CheckCircle2 size={24} className="text-white"/>}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </motion.button>
    );
};

export default PhotoGallery;