// app/dashboard/RevaccinationAlerts.tsx
"use client";

import { Cat } from '@/types';
import { AlertTriangle, ChevronRight } from 'lucide-react';
// ИЗМЕНЕНИЕ: Импортируем нужный тип
import { RevaccinationInfo } from '@/lib/revaccinationHelper';

// ИЗМЕНЕНИЕ: Интерфейс props теперь ожидает `alerts`, а не `cats`
interface RevaccinationAlertsProps {
    alerts: Array<{ cat: Cat; alert: RevaccinationInfo }>;
    onClick: () => void;
}

export default function RevaccinationAlerts({ alerts, onClick }: RevaccinationAlertsProps) {
    
    // ИЗМЕНЕНИЕ: Убрали useMemo, так как данные уже готовы
    if (alerts.length === 0) {
        return null;
    }

    const hasOverdue = alerts.some(a => a.alert.isOverdue);
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
                        <p className="font-bold">{hasOverdue ? `Срочные задачи (${alerts.length})` : `Скоро вакцинация (${alerts.length})`}</p>
                        <p className="text-sm">Нажмите, чтобы посмотреть список кошек</p>
                    </div>
                </div>
                <ChevronRight className="h-6 w-6" />
            </div>
        </button>
    );
}