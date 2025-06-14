// app/dashboard/RevaccinationAlerts.tsx
"use client";

import { useMemo } from 'react';
import { Cat } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { getRevaccinationStatus } from '@/lib/revaccinationHelper';

interface Alert {
    catName: string;
    catId: string;
    dueDate: Date;
    isOverdue: boolean;
}

interface RevaccinationAlertsProps {
    cats: Cat[];
    onClick: () => void;
}

export default function RevaccinationAlerts({ cats, onClick }: RevaccinationAlertsProps) {
    const alerts: Alert[] = useMemo(() => {
        console.log(`[DEBUG] Запуск проверки ревакцинаций. Всего кошек: ${cats.length}`);

        const calculatedAlerts = cats
            .map(cat => {
                const statusInfo = getRevaccinationStatus(cat);

                // Выводим в консоль данные по каждой кошке
                console.log(`[DEBUG] Проверка кошки: "${cat.name}"`, {
                    status: statusInfo.status,
                    dueDate: statusInfo.dueDate ? statusInfo.dueDate.toLocaleDateString('ru-RU') : 'Нет',
                    isOverdue: statusInfo.isOverdue,
                    vaccinations: cat.treatments?.filter(t => t.type === 'VACCINATION') || 'Нет прививок'
                });

                if (statusInfo.status && statusInfo.dueDate) {
                    return {
                        catId: cat.id,
                        catName: cat.name,
                        dueDate: statusInfo.dueDate,
                        isOverdue: statusInfo.isOverdue,
                    };
                }
                return null;
            })
            .filter((alert): alert is Alert => alert !== null);
        
        console.log(`[DEBUG] Найдено уведомлений: ${calculatedAlerts.length}`, calculatedAlerts);
        
        return calculatedAlerts.sort((a, b) => Number(b.isOverdue) - Number(a.isOverdue) || a.dueDate.getTime() - b.dueDate.getTime());
    }, [cats]);

    if (alerts.length === 0) {
        return null;
    }

    const hasOverdue = alerts.some(a => a.isOverdue);
    const bannerClasses = hasOverdue 
        ? "bg-red-100 border-red-500 text-red-800 hover:bg-red-200"
        : "bg-yellow-100 border-yellow-500 text-yellow-800 hover:bg-yellow-200";

    return (
        <button 
            onClick={onClick}
            className={`w-full mb-6 border-l-4 p-4 rounded-r-lg text-left ${bannerClasses} transition-colors duration-300`} 
            role="alert"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <AlertTriangle className="h-6 w-6 mr-3" />
                    <div>
                        <p className="font-bold">{hasOverdue ? `Срочные задачи (${alerts.length})` : `Скоро ревакцинация (${alerts.length})`}</p>
                        <p className="text-sm">Нажмите, чтобы посмотреть список кошек</p>
                    </div>
                </div>
                <ChevronRight className="h-6 w-6" />
            </div>
        </button>
    );
}
