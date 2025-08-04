// app/dashboard/cat/[id]/PhotoGallery.tsx
"use client";

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Cat, Role } from '@/types';
import Spinner from '@/app/components/ui/Spinner';
import Button from '@/app/components/ui/Button';
import { Upload, Trash2, Download, Star, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from '@/app/components/ui/Portal'; // === ИМПОРТИРУЕМ ПОРТАЛ ===

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
            const filePaths = uploadResults.map(result => result.filePath);
            
            await fetch(`/api/cats/${cat.id}/photos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePaths }),
            });
            await fetchPhotos();
            onDataChange();
        } catch (error) {
            alert("Ошибка загрузки файлов.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSetAvatar = async (photoId: string) => {
        await fetch(`/api/cats/${cat.id}/photos/${photoId}`, { method: 'PATCH' });
        await fetchPhotos();
        onDataChange();
    };
    
    const handleDelete = async (photoIds: string[]) => {
        if (confirm(`Вы уверены, что хотите удалить ${photoIds.length} фото?`)) {
            await fetch(`/api/cats/${cat.id}/photos`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: photoIds }),
            });
            setSelectedPhotos([]);
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

    const toggleSelection = (photoId: string) => {
        setSelectedPhotos(prev => 
            prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]
        );
    };
    
    if (isLoading) return <div className="h-[50vh] flex items-center justify-center"><Spinner /></div>;

    return (
        <div className="p-4 md:p-6">
            <AnimatePresence>
                {isSelectionMode && (
                     <motion.div initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}} exit={{y: -20, opacity: 0}} className="flex justify-between items-center mb-4 p-3 bg-indigo-50 rounded-lg">
                        <span className="font-semibold">{selectedPhotos.length} фото выбрано</span>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setSelectedPhotos([])}>Отменить</Button>
                            <Button variant="danger" onClick={() => handleDelete(selectedPhotos)}>Удалить</Button>
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
                    <motion.div 
                        key={photo.id} 
                        layout
                        initial={{scale: 0.8, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        className="relative aspect-square rounded-lg overflow-hidden group"
                        onClick={() => {
                            if (isSelectionMode) {
                                toggleSelection(photo.id);
                            } else {
                                setActiveIndex(index);
                                setViewerOpen(true);
                            }
                        }}
                    >
                        <img src={`${appUrl}${photo.filePath}`} alt={`Фото кошки ${index + 1}`} className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"/>
                        {photo.isAvatar && <Star size={20} className="absolute top-2 right-2 text-yellow-300 fill-yellow-300"/>}
                        {isSelectionMode && (
                             <div className="absolute top-2 left-2">
                                <CheckCircle2 size={24} className={`${selectedPhotos.includes(photo.id) ? 'text-blue-500 fill-white' : 'text-white/70'}`}/>
                            </div>
                        )}
                        {!isSelectionMode && canEdit && (
                            <Button 
                                variant="secondary"
                                onClick={(e) => {e.stopPropagation(); handleSetAvatar(photo.id)}}
                                className="absolute bottom-2 right-2 !p-2 !h-8 !w-8 !rounded-full opacity-0 group-hover:opacity-100"
                                disabled={photo.isAvatar}
                                title="Сделать аватаром"
                            >
                                <Star size={16}/>
                            </Button>
                        )}
                    </motion.div>
                ))}
            </div>
            
            {/* === ИЗМЕНЕНИЕ ЗДЕСЬ: Оборачиваем модальное окно в Portal === */}
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
                            <img src={`${appUrl}${photos[activeIndex].filePath}`} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()}/>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </Portal>
        </div>
    );
};

export default PhotoGallery;