// lib/calendarHelper.ts
import { Cat, TreatmentType } from '@/types';
import { addMonths, addYears, isPast, isToday, differenceInDays } from 'date-fns';

export interface CalendarEvent {
  catId: string;
  catName: string;
  catAvatarUrl: string | null;
  date: Date;
  stage: 'first' | 'second' | 'annual';
  stageText: string;
  isProjected: boolean;
  isOverdue: boolean;
  isUpcoming: boolean;
}

const STAGE_DETAILS = {
  first: { text: 'Первичная вакцинация' },
  second: { text: 'Ревакцинация' },
  annual: { text: 'Ежегодная вакцинация' },
};

export function generateVaccinationEvents(cats: Cat[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const now = new Date();

  cats.forEach(cat => {
    const vaccinations = (cat.treatments ?? [])
      .filter(t => t.type === TreatmentType.VACCINATION && t.vaccinationStage)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
        isOverdue: false,
        isUpcoming: false,
      });
    });

    const firstVaccination = vaccinations.find(v => v.vaccinationStage === 'first');
    if (!firstVaccination) return;

    const secondVaccination = vaccinations.find(v => v.vaccinationStage === 'second');
    
    let projectedDate: Date | null = null;
    let projectedStage: 'second' | 'annual' | null = null;
    let isTrulyOverdue = false; // Дополнительная переменная для статуса

    // Сценарий 1: Прогнозируем вторую прививку
    if (!secondVaccination) {
      projectedDate = addMonths(new Date(firstVaccination.date), 1);
      projectedStage = 'second';
      isTrulyOverdue = isPast(projectedDate) && !isToday(projectedDate);
    } 
    // Сценарий 2: Прогнозируем ежегодную
    else {
      const annualVaccinations = vaccinations.filter(v => v.vaccinationStage === 'revaccination');
      const baseDate = annualVaccinations.length > 0
          ? new Date(annualVaccinations[annualVaccinations.length - 1].date)
          : new Date(firstVaccination.date);

      const firstPossibleDueDate = addYears(baseDate, 1);
      let actualDueDate = new Date(firstPossibleDueDate.getTime());
      while (isPast(actualDueDate) && !isToday(actualDueDate)) {
        actualDueDate = addYears(actualDueDate, 1);
      }
      
      projectedDate = actualDueDate;
      projectedStage = 'annual';
      isTrulyOverdue = isPast(firstPossibleDueDate) && !isToday(firstPossibleDueDate);
    }

    if (projectedDate && projectedStage) {
        const daysUntil = differenceInDays(projectedDate, now);
        const isUpcoming = !isTrulyOverdue && daysUntil >= 0 && daysUntil <= 14;

        events.push({
            catId: cat.id,
            catName: cat.name,
            catAvatarUrl: cat.avatarUrl,
            date: projectedDate,
            stage: projectedStage,
            stageText: STAGE_DETAILS[projectedStage].text,
            isProjected: true,
            isOverdue: isTrulyOverdue,
            isUpcoming,
        });
    }
  });

  return events;
}