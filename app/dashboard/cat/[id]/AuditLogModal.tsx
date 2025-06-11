// app/dashboard/cat/[id]/AuditLogModal.tsx
"use client";

import React from 'react';
import Modal from '@/app/components/ui/Modal';
import { User, AuditLog as AuditLogType } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { User as UserIcon, Calendar, GitCommitHorizontal } from 'lucide-react';

interface AuditLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    logs: AuditLogType[];
    catCreator: User | null;
    catCreatedAt: string | null;
}

const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, logs, catCreator, catCreatedAt }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="История изменений">
            <div className="mt-4 space-y-6">
                {/* Блок о создании */}
                <div>
                    <h4 className="font-semibold text-brand-text-primary mb-2">Создание записи</h4>
                    <div className="flex items-center gap-4 bg-brand-background p-3 rounded-lg">
                        <UserIcon size={24} className="text-brand-primary flex-shrink-0" />
                        <div className='text-sm'>
                            <p>
                                <span className="font-semibold">{catCreator?.name || 'Неизвестный пользователь'}</span>
                                {' '}создал(а) эту запись.
                            </p>
                            <p className="text-brand-text-secondary">
                                {catCreatedAt ? format(new Date(catCreatedAt), 'd MMMM yyyy, HH:mm', { locale: ru }) : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Блок с последними изменениями */}
                {logs && logs.length > 0 && (
                    <div>
                         <h4 className="font-semibold text-brand-text-primary mb-2">Последние 5 изменений</h4>
                         <div className="space-y-3">
                            {logs.map(log => (
                                <div key={log.id} className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <GitCommitHorizontal size={20} className="text-brand-text-secondary" />
                                    </div>
                                    <div className='text-sm'>
                                        <p>
                                            <span className="font-semibold">{log.user.name}</span>
                                            {' '}{log.change.toLowerCase()}
                                        </p>
                                        <p className="text-brand-text-secondary capitalize">
                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: ru })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AuditLogModal;
