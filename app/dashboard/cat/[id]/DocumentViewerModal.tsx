// app/dashboard/cat/[id]/DocumentViewerModal.tsx
"use client";

import React from 'react';
import Modal from '@/app/components/ui/Modal';
import { Document } from '@/types';

interface DocumentViewerModalProps {
    doc: Document | null;
    onClose: () => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ doc, onClose }) => {
    if (!doc) return null;

    return (
        <Modal isOpen={!!doc} onClose={onClose} title={doc.fileName}>
            <div className="max-h-[80vh] overflow-y-auto mt-4">
                {/* Для изображений все остается по-прежнему */}
                {doc.fileType.startsWith('image/') && (
                    <img src={doc.filePath} alt={doc.fileName} className="w-full h-auto rounded-lg" />
                )}

                {/* Меняем <iframe> на более надежный тег <embed> для PDF */}
                {doc.fileType === 'application/pdf' && (
                    <embed
                        src={doc.filePath}
                        type="application/pdf"
                        className="w-full h-[75vh] border-0 rounded-lg"
                    />
                )}
            </div>
        </Modal>
    );
};

export default DocumentViewerModal;
