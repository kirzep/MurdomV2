// app/dashboard/RevaccinationAlerts.tsx
"use client";

import { Cat } from '@/types';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { RevaccinationInfo } from '@/lib/revaccinationHelper';

interface RevaccinationAlertsProps {
    alerts: Array<{ cat: Cat; alert: RevaccinationInfo }>;
    onClick: () => void;
}

export default function RevaccinationAlerts({ alerts, onClick }: RevaccinationAlertsProps) {
    if (alerts.length === 0) return null;

    const hasOverdue = alerts.some(a => a.alert.isOverdue);
    
    // --- ИЗМЕНЕНИЕ: Используем новые пастельные классы ---
    const bannerClasses = hasOverdue 
        ? "bg-brand-accent-bg border-brand-accent text-brand-accent-text hover:bg-red-200"
        : "bg-brand-warning-bg border-brand-warning text-brand-warning-text hover:bg-amber-200";

    return (
        <button 
            onClick={onClick}
            // Добавляем рамку слева для акцента
            className={`w-full mb-6 border-l-4 p-4 rounded-r-lg text-left ${bannerClasses} transition-all duration-300 shadow-sm`} 
            role="alert"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <AlertTriangle className="h-6 w-6 mr-3" />
                    <div>
                        <p className="font-bold">{hasOverdue ? `Срочные задачи (${alerts.length})` : `Скоро вакцинация (${alerts.length})`}</p>
                        <p className="text-sm opacity-90">Нажмите, чтобы посмотреть список кошек</p>
                    </div>
                </div>
                <ChevronRight className="h-6 w-6" />
            </div>
        </button>
    );
}