// app/dashboard/cat/[id]/DocumentViewerModal.tsx
"use client";

import React from 'react';
import Modal from '@/app/components/ui/Modal';
import { Document as DocType } from '@/types';
import Button from '@/app/components/ui/Button';
import { Download, Trash2, X } from 'lucide-react';

interface DocumentViewerModalProps {
    doc: DocType | null;
    onClose: () => void;
    canEdit: boolean;
    onDelete: () => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ doc, onClose, canEdit, onDelete }) => {
    if (!doc) return null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const fileSrc = `${appUrl}${doc.filePath}`;

    const actions = (
        <>
            <a href={fileSrc} download={doc.fileName} className="block">
                <Button variant="secondary" className="p-2 h-11 w-11 rounded-full">
                    <Download size={24} />
                </Button>
            </a>
            {canEdit && (
                <Button onClick={onDelete} variant="danger" className="p-2 h-11 w-11 rounded-full">
                    <Trash2 size={24} />
                </Button>
            )}
             <Button onClick={onClose} variant="secondary" className="p-2 h-11 w-11 rounded-full">
                <X size={28} />
            </Button>
        </>
    );

    return (
        <Modal 
            isOpen={!!doc} 
            onClose={onClose} 
            title={doc.fileName}
            headerActions={actions}
        >
            <div className="max-h-[70vh] overflow-y-auto mt-4">
                {doc.fileType.startsWith('image/') && (
                    <img src={fileSrc} alt={doc.fileName} className="w-full h-auto rounded-lg" />
                )}
                {doc.fileType === 'application/pdf' && (
                    <embed
                        src={fileSrc}
                        type="application/pdf"
                        className="w-full h-[65vh] border-0 rounded-lg"
                    />
                )}
            </div>
        </Modal>
    );
};

export default DocumentViewerModal;
