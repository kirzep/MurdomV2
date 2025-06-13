// app/dashboard/cat/[id]/ScanDocumentModal.tsx
"use client";

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import { Camera, Check, RefreshCw } from 'lucide-react';
import Spinner from '@/app/components/ui/Spinner';

interface ScanDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanComplete: (scannedFile: File) => void;
}

const ScanDocumentModal: React.FC<ScanDocumentModalProps> = ({ isOpen, onClose, onScanComplete }) => {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
    };
    
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
                // ИСПРАВЛЕНИЕ: Применяем эффект сканирования с помощью CSS-фильтров
                // Делаем изображение черно-белым, увеличиваем контраст и яркость
                ctx.filter = 'grayscale(1) contrast(1.6) brightness(1.2)';
                ctx.drawImage(image, 0, 0);

                // Конвертируем обработанное изображение на холсте обратно в файл
                canvas.toBlob((blob) => {
                    if (blob) {
                        const scannedFile = new File([blob], `scan-${Date.now()}.jpeg`, { type: 'image/jpeg' });
                        onScanComplete(scannedFile);
                        handleClose();
                    }
                    setIsProcessing(false);
                }, 'image/jpeg', 0.9);
            } else {
                 setIsProcessing(false);
            }
        };
        image.onerror = () => {
            setIsProcessing(false);
            alert('Не удалось обработать изображение.');
        }
    };

    const handleClose = () => {
        setImgSrc(null);
        setIsProcessing(false);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Сканировать документ">
            <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden mt-4">
                {isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                        <Spinner />
                        <span className="ml-4 text-brand-text-secondary">Обработка...</span>
                    </div>
                ) : (
                    imgSrc ? (
                        <img src={imgSrc} alt="Scanned document" className="w-full h-full object-contain" />
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "environment" }} // Предпочитаем заднюю камеру
                            className="w-full h-full"
                        />
                    )
                )}
            </div>
            <div className="mt-4 flex justify-center gap-4">
                {imgSrc ? (
                    <>
                        <Button variant="secondary" onClick={retake} className="flex-1">
                            <RefreshCw size={20} className="mr-2" /> Переснять
                        </Button>
                        <Button onClick={confirmScan} className="flex-1">
                            <Check size={20} className="mr-2" /> Подтвердить
                        </Button>
                    </>
                ) : (
                    <Button onClick={capture} className="h-16 w-16 rounded-full p-0">
                        <Camera size={32} />
                    </Button>
                )}
            </div>
        </Modal>
    );
};

export default ScanDocumentModal;
