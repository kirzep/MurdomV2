// app/dashboard/cat/[id]/ScanDocumentModal.tsx
"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import Button from '@/app/components/ui/Button';
import { Camera, Check, RefreshCw, X } from 'lucide-react';
import Spinner from '@/app/components/ui/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

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

    const videoConstraints = {
        width: 1920,
        height: 1080,
        facingMode: "environment"
    };

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
                ctx.drawImage(image, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                // Более сложный алгоритм обработки:
                // 1. Делаем Ч/Б с учетом веса цветов (для лучшего восприятия)
                // 2. Применяем порог для удаления серых шумов
                // 3. Увеличиваем контраст
                for (let i = 0; i < data.length; i += 4) {
                    const avg = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
                    const val = avg > 128 ? 255 : 0;
                    data[i] = val;
                    data[i+1] = val;
                    data[i+2] = val;
                }
                ctx.putImageData(imageData, 0, 0);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const scannedFile = new File([blob], `scan-${Date.now()}.jpeg`, { type: 'image/jpeg' });
                        onScanComplete(scannedFile);
                        handleClose();
                    }
                    setIsProcessing(false);
                }, 'image/jpeg', 0.95);
            } else { setIsProcessing(false); }
        };
        image.onerror = () => { setIsProcessing(false); alert('Не удалось обработать изображение.'); }
    };

    const handleUserMediaError = (err: any) => {
        console.error("Webcam Error:", err);
        setError("Не удалось получить доступ к камере. Пожалуйста, проверьте разрешения в настройках браузера и убедитесь, что сайт работает по HTTPS.");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
                >
                    <div className="relative w-full h-full">
                        {isProcessing ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                                <Spinner />
                                <p className="mt-4 text-white">Обработка...</p>
                            </div>
                        ) : imgSrc ? (
                            <img src={imgSrc} alt="Scanned document" className="w-full h-full object-contain" />
                        ) : error ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-white bg-gray-800">
                               <h3 className="text-xl font-semibold mb-2">Ошибка камеры</h3>
                               <p className="text-sm">{error}</p>
                               <Button onClick={handleClose} variant="secondary" className="mt-6">Закрыть</Button>
                            </div>
                        ) : (
                            <Webcam
                                audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints} className="w-full h-full object-cover"
                                onUserMediaError={handleUserMediaError}
                            />
                        )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex justify-center gap-8 items-center">
                        {imgSrc ? (
                            <>
                                <Button variant="secondary" onClick={retake} className="h-16 w-16 rounded-full p-0 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                    <RefreshCw size={28} />
                                </Button>
                                <Button onClick={confirmScan} className="h-20 w-20 rounded-full p-0 bg-emerald-500 text-white shadow-lg">
                                    <Check size={40} />
                                </Button>
                                <div className='w-16 h-16'></div>
                            </>
                        ) : (
                            <Button onClick={capture} className="h-20 w-20 rounded-full border-4 border-white bg-white/30 backdrop-blur-sm p-0">
                                <span className="sr-only">Сделать снимок</span>
                            </Button>
                        )}
                    </div>

                    <Button variant='secondary' onClick={handleClose} className='absolute top-4 right-4 h-12 w-12 rounded-full p-0 bg-black/30 text-white border-white/20 backdrop-blur-sm'>
                        <X size={28}/>
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScanDocumentModal;
