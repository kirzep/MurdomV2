// kirzep/murdomv2/kirzep-MurdomV2-ba8d66fc10844c3cf5f7882245a466e99dd2f639/lib/calendarHelper.ts
import { Cat, TreatmentType } from '@/types';
import { addMonths, addYears, isPast, isToday, differenceInDays } from 'date-fns';

// ИЗМЕНЕНИЕ: Добавляем в интерфейс флаги для статуса
export interface CalendarEvent {
  catId: string;
  catName: string;
  catAvatarUrl: string | null;
  date: Date;
  stage: 'first' | 'second' | 'annual';
  stageText: string;
  isProjected: boolean;
  isOverdue: boolean; // Просрочено ли
  isUpcoming: boolean; // Меньше 14 дней?
}

const STAGE_DETAILS = {
  first: { text: 'Первая вакцинация' },
  second: { text: 'Ревакцинация' },
  annual: { text: 'Ежегодная вакцинация' },
};

/**
 * Генерирует массив всех событий вакцинации (прошедших и будущих) для всех кошек.
 * @param cats - Массив объектов кошек.
 * @returns - Массив событий для календаря.
 */
export function generateVaccinationEvents(cats: Cat[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const now = new Date();

  cats.forEach(cat => {
    const vaccinations = (cat.treatments ?? [])
      .filter(t => t.type === TreatmentType.VACCINATION && t.vaccinationStage)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (vaccinations.length === 0) {
      return;
    }

    // 1. Добавляем все фактические прививки в календарь
    vaccinations.forEach(v => {
      const stage = (v.vaccinationStage === 'revaccination' ? 'annual' : v.vaccinationStage) as 'first' | 'second' | 'annual';
      events.push({
        catId: cat.id,
        catName: cat.name,
        catAvatarUrl: cat.avatarUrl,
        date: new Date(v.date),
        stage: stage,
        stageText: STAGE_DETAILS[stage].text,
        isProjected: false,
        isOverdue: false, // Прошедшие события не могут быть просроченными
        isUpcoming: false, // или предстоящими
      });
    });

    // 2. Прогнозируем следующие шаги на основе ПОСЛЕДНЕЙ прививки
    const lastVaccination = vaccinations[vaccinations.length - 1];
    const lastVaccinationDate = new Date(lastVaccination.date);
    
    let projectedEvent: Omit<CalendarEvent, 'isOverdue' | 'isUpcoming'> | null = null;

    if (lastVaccination.vaccinationStage === 'first') {
        const secondStageDate = addMonths(lastVaccinationDate, 1);
        projectedEvent = {
            catId: cat.id, catName: cat.name, catAvatarUrl: cat.avatarUrl,
            date: secondStageDate, stage: 'second', stageText: STAGE_DETAILS.second.text, isProjected: true
        };
    } else if (lastVaccination.vaccinationStage === 'second') {
        const annualStageDate = addYears(lastVaccinationDate, 1);
        projectedEvent = {
            catId: cat.id, catName: cat.name, catAvatarUrl: cat.avatarUrl,
            date: annualStageDate, stage: 'annual', stageText: STAGE_DETAILS.annual.text, isProjected: true
        };
    } else if (lastVaccination.vaccinationStage === 'revaccination') {
        const nextAnnualDate = addYears(lastVaccinationDate, 1);
        projectedEvent = {
            catId: cat.id, catName: cat.name, catAvatarUrl: cat.avatarUrl,
            date: nextAnnualDate, stage: 'annual', stageText: STAGE_DETAILS.annual.text, isProjected: true
        };
    }
    
    // Если у нас есть спрогнозированное событие, вычисляем его статус
    if (projectedEvent) {
        const isOverdue = isPast(projectedEvent.date) && !isToday(projectedEvent.date);
        const daysUntil = differenceInDays(projectedEvent.date, now);
        // Считаем событие "предстоящим", если до него от 0 до 14 дней
        const isUpcoming = !isOverdue && daysUntil >= 0 && daysUntil <= 14;

        events.push({
            ...projectedEvent,
            isOverdue,
            isUpcoming,
        });
    }
  });

  return events;
}