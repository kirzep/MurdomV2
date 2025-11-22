// app/dashboard/cat/[id]/PhotoGallery.tsx
"use client";

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Cat } from '@/types';
import { Upload, Trash2, Download, Star, X, CheckCircle2, Image as ImageIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from '@/app/components/ui/Portal';
import useLongPress from '@/hooks/useLongPress';
import { Loader2 } from 'lucide-react';

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
    
    if (isLoading) return <div className="h-[30vh] flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" /></div>;

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-lg p-6 sm:p-8 rounded-3xl min-h-[50vh]">
            <div className="flex items-center gap-3 text-gray-800 mb-6">
                <div className="p-2 bg-purple-50 text-purple-500 rounded-xl">
                    <ImageIcon size={24} />
                </div>
                <h3 className="text-xl font-bold">Фотогалерея</h3>
                <span className="text-sm text-gray-400 font-medium ml-auto">{photos.length} фото</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                 {/* Кнопка загрузки */}
                 {canEdit && (
                    <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-brand-primary/50 hover:shadow-md transition-all group">
                        {isUploading ? (
                            <Loader2 className="animate-spin text-brand-primary" size={32}/>
                        ) : (
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Plus size={24} className="text-gray-400 group-hover:text-brand-primary transition-colors"/>
                            </div>
                        )}
                        <span className="text-xs mt-3 font-bold text-gray-400 group-hover:text-brand-primary">Добавить</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading}/>
                    </label>
                )}

                {/* Список фото */}
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

            {/* Пустое состояние */}
            {!isLoading && photos.length === 0 && !isUploading && (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                     <p className="text-sm">В галерее пока пусто</p>
                </div>
            )}
            
            {/* Панель массовых действий */}
            <AnimatePresence>
                {isSelectionMode && (
                     <motion.div
                        initial={{ y: "120%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "120%", opacity: 0 }}
                        className="fixed bottom-6 inset-x-4 max-w-lg mx-auto z-40"
                     >
                        <div className="bg-white/90 backdrop-blur-xl text-gray-800 rounded-2xl p-2 pl-4 shadow-2xl flex items-center justify-between border border-white/50 ring-1 ring-black/5">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsSelectionMode(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={20}/>
                                </button>
                                <span className="font-bold text-sm">Выбрано: {selectedPhotos.length}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleDownloadSelected} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                                    <Download size={18}/>
                                    <span className="hidden sm:inline">Скачать</span>
                                </button>
                                <button onClick={() => handleDelete(selectedPhotos)} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                                    <Trash2 size={18}/>
                                    <span className="hidden sm:inline">Удалить</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Лайтбокс (Просмотр) */}
            <Portal>
                <AnimatePresence>
                {viewerOpen && (
                    <motion.div 
                        initial={{opacity:0}} 
                        animate={{opacity:1}} 
                        exit={{opacity:0}} 
                        className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md"
                        onClick={() => setViewerOpen(false)}
                    >
                        {/* Тулбар */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-20" onClick={(e) => e.stopPropagation()}>
                            <div className="text-white/70 text-sm font-medium bg-black/50 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                                {activeIndex + 1} / {photos.length}
                            </div>
                            <button onClick={() => setViewerOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors">
                                <X size={24}/>
                            </button>
                        </div>

                        {/* Контент */}
                        <div className="flex-grow flex items-center justify-center p-4">
                             <img 
                                src={`${appUrl}${photos[activeIndex].filePath}`} 
                                alt={`Фото ${cat.name}`} 
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                                onClick={(e) => e.stopPropagation()}
                             />
                        </div>

                        {/* Нижняя панель действий */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
                            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    onClick={() => handleDownload(photos[activeIndex].filePath)} 
                                    className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors"
                                    title="Скачать"
                                >
                                    <Download size={24}/>
                                </button>
                                
                                {canEdit && (
                                    <>
                                        <button 
                                            onClick={() => handleSetAvatar(photos[activeIndex].id)} 
                                            disabled={photos[activeIndex].isAvatar} 
                                            className={`p-3 rounded-xl transition-colors ${photos[activeIndex].isAvatar ? 'text-yellow-400' : 'text-white hover:bg-white/20'}`}
                                            title="Сделать аватаром"
                                        >
                                            <Star size={24} fill={photos[activeIndex].isAvatar ? "currentColor" : "none"} />
                                        </button>
                                        
                                        <div className="w-px h-8 bg-white/20" />
                                        
                                        <button 
                                            onClick={() => { handleDelete([photos[activeIndex].id]); setViewerOpen(false); }} 
                                            className="p-3 text-red-400 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-colors"
                                            title="Удалить"
                                        >
                                            <Trash2 size={24}/>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </Portal>
        </div>
    );
};

// Компонент одной карточки фото
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
            initial={{scale: 0.9, opacity: 0}}
            animate={{scale: isSelected ? 0.95 : 1, opacity: 1}}
            whileHover={{ y: isSelectionMode ? 0 : -2 }}
            className={`
                relative aspect-square rounded-2xl overflow-hidden cursor-pointer 
                bg-gray-100 border transition-all duration-300
                ${isSelected 
                    ? 'ring-4 ring-brand-primary border-transparent' 
                    : 'border-transparent hover:shadow-lg'
                }
            `}
            {...longPressEvents}
        >
            <img 
                src={`${appUrl}${photo.filePath}`} 
                alt={`Фото ${index + 1}`} 
                className={`w-full h-full object-cover transition-all duration-500 ${isSelectionMode ? 'opacity-80 scale-105' : 'hover:scale-110'}`}
                loading="lazy"
            />
            
            {/* Бейдж аватара (звездочка) */}
            {photo.isAvatar && !isSelectionMode && (
                <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-md p-1.5 rounded-full text-yellow-400 shadow-sm border border-white/10">
                    <Star size={12} fill="currentColor" />
                </div>
            )}

            {/* Оверлей выбора */}
            <AnimatePresence>
            {isSelectionMode && (
                <motion.div
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className={`
                        absolute inset-0 flex items-center justify-center 
                        ${isSelected ? 'bg-brand-primary/20 backdrop-blur-[1px]' : 'bg-transparent'}
                    `}
                >
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${isSelected ? 'bg-brand-primary text-white' : 'bg-white/40'}`}>
                        {isSelected && <CheckCircle2 size={20} strokeWidth={3}/>}
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
        </motion.button>
    );
};

export default PhotoGallery;