// lib/revaccinationHelper.ts
import { Cat, TreatmentType } from '@/types';
import { addYears, addDays, isPast, isToday as isTodayFns, differenceInDays, isAfter, startOfDay } from 'date-fns';

export type RevaccinationStatus = 'overdue' | 'upcoming' | null;

export interface RevaccinationInfo {
    status: RevaccinationStatus;
    dueDate: Date | null;
    isOverdue: boolean;
    message: string;
}

// Вспомогательная функция для проверки и создания статуса на основе вычисленной даты
const checkAndCreateInfo = (dueDate: Date, messagePrefix: string): RevaccinationInfo => {
    const today = startOfDay(new Date());
    const isOverdue = isPast(dueDate) && !isTodayFns(dueDate);
    const daysUntil = differenceInDays(dueDate, today);
    
    if (isOverdue || (daysUntil >= 0 && daysUntil <= 7)) {
        const messageVerb = isOverdue ? 'Требовалась' : 'Требуется';
        return {
            status: isOverdue ? 'overdue' : 'upcoming',
            dueDate,
            isOverdue,
            message: `${messageVerb} ${messagePrefix}`,
        };
    }
    
    return { status: null, dueDate: null, isOverdue: false, message: '' };
};

// Основная, упрощенная функция
export function getRevaccinationStatus(cat: Cat): RevaccinationInfo {
    if (cat.status !== 'В приюте') {
        return { status: null, dueDate: null, isOverdue: false, message: '' };
    }

    const today = startOfDay(new Date());
    const allVaccinations = (cat.treatments || [])
        .filter(t => t.type === TreatmentType.VACCINATION && t.vaccinationStage)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 1. Проверка на наличие запланированных будущих вакцинаций
    const futureVaccination = allVaccinations.find(v => isAfter(startOfDay(new Date(v.date)), today));
    if (futureVaccination) {
        const futureVaxDate = startOfDay(new Date(futureVaccination.date));
        if (differenceInDays(futureVaxDate, today) <= 7) {
            let message = 'Запланирована вакцинация';
            if (futureVaccination.vaccinationStage === 'second') message = 'Запланирована ревакцинация';
            if (futureVaccination.vaccinationStage === 'revaccination') message = 'Запланирована ежегодная вакцинация';
            return { status: 'upcoming', dueDate: futureVaxDate, isOverdue: false, message };
        }
    }
    
    // 2. Расчет на основе прошлых прививок
    const pastVaccinations = allVaccinations.filter(v => !isAfter(startOfDay(new Date(v.date)), today));
    if (pastVaccinations.length === 0) {
        return { status: null, dueDate: null, isOverdue: false, message: "" };
    }

    const first = pastVaccinations.find(v => v.vaccinationStage === 'first');
    const second = pastVaccinations.find(v => v.vaccinationStage === 'second');
    const lastAnnual = pastVaccinations.filter(v => v.vaccinationStage === 'revaccination').pop();

    if (lastAnnual) {
        return checkAndCreateInfo(addYears(new Date(lastAnnual.date), 1), 'ежегодная вакцинация');
    }
    if (first && !second) {
        return checkAndCreateInfo(addDays(new Date(first.date), 28), 'ревакцинация');
    }
    if (first && second) {
        return checkAndCreateInfo(addYears(new Date(first.date), 1), 'ежегодная вакцинация');
    }

    return { status: null, dueDate: null, isOverdue: false, message: "" };
}