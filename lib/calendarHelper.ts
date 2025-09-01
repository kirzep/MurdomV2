// lib/calendarHelper.ts
import { Cat, Treatment, TreatmentType } from '@/types';
import { addDays, addYears, isPast, isToday as isTodayFns, differenceInDays, isAfter, startOfDay, isSameDay } from 'date-fns';

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
  canConfirmVaccination: boolean;
}

const STAGE_DETAILS = {
  first: { text: 'Первичная вакцинация' },
  second: { text: 'Ревакцинация' },
  annual: { text: 'Ежегодная вакцинация' },
};

export function generateVaccinationEvents(cats: Cat[]): CalendarEvent[] {
  const allEvents: CalendarEvent[] = [];
  const today = startOfDay(new Date());

  const activeCats = cats.filter(cat => cat.status === 'В приюте');

  activeCats.forEach(cat => {
    const treatments = cat.treatments ?? [];
    const allVaccinations = treatments
      .filter(t => t.type === TreatmentType.VACCINATION && t.vaccinationStage)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 1. Добавляем реальные (уже сделанные) прививки в календарь
    allVaccinations.forEach(v => {
      const stage = (v.vaccinationStage === 'revaccination' ? 'annual' : v.vaccinationStage) as 'first' | 'second' | 'annual';
      const eventDate = startOfDay(new Date(v.date));
      allEvents.push({
        catId: cat.id,
        catName: cat.name,
        catAvatarUrl: cat.avatarUrl,
        date: eventDate,
        stage: stage,
        stageText: STAGE_DETAILS[stage].text,
        isProjected: false,
        isOverdue: false,
        isUpcoming: false,
        canConfirmVaccination: false,
      });
    });

    // 2. Рассчитываем прогнозируемые (будущие) события
    const pastVaccinations = allVaccinations.filter(v => !isAfter(startOfDay(new Date(v.date)), today));
    const firstVaccination = pastVaccinations.find(v => v.vaccinationStage === 'first');
    const secondVaccination = pastVaccinations.find(v => v.vaccinationStage === 'second');
    const lastAnnualVaccination = pastVaccinations.filter(v => v.vaccinationStage === 'revaccination').pop();
    
    let projectedDate: Date | null = null;
    let projectedStage: 'second' | 'annual' | null = null;

    if (lastAnnualVaccination) {
        projectedDate = addYears(new Date(lastAnnualVaccination.date), 1);
        projectedStage = 'annual';
    } else if (firstVaccination) {
        if (!secondVaccination) {
            projectedDate = addDays(new Date(firstVaccination.date), 28);
            projectedStage = 'second';
        } else {
            projectedDate = addYears(new Date(firstVaccination.date), 1);
            projectedStage = 'annual';
        }
    }
    
    if (projectedDate && projectedStage) {
        const hasMatchingRealEvent = allVaccinations.some(v => 
            (v.vaccinationStage === projectedStage || (projectedStage === 'annual' && v.vaccinationStage === 'revaccination')) && 
            isSameDay(new Date(v.date), projectedDate)
        );

        if (!hasMatchingRealEvent) {
             const isOverdue = isPast(projectedDate) && !isTodayFns(projectedDate);
             const daysUntil = differenceInDays(projectedDate, today);
             
             // ИСПРАВЛЕНО: Логика появления галочки теперь соответствует вашим уведомлениям (30 дней)
             const isUpcoming = !isOverdue && daysUntil >= 0 && daysUntil <= 30;
    
            allEvents.push({
                catId: cat.id,
                catName: cat.name,
                catAvatarUrl: cat.avatarUrl,
                date: projectedDate,
                stage: projectedStage,
                stageText: STAGE_DETAILS[projectedStage].text,
                isProjected: true,
                isOverdue,
                isUpcoming,
                canConfirmVaccination: isOverdue || isUpcoming,
            });
        }
    }
  });

  return allEvents;
}