// lib/revaccinationHelper.ts
import { Cat, Treatment, TreatmentType } from '@/types';
import { addYears, addDays, isPast, isToday as isTodayFns, differenceInDays, isAfter, startOfDay } from 'date-fns';

export type RevaccinationStatus = 'overdue' | 'upcoming' | null;

export interface RevaccinationInfo {
    status: RevaccinationStatus;
    dueDate: Date | null;
    isOverdue: boolean;
    message: string;
}

export function getRevaccinationStatus(cat: Cat): RevaccinationInfo {
    const today = startOfDay(new Date());

    const allVaccinations = (cat.treatments || [])
        .filter(t => t.type === TreatmentType.VACCINATION && t.vaccinationStage)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // --- ШАГ 1: Проверка запланированных в будущем вакцинаций ---
    const futureVaccinations = allVaccinations.filter(v => isAfter(startOfDay(new Date(v.date)), today));
    if (futureVaccinations.length > 0) {
        const earliestFutureVaxDate = startOfDay(new Date(futureVaccinations[0].date));
        const daysUntil = differenceInDays(earliestFutureVaxDate, today);

        if (daysUntil <= 7) {
            let message = 'Запланирована вакцинация';
            const stage = futureVaccinations[0].vaccinationStage;
            if (stage === 'second') message = 'Запланирована ревакцинация';
            if (stage === 'revaccination') message = 'Запланирована ежегодная вакцинация';
            
            return {
                status: 'upcoming', dueDate: earliestFutureVaxDate, isOverdue: false, message: message,
            };
        }
    }

    // --- ШАГ 2: Расчет на основе прошлых прививок ---
    const pastVaccinations = allVaccinations.filter(v => !isAfter(startOfDay(new Date(v.date)), today));
    if (pastVaccinations.length === 0) return { status: null, dueDate: null, isOverdue: false, message: "" };

    const firstVaccination = pastVaccinations.find(v => v.vaccinationStage === 'first');
    const secondVaccination = pastVaccinations.find(v => v.vaccinationStage === 'second');
    const lastAnnualVaccination = pastVaccinations.filter(v => v.vaccinationStage === 'revaccination').pop();

    let dueDate: Date | null = null;
    let messageType: 'revaccination' | 'annual' | null = null;

    // **ИСПРАВЛЕННАЯ ЛОГИКА ПРИОРИТЕТОВ**
    // 1. Если есть ежегодные, отталкиваемся от последней из них.
    if (lastAnnualVaccination) {
        dueDate = addYears(new Date(lastAnnualVaccination.date), 1);
        messageType = 'annual';
    } 
    // 2. Если ежегодных нет, но есть первая, проверяем нужну ли вторая или первая ежегодная.
    else if (firstVaccination) {
        if (!secondVaccination) {
            // Нужна вторая
            dueDate = addDays(new Date(firstVaccination.date), 28);
            messageType = 'revaccination';
        } else {
            // Нужна первая ежегодная (отсчет от первой)
            dueDate = addYears(new Date(firstVaccination.date), 1);
            messageType = 'annual';
        }
    }

    // --- Расчет статуса для вычисленной даты ---
    if (dueDate) {
        const isOverdue = isPast(dueDate) && !isTodayFns(dueDate);
        const daysUntil = differenceInDays(dueDate, today);

        if (isOverdue || (daysUntil >= 0 && daysUntil <= 7)) {
            const messageVerb = isOverdue ? 'Требовалась' : 'Требуется';
            const messageNoun = messageType === 'revaccination' ? 'ревакцинация' : 'ежегодная вакцинация';
            const message = `${messageVerb} ${messageNoun}`;
            
            return {
                status: isOverdue ? 'overdue' : 'upcoming', dueDate, isOverdue, message,
            };
        }
    }

    return { status: null, dueDate: null, isOverdue: false, message: "" };
}