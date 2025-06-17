// lib/revaccinationHelper.ts
import { Cat, TreatmentType } from '@/types';
import { addYears, addMonths, isPast, isToday as isTodayFns, differenceInDays } from 'date-fns';

export type RevaccinationStatus = 'overdue' | 'upcoming' | 'due_soon' | null;

export interface RevaccinationInfo {
    status: RevaccinationStatus;
    dueDate: Date | null;
    isOverdue: boolean;
    message: string;
}

export function getRevaccinationStatus(cat: Cat): RevaccinationInfo {
    const now = new Date();
    
    const allVaccinations = (cat.treatments || [])
        .filter(t => t.type === TreatmentType.VACCINATION && t.vaccinationStage)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (allVaccinations.length === 0) {
        return { status: null, dueDate: null, isOverdue: false, message: "" };
    }

    const firstVaccination = allVaccinations.find(v => v.vaccinationStage === 'first');
    if (!firstVaccination) return { status: null, dueDate: null, isOverdue: false, message: "" };

    const secondVaccination = allVaccinations.find(v => v.vaccinationStage === 'second');

    // --- СЦЕНАРИЙ 1: ВТОРАЯ ПРИВИВКА ---
    if (!secondVaccination) {
        const dueDate = addMonths(new Date(firstVaccination.date), 1);
        const isOverdue = isPast(dueDate) && !isTodayFns(dueDate);
        const daysUntil = differenceInDays(dueDate, now);

        // Условие для показа уведомления: просрочено ИЛИ предстоит в ближайшие 14 дней.
        if (isOverdue || (daysUntil >= 0 && daysUntil <= 14)) {
            // ИЗМЕНЕНИЕ: Динамическое формирование сообщения
            const message = `${isOverdue ? 'Требовалась' : 'Требуется'} ревакцинация`;
            return {
                status: isOverdue ? 'overdue' : 'upcoming',
                dueDate,
                isOverdue,
                message,
            };
        }
    }
    // --- СЦЕНАРИЙ 2: ЕЖЕГОДНАЯ ПРИВИВКА ---
    else {
        const annualVaccinations = allVaccinations.filter(v => v.vaccinationStage === 'revaccination');
        const baseDate = annualVaccinations.length > 0
            ? new Date(annualVaccinations[annualVaccinations.length - 1].date)
            : new Date(firstVaccination.date);

        const firstPossibleDueDate = addYears(baseDate, 1);
        
        let actualDueDate = new Date(firstPossibleDueDate.getTime());
        while (isPast(actualDueDate) && !isTodayFns(actualDueDate)) {
            actualDueDate = addYears(actualDueDate, 1);
        }

        const isTrulyOverdue = isPast(firstPossibleDueDate) && !isTodayFns(firstPossibleDueDate);
        const daysUntil = differenceInDays(actualDueDate, now);

        if (isTrulyOverdue || (daysUntil >= 0 && daysUntil <= 14)) {
            // ИЗМЕНЕНИЕ: Динамическое формирование сообщения
            const message = `${isTrulyOverdue ? 'Требовалась' : 'Требуется'} ежегодная вакцинация`;
            return {
                status: isTrulyOverdue ? 'overdue' : 'upcoming',
                dueDate: actualDueDate,
                isOverdue: isTrulyOverdue,
                message,
            };
        }
    }

    return { status: null, dueDate: null, isOverdue: false, message: "" };
}