// app/dashboard/RevaccinationModal.tsx (НОВЫЙ ФАЙЛ)
"use client";

import React, { useMemo } from 'react';
import Modal from '../components/ui/Modal';
import { Cat } from '@/types';
import { getRevaccinationStatus } from '@/lib/revaccinationHelper';
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';

interface Alert {
    catId: string;
    catName: string;
    dueDate: Date;
    isOverdue: boolean;
}

interface RevaccinationModalProps {
    isOpen: boolean;
    onClose: () => void;
    cats: Cat[];
}

const RevaccinationModal: React.FC<RevaccinationModalProps> = ({ isOpen, onClose, cats }) => {
    const alerts: Alert[] = useMemo(() => {
        return cats
            .map(cat => {
                const { status, dueDate, isOverdue } = getRevaccinationStatus(cat);
                if (status && dueDate) {
                    return {
                        catId: cat.id,
                        catName: cat.name,
                        dueDate: dueDate,
                        isOverdue: isOverdue,
                    };
                }
                return null;
            })
            .filter((alert): alert is Alert => alert !== null)
            .sort((a, b) => Number(b.isOverdue) - Number(a.isOverdue) || a.dueDate.getTime() - b.dueDate.getTime());
    }, [cats]);

    const overdueAlerts = alerts.filter(a => a.isOverdue);
    const upcomingAlerts = alerts.filter(a => !a.isOverdue);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Уведомления о ревакцинации">
            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 space-y-6">
                {overdueAlerts.length > 0 && (
                    <section>
                        <h4 className="font-bold text-red-600 mb-2">Просрочено</h4>
                        <div className="space-y-2">
                            {overdueAlerts.map(alert => (
                                <Link key={alert.catId} href={`/dashboard/cat/${alert.catId}`} onClick={onClose} className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                    <p className="font-semibold text-red-800">{alert.catName}</p>
                                    <p className="text-sm text-red-700">Требовалось до: {format(alert.dueDate, 'd MMMM yy', { locale: ru })}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {upcomingAlerts.length > 0 && (
                     <section>
                        <h4 className="font-bold text-yellow-600 mb-2">Скоро</h4>
                         <div className="space-y-2">
                            {upcomingAlerts.map(alert => (
                                <Link key={alert.catId} href={`/dashboard/cat/${alert.catId}`} onClick={onClose} className="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                                    <p className="font-semibold text-yellow-800">{alert.catName}</p>
                                    <p className="text-sm text-yellow-700">Требуется до: {format(alert.dueDate, 'd MMMM yy', { locale: ru })}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
                
                {alerts.length === 0 && (
                    <div className="text-center py-8 text-brand-text-secondary">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                        <p className="font-semibold">Отличная работа!</p>
                        <p>Нет просроченных или ближайших ревакцинаций.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default RevaccinationModal;