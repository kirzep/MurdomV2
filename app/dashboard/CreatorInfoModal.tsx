// app/dashboard/CreatorInfoModal.tsx
"use client";

import React from 'react';
import Modal from '@/app/components/ui/Modal';
import { User as UserType } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { User, Calendar } from 'lucide-react';

interface CreatorInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    creator: UserType | null; // Может быть null для старых записей
    catName: string;
    catAddedDate: string;
}

const CreatorInfoModal: React.FC<CreatorInfoModalProps> = ({ isOpen, onClose, creator, catName, catAddedDate }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Информация о записи">
            <div className="space-y-4 text-center">
                <p className="text-brand-text-primary">
                    Карточку кошки <strong className="text-brand-primary">{catName}</strong> добавил(а) пользователь:
                </p>
                <div className="p-4 bg-brand-background rounded-lg inline-flex flex-col items-center">
                    <User size={24} className="mb-2 text-brand-primary"/>
                    <p className="font-semibold text-lg">{creator?.name || 'Неизвестный пользователь'}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-brand-text-secondary">
                    <Calendar size={16} />
                    <span>Дата добавления: {format(new Date(catAddedDate), 'd MMMM yyyy г.', { locale: ru })}</span>
                </div>
            </div>
        </Modal>
    )
}

export default CreatorInfoModal;
