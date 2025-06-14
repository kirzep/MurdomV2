// lib/revaccinationHelper.ts
import { Cat, Treatment, TreatmentType } from '@/types';
import { addYears, addDays, subDays, isWithinInterval, isPast, isToday as isTodayFns, addMonths } from 'date-fns';

export type RevaccinationStatus = 'overdue' | 'upcoming' | 'due_soon' | null;

export interface RevaccinationInfo {
    status: RevaccinationStatus;
    dueDate: Date | null;
    isOverdue: boolean;
    message: string;
}

/**
 * Проверяет статус следующей вакцинации для одной кошки.
 * @param cat - Объект кошки с ее обработками.
 * @returns {RevaccinationInfo} - Объект со статусом, датой и сообщением.
 */
export function getRevaccinationStatus(cat: Cat): RevaccinationInfo {
    const now = new Date();
    const allVaccinations = (cat.treatments || [])
        .filter(t => t.type === TreatmentType.VACCINATION)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (allVaccinations.length === 0) {
        return { status: null, dueDate: null, isOverdue: false, message: "" };
    }

    const lastVaccination = allVaccinations[0];
    const lastVaccinationDate = new Date(lastVaccination.date);
    let nextDueDate: Date;
    let alertMessage: string;

    // --- НОВАЯ УМНАЯ ЛОГИКА ---
    // Если последняя прививка была ПЕРВОЙ, то следующая (вторая) через 1 месяц.
    if (lastVaccination.vaccinationStage === 'first') {
        nextDueDate = addMonths(lastVaccinationDate, 1);
        alertMessage = "Требуется ревакцинация";
    } else {
        // Если последняя была ВТОРОЙ или РЕВАКЦИНАЦИЕЙ, то следующая через 1 год.
        nextDueDate = addYears(lastVaccinationDate, 1);
        alertMessage = "Требуется ежегодная вакцинация";
    }

    // Определяем окно для показа уведомлений
    const checkStartDate = subDays(now, 30); // Проверяем просроченные за последние 30 дней
    const checkEndDate = addDays(now, 14); // Проверяем предстоящие на 14 дней вперед

    if (isWithinInterval(nextDueDate, { start: checkStartDate, end: checkEndDate })) {
        const isOverdue = isPast(nextDueDate) && !isTodayFns(nextDueDate);
        return {
            status: isOverdue ? 'overdue' : 'upcoming',
            dueDate: nextDueDate,
            isOverdue: isOverdue,
            message: alertMessage
        };
    }

    return { status: null, dueDate: null, isOverdue: false, message: "" };
}