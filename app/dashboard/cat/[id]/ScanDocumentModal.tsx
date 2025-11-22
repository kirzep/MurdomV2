// app/dashboard/cat/[id]/ScanDocumentModal.tsx
"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, Check, RefreshCw, X, ScanLine, Flashlight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ScanDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanComplete: (scannedFile: File) => void;
}

const ScanDocumentModal: React.FC<ScanDocumentModalProps> = ({ isOpen, onClose, onScanComplete }) => {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showGrid, setShowGrid] = useState(true);

    const videoConstraints = {
        width: 1920,
        height: 1080,
        facingMode: "environment" // Используем заднюю камеру по умолчанию
    };

    // Сброс при закрытии
    const handleClose = () => {
        setImgSrc(null);
        setIsProcessing(false);
        setError(null);
        onClose();
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) setImgSrc(imageSrc);
    }, [webcamRef]);

    const retake = () => setImgSrc(null);
    
    const confirmScan = async () => {
        if (!imgSrc) return;
        setIsProcessing(true);

        const image = new Image();
        image.src = imgSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                // Эмуляция задержки сканирования для эффекта
                setTimeout(() => {
                    ctx.drawImage(image, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    
                    // Алгоритм "Ксерокс" (Бинаризация + Контраст)
                    for (let i = 0; i < data.length; i += 4) {
                        const avg = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
                        // Адаптивный порог или просто жесткий для эффекта документа
                        const val = avg > 110 ? 255 : 0; 
                        data[i] = val;     // R
                        data[i+1] = val;   // G
                        data[i+2] = val;   // B
                    }
                    ctx.putImageData(imageData, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const scannedFile = new File([blob], `scan-${Date.now()}.jpeg`, { type: 'image/jpeg' });
                            onScanComplete(scannedFile);
                            handleClose();
                        }
                        setIsProcessing(false);
                    }, 'image/jpeg', 0.85); // Сжимаем качество для документов
                }, 1000); // 1 секунда на анимацию
            } else { setIsProcessing(false); }
        };
        image.onerror = () => { setIsProcessing(false); alert('Ошибка обработки изображения.'); }
    };

    const handleUserMediaError = (err: any) => {
        console.error("Webcam Error:", err);
        setError("Нет доступа к камере. Проверьте разрешения браузера или HTTPS.");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
             <motion.div
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black flex flex-col"
            >
                {/* --- HEADER (Кнопки управления сверху) --- */}
                <div className="absolute top-0 left-0 right-0 p-4 pt-6 z-30 flex justify-between items-start pointer-events-none">
                     {/* Кнопка Закрыть */}
                     <button 
                        onClick={handleClose} 
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center justify-center pointer-events-auto hover:bg-black/60 transition-colors"
                     >
                        <X size={24}/>
                    </button>

                    {/* Тоггл сетки (только в режиме камеры) */}
                    {!imgSrc && !error && (
                        <button 
                            onClick={() => setShowGrid(!showGrid)}
                            className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center pointer-events-auto transition-colors ${showGrid ? 'bg-brand-primary text-white border-brand-primary' : 'bg-black/40 text-white border-white/20'}`}
                        >
                            <ScanLine size={20} />
                        </button>
                    )}
                </div>

                {/* --- ГЛАВНАЯ ОБЛАСТЬ (Камера / Превью) --- */}
                <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
                    
                    {/* Режим: Обработка (С анимацией сканера) */}
                    {isProcessing && (
                        <div className="absolute inset-0 z-40 bg-black/80 flex flex-col items-center justify-center">
                            <div className="relative w-64 h-80 border-2 border-white/30 rounded-lg overflow-hidden bg-white/5">
                                {/* Бегущая полоса сканера */}
                                <motion.div 
                                    className="absolute left-0 right-0 h-1 bg-brand-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)]"
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 size={48} className="text-brand-primary animate-spin" />
                                </div>
                            </div>
                            <p className="mt-6 text-white font-mono text-sm tracking-widest uppercase animate-pulse">Оптимизация...</p>
                        </div>
                    )}

                    {/* Режим: Ошибка */}
                    {error && (
                         <div className="p-8 text-center text-white max-w-md">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                                <Camera size={32} />
                            </div>
                           <h3 className="text-xl font-bold mb-2">Камера недоступна</h3>
                           <p className="text-white/60 text-sm mb-6 leading-relaxed">{error}</p>
                           <button onClick={handleClose} className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200">
                               Понятно
                           </button>
                        </div>
                    )}

                    {/* Режим: Предпросмотр снимка */}
                    {!isProcessing && imgSrc && (
                        <div className="relative w-full h-full">
                            <img src={imgSrc} alt="Scan preview" className="w-full h-full object-contain" />
                            {/* Оверлей эффекта "документа" (можно убрать, если мешает) */}
                            <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20 bg-noise" />
                        </div>
                    )}

                    {/* Режим: Камера (Live View) */}
                    {!isProcessing && !imgSrc && !error && (
                        <div className="relative w-full h-full">
                            <Webcam
                                audio={false} 
                                ref={webcamRef} 
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints} 
                                className="w-full h-full object-cover"
                                onUserMediaError={handleUserMediaError}
                            />
                            
                            {/* Сетка / Рамка для документа */}
                            {showGrid && (
                                <div className="absolute inset-0 pointer-events-none p-8 flex items-center justify-center">
                                    <div className="w-full max-w-md aspect-[3/4] border-2 border-white/50 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                                        {/* Уголки */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-primary -mt-1 -ml-1 rounded-tl-xl"/>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-primary -mt-1 -mr-1 rounded-tr-xl"/>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-primary -mb-1 -ml-1 rounded-bl-xl"/>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-primary -mb-1 -mr-1 rounded-br-xl"/>
                                        
                                        {/* Центральный крестик */}
                                        <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2">
                                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/50" />
                                            <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/50" />
                                        </div>
                                    </div>
                                    <p className="absolute bottom-24 text-white/80 text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                        Поместите документ в рамку
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- FOOTER (Кнопки действий) --- */}
                <div className="h-32 bg-black flex items-center justify-center px-8 pb-4 gap-8 shrink-0 relative z-30">
                    {imgSrc ? (
                        // Контролы ПОСЛЕ снимка
                        <>
                            <button 
                                onClick={retake} 
                                className="w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <RefreshCw size={24} />
                            </button>
                            
                            <button 
                                onClick={confirmScan} 
                                className="w-20 h-20 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Check size={40} strokeWidth={3} />
                            </button>
                            
                            {/* Пустой блок для баланса */}
                            <div className='w-14 h-14' /> 
                        </>
                    ) : (
                        // Кнопка СНЯТЬ
                        <button 
                            onClick={capture} 
                            disabled={!!error}
                            className={`
                                w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all
                                ${error 
                                    ? 'border-gray-700 bg-gray-800 cursor-not-allowed opacity-50' 
                                    : 'border-white bg-white/20 backdrop-blur-sm hover:bg-white hover:scale-105 active:scale-95'
                                }
                            `}
                        >
                            {!error && <div className="w-16 h-16 bg-white rounded-full pointer-events-none" />}
                        </button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ScanDocumentModal;